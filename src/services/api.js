// frontend/src/services/api.js
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

const readCookie = (name) => {
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    const [key, value] = cookie.split('=');
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return null;
};

// ✅ Set cookie with proper options
const setCookie = (name, value, days = 1) => {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  // Try with Secure and SameSite=None first (for production)
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=None; Secure`;
  // Also set without Secure as fallback (for local development)
  if (window.location.hostname === 'localhost') {
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
  }
};

let csrfTokenCache = null;
let csrfPrimer = null;
let csrfRetryCount = 0;
const MAX_CSRF_RETRIES = 2;

export const ensureCsrfToken = async (forceRefresh = false) => {
  // Force refresh if requested
  if (forceRefresh) {
    console.log('🔄 Forcing CSRF refresh');
    csrfTokenCache = null;
    csrfPrimer = null;
  }

  // 1. Check cache
  if (csrfTokenCache && !forceRefresh) {
    console.log('🔑 Using cached CSRF token');
    return csrfTokenCache;
  }

  // 2. Check cookie
  const cookieToken = readCookie(CSRF_COOKIE);
  if (cookieToken && !forceRefresh) {
    csrfTokenCache = cookieToken;
    console.log('🍪 CSRF token from cookie:', cookieToken.substring(0, 10) + '...');
    return cookieToken;
  }

  // 3. If we're already fetching, wait
  if (csrfPrimer) {
    console.log('⏳ Waiting for existing CSRF fetch...');
    await csrfPrimer;
    return csrfTokenCache || readCookie(CSRF_COOKIE);
  }

  // 4. Start a new fetch
  console.log('🔄 Fetching new CSRF token...');
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
        throw new Error(`CSRF fetch failed: ${response.status}`);
      }

      // Try to get token from cookie first
      let token = readCookie(CSRF_COOKIE);

      // If not in cookie, try response body
      if (!token) {
        try {
          const data = await response.json();
          token = data.csrfToken || data.token || null;
          if (token) {
            console.log('📦 CSRF token from response body');
            // Set the cookie manually
            setCookie(CSRF_COOKIE, token);
          }
        } catch (e) {
          console.warn('Could not parse CSRF response:', e);
        }
      }

      if (token) {
        csrfTokenCache = token;
        console.log('✅ CSRF token obtained:', token.substring(0, 10) + '...');
        csrfRetryCount = 0;
        return token;
      }

      console.warn('⚠️ No CSRF token found');
      csrfRetryCount++;
      return null;
    } catch (error) {
      console.error('❌ CSRF fetch error:', error);
      csrfRetryCount++;
      return null;
    } finally {
      csrfPrimer = null;
    }
  })();

  const result = await csrfPrimer;
  
  // If we failed and have retries left, try again with force refresh
  if (!result && csrfRetryCount < MAX_CSRF_RETRIES) {
    console.log(`🔄 CSRF retry ${csrfRetryCount + 1}/${MAX_CSRF_RETRIES}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return ensureCsrfToken(true);
  }

  return result;
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

const request = async (path, { method = 'GET', body, params, signal, retryCsrf = true } = {}) => {
  const upperMethod = method.toUpperCase();
  const isUnsafe = UNSAFE_METHODS.has(upperMethod);

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  // CSRF handling for unsafe methods
  if (isUnsafe) {
    const token = await ensureCsrfToken();
    if (token) {
      headers[CSRF_HEADER] = token;
      console.log(`🛡️ CSRF header set for ${upperMethod} ${path}`, {
        tokenPrefix: token.substring(0, 10) + '...',
        tokenFull: token,
      });
    } else {
      console.warn(`⚠️ CSRF token not available for ${upperMethod} ${path}`);
    }
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

  // Handle 204 No Content
  if (response.status === 204) return null;

  const isJson = (response.headers.get('content-type') || '').includes('application/json');
  const payload = isJson ? await response.json().catch(() => null) : null;

  // If we get a CSRF error and we haven't retried yet, try once more
  if (response.status === 403 && isUnsafe && retryCsrf) {
    const errorMsg = payload?.message || '';
    if (errorMsg.toLowerCase().includes('csrf')) {
      console.log('🔄 CSRF error, retrying with fresh token...');
      // Clear cached token and retry
      csrfTokenCache = null;
      // Also try to clear the cookie
      document.cookie = `${CSRF_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      await ensureCsrfToken(true);
      return request(path, { method, body, params, signal, retryCsrf: false });
    }
  }

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
  _setCookie: setCookie,
};

export default api;