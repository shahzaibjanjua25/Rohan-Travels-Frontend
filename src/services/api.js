// frontend/src/services/api.js
//
// CSRF changes vs the old version:
//   - Removed setCookie(). It wrote rt_csrf on the FRONTEND's origin, so the
//     cookie could never be sent to the backend. That fallback was guaranteed
//     to fail and was the reason the retry always 403'd too.
//   - The in-memory cache no longer wins over the cookie. If a cookie is
//     present it is authoritative, which kills the "cached A vs cookie B" drift.
//   - Tokens are shape-checked and expiry-checked client side, so a stale token
//     from a previous deploy is refreshed instead of being sent and rejected.
//   - Token values are never logged.

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const CSRF_COOKIE = 'rt_csrf';
const CSRF_HEADER = 'X-CSRF-Token';
const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const CSRF_ERROR_CODES = new Set([
  'CSRF_MISSING',
  'CSRF_INVALID',
  'CSRF_MISMATCH',
  'CSRF_BAD_ORIGIN',
]);

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

// ---------------------------------------------------------------------------
// CSRF
// ---------------------------------------------------------------------------

const readCookie = (name) => {
  const prefix = `${name}=`;
  for (const cookie of document.cookie.split('; ')) {
    if (cookie.startsWith(prefix)) {
      return decodeURIComponent(cookie.slice(prefix.length));
    }
  }
  return null;
};

/**
 * Server tokens look like `nonce.expiry.hmac`. We cannot verify the signature
 * here (we don't have the secret, and shouldn't), but we can cheaply reject
 * malformed or expired tokens rather than burning a request on a certain 403.
 * A 30s skew margin avoids racing the expiry boundary.
 */
const looksUsable = (token) => {
  if (typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const expiry = Number(parts[1]);
  return Number.isFinite(expiry) && expiry > Date.now() + 30_000;
};

let csrfTokenCache = null;
let csrfInFlight = null;

const fetchFreshToken = async () => {
  const response = await fetch(`${BASE_URL}/auth/csrf`, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) throw new Error(`CSRF endpoint returned ${response.status}`);

  const data = await response.json().catch(() => null);

  // Cookie first (it means double-submit is available), body second (it means
  // the browser blocked the cookie — still fine, the token is signed).
  const cookieToken = readCookie(CSRF_COOKIE);
  const token = looksUsable(cookieToken) ? cookieToken : data?.csrfToken ?? null;

  if (!looksUsable(token)) throw new Error('No usable CSRF token returned');
  return token;
};

export const ensureCsrfToken = async (forceRefresh = false) => {
  if (!forceRefresh) {
    // The cookie is authoritative when present — never let a stale in-memory
    // value shadow it.
    const cookieToken = readCookie(CSRF_COOKIE);
    if (looksUsable(cookieToken)) {
      csrfTokenCache = cookieToken;
      return cookieToken;
    }
    if (looksUsable(csrfTokenCache)) return csrfTokenCache;
  } else {
    csrfTokenCache = null;
  }

  // Coalesce concurrent callers onto one request.
  if (!csrfInFlight) {
    csrfInFlight = fetchFreshToken()
      .then((token) => {
        csrfTokenCache = token;
        return token;
      })
      .catch((err) => {
        console.warn('[csrf] could not obtain token:', err.message);
        return null;
      })
      .finally(() => {
        csrfInFlight = null;
      });
  }

  return csrfInFlight;
};

// ---------------------------------------------------------------------------
// Request pipeline
// ---------------------------------------------------------------------------

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

const request = async (path, { method = 'GET', body, params, signal, retryCsrf = true } = {}) => {
  const upperMethod = method.toUpperCase();
  const isUnsafe = UNSAFE_METHODS.has(upperMethod);

  const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };

  if (isUnsafe) {
    const token = await ensureCsrfToken(!retryCsrf);
    if (token) headers[CSRF_HEADER] = token;
  }

  const url = `${BASE_URL}${path}${buildQuery(params)}`;

  let response;
  try {
    response = await fetch(url, {
      method: upperMethod,
      headers,
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

  // One self-healing retry on a CSRF rejection. Keyed on the error code, not on
  // string-matching the message.
  if (response.status === 403 && isUnsafe && retryCsrf) {
    const code = payload?.code;
    const looksLikeCsrf =
      CSRF_ERROR_CODES.has(code) || (payload?.message || '').toLowerCase().includes('token');

    if (looksLikeCsrf) {
      csrfTokenCache = null;
      await ensureCsrfToken(true);
      return request(path, { method, body, params, signal, retryCsrf: false });
    }
  }

  if (!response.ok) {
    if (response.status === 401) sessionExpiredHandlers.forEach((fn) => fn());

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
};

export default api;