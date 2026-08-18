// frontend/src/services/api.js
// Use environment variable for API URL
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const CSRF_COOKIE = 'rt_csrf';
const CSRF_HEADER = 'X-CSRF-Token';
const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export class ApiError extends Error {
  constructor(message, { status, details, code } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details || [];
    this.code = code;
  }

  get fieldErrors() {
    return Object.fromEntries(this.details.map((d) => [d.field, d.message]));
  }
}

// frontend/src/services/api.js

const readCookie = (name) => {
  // Only works for same-domain cookies
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

// Add a fallback - store CSRF token in a variable
let csrfTokenCache = null;

export const ensureCsrfToken = async () => {
  // First check cache
  if (csrfTokenCache) return csrfTokenCache;

  // Then check cookie
  const existing = readCookie(CSRF_COOKIE);
  if (existing) {
    csrfTokenCache = existing;
    return existing;
  }

  // If we're already fetching, wait for that
  if (csrfPrimer) {
    await csrfPrimer;
    const token = readCookie(CSRF_COOKIE);
    if (token) csrfTokenCache = token;
    return token;
  }

  // Start a new fetch
  csrfPrimer = (async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/csrf`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn('CSRF fetch failed:', response.status);
        return null;
      }

      // Try to read from cookie
      let token = readCookie(CSRF_COOKIE);

      // If cookie is not readable (cross-domain), try to get it from response body
      if (!token) {
        try {
          const data = await response.json();
          if (data && data.csrfToken) {
            token = data.csrfToken;
            csrfTokenCache = token;
            console.log('📦 CSRF token from response body:', token.substring(0, 10) + '...');
          }
        } catch (e) {
          console.warn('Could not parse CSRF response:', e);
        }
      }

      if (token) csrfTokenCache = token;
      return token;
    } catch (error) {
      console.error('CSRF fetch error:', error);
      return null;
    } finally {
      csrfPrimer = null;
    }
  })();

  return csrfPrimer;
};

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

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  // CSRF handling for unsafe methods
  if (UNSAFE_METHODS.has(upperMethod)) {
    const token = await ensureCsrfToken();
    if (token) {
      headers[CSRF_HEADER] = token;
    } else {
      console.warn(`CSRF token not available for ${upperMethod} ${path}`);
    }
  }

  const url = `${BASE_URL}${path}${buildQuery(params)}`;

  let response;
  try {
    response = await fetch(url, {
      method: upperMethod,
      headers,
      credentials: 'include', // Important: sends cookies
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Cannot reach the server. Check your connection and try again.', {
      status: 0,
    });
  }

  // Handle 204 No Content
  if (response.status === 204) return null;

  const isJson = (response.headers.get('content-type') || '').includes('application/json');
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    // Session expired
    if (response.status === 401) {
      sessionExpiredHandlers.forEach((fn) => fn());
    }

    throw new ApiError(payload?.message || `Request failed (${response.status})`, {
      status: response.status,
      details: payload?.details,
      code: payload?.code,
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
  // Expose for debugging
  _readCookie: readCookie,
};

export default api;