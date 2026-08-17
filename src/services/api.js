// api.js in frontend /src/services/api.js
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const CSRF_COOKIE = 'rt_csrf';
const CSRF_HEADER = 'X-CSRF-Token';
const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Error carrying the server's status and field-level details, so forms can
 * highlight the offending input instead of showing one generic message.
 */
export class ApiError extends Error {
  constructor(message, { status, details, code } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details || [];
    this.code = code;
  }

  /** { email: 'Please provide a valid email address', ... } */
  get fieldErrors() {
    return Object.fromEntries(this.details.map((d) => [d.field, d.message]));
  }
}

const readCookie = (name) => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

/**
 * Make sure a CSRF cookie exists before a state-changing request.
 *
 * The backend sets it on any request, but a freshly loaded tab that submits a
 * login form before making any other call would have nothing to echo back and
 * would get a 403.
 */
let csrfPrimer = null;
const ensureCsrfToken = async () => {
  const existing = readCookie(CSRF_COOKIE);
  if (existing) return existing;

  // Share one in-flight request rather than firing several from parallel calls.
  if (!csrfPrimer) {
    csrfPrimer = fetch(`${BASE_URL}/auth/csrf`, { credentials: 'include' })
      .catch(() => null)
      .finally(() => {
        csrfPrimer = null;
      });
  }
  await csrfPrimer;
  return readCookie(CSRF_COOKIE);
};

/** Listeners notified when the server reports the session is gone. */
const sessionExpiredHandlers = new Set();
export const onSessionExpired = (fn) => {
  sessionExpiredHandlers.add(fn);
  return () => sessionExpiredHandlers.delete(fn);
};

const buildQuery = (params) => {
  if (!params) return '';
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.append(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
};

const request = async (path, { method = 'GET', body, params, signal } = {}) => {
  const upperMethod = method.toUpperCase();

  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  if (UNSAFE_METHODS.has(upperMethod)) {
    const token = await ensureCsrfToken();
    if (token) headers[CSRF_HEADER] = token;
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}${buildQuery(params)}`, {
      method: upperMethod,
      headers,
      // Without this the auth cookie is never sent and every call is a 401.
      credentials: 'include',
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Cannot reach the server. Check your connection and try again.', {
      status: 0,
    });
  }

  if (response.status === 204) return null;

  const isJson = (response.headers.get('content-type') || '').includes('application/json');
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    // 401 means the session is gone — expired, revoked, or the password was
    // changed elsewhere. Anything holding user state needs to know.
    if (response.status === 401) {
      sessionExpiredHandlers.forEach((fn) => fn());
    }

    throw new ApiError(payload?.message || `Request failed (${response.status})`, {
      status: response.status,
      details: payload?.details,
    });
  }

  return payload;
};

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
  primeCsrf: ensureCsrfToken,
};

export default api;
