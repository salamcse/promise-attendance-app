const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36';

function getSanitizedBaseUrl() {
  let url = (process.env.EXPO_PUBLIC_API_URL || 'https://spider.promiseassets.com/api/v1').trim();
  url = url.replace(/\/+$/, '');
  if (url.endsWith('/hrm')) {
    url = url.slice(0, -4);
  }
  return url;
}

const BASE_URL = getSanitizedBaseUrl();

const STATUS_MESSAGES = {
  360: 'Network gateway issue (360). Please try again.',
  401: 'Session expired. Please log in again.',
  403: 'Access denied. Please check your network or VPN.',
  404: 'Server endpoint not found (404).',
  422: 'Invalid request data. Please check your input.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Internal server error (500). Please try again later.',
  502: 'Server is temporarily unavailable (502).',
  503: 'Service unavailable (503). Server is under maintenance.',
  504: 'Gateway timeout (504). Please try again.',
};

/**
 * Extract clean error message from backend JSON response
 */
function extractBackendMessage(data) {
  if (!data || typeof data !== 'object') return null;
  if (typeof data.message === 'string' && data.message.trim()) return data.message.trim();
  if (typeof data.error === 'string' && data.error.trim()) return data.error.trim();
  if (data.errors && typeof data.errors === 'object') {
    const firstVal = Object.values(data.errors).flat()[0];
    if (typeof firstVal === 'string' && firstVal.trim()) return firstVal.trim();
  }
  return null;
}

export async function apiRequest(
  endpoint,
  { method = 'GET', body, token, timeoutMs = 20000, headers = {}, retries = 1 } = {}
) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${BASE_URL}${cleanEndpoint}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(fullUrl, {
        method,
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'User-Agent': DEFAULT_USER_AGENT,
          'Accept-Language': 'en-US,en;q=0.9',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const backendMessage = extractBackendMessage(data);
        const error = new Error(backendMessage || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        error.backendMessage = backendMessage;
        throw error;
      }

      return data;
    } catch (err) {
      const isAbort = err.name === 'AbortError';
      const isNetworkDrop =
        isAbort ||
        String(err.message || '').toLowerCase().includes('network request failed') ||
        String(err.message || '').toLowerCase().includes('failed to fetch');

      // Auto-retry once on temporary network drops before showing error
      if (attempt < retries && isNetworkDrop) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        continue;
      }

      if (isAbort) {
        const timeoutErr = new Error('Request timed out. Please check your internet connection.');
        timeoutErr.code = 'TIMEOUT';
        throw timeoutErr;
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}

export function getErrorMessage(error) {
  if (!error) return 'An unexpected error occurred. Please try again.';

  // 1. Direct message from backend
  const backendMsg = error.backendMessage || extractBackendMessage(error.data);
  if (backendMsg && backendMsg.trim()) {
    if (backendMsg.includes('Imunify360') || backendMsg.includes('bot-protection')) {
      return 'Blocked by server firewall (Imunify360). Please turn off VPN or ask admin to whitelist the API.';
    }
    return backendMsg.trim();
  }

  // 2. GPS / Location Errors
  if (error.code === 'LOCATION_SERVICES_DISABLED') return 'Location is turned off. Please enable GPS on your device.';
  if (error.code === 'LOCATION_PERMISSION_DENIED') return 'Location permission is required to record attendance.';
  if (error.code === 'LOCATION_FETCH_FAILED') return 'Unable to get GPS location. Please try again in an open area.';

  // 3. Network & Connection Errors
  const raw = String(error.message || error || '').toLowerCase();
  if (error.code === 'TIMEOUT' || raw.includes('timed out') || raw.includes('timeout')) {
    return 'Request timed out. Please check your internet connection.';
  }
  if (
    raw.includes('unknownhostexception') ||
    raw.includes('unable to resolve host') ||
    raw.includes('network request failed') ||
    raw.includes('failed to fetch') ||
    raw.includes('fetch failed')
  ) {
    return 'No internet connection. Please check your mobile data or Wi-Fi.';
  }

  // 4. HTTP Status Code Fallbacks
  const status = Number(error.status || error.statusCode || 0);
  if (status && STATUS_MESSAGES[status]) {
    return STATUS_MESSAGES[status];
  }
  if (status >= 300 && status < 400) {
    return `Server redirect issue (${status}). Please try again.`;
  }

  // 5. Fallback to direct error message if valid
  if (error.message && !error.message.startsWith('Request failed with status')) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}
