const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 PromiseAttendanceApp';

function getSanitizedBaseUrl() {
  let url = (process.env.EXPO_PUBLIC_API_URL || 'https://spider.promiseassets.com/api/v1').trim();
  url = url.replace(/\/+$/, '');
  if (url.endsWith('/hrm')) {
    url = url.slice(0, -4);
  }
  return url;
}

const BASE_URL = getSanitizedBaseUrl();

export async function apiRequest(
  endpoint,
  { method = 'GET', body, token, timeoutMs = 15000, headers = {} } = {}
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${BASE_URL}${cleanEndpoint}`;

  try {
    const response = await fetch(fullUrl, {
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': DEFAULT_USER_AGENT,
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      let msg = data?.message || data?.error;
      if (!msg && data?.errors && typeof data.errors === 'object') {
        const firstKey = Object.keys(data.errors)[0];
        if (firstKey && Array.isArray(data.errors[firstKey]) && data.errors[firstKey].length > 0) {
          msg = data.errors[firstKey][0];
        }
      }
      const error = new Error(msg || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeoutErr = new Error('Network request timed out. Please check your internet connection.');
      timeoutErr.code = 'TIMEOUT';
      throw timeoutErr;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export function getErrorMessage(error) {
  if (!error) return 'An unexpected error occurred.';
  const rawMsg = [
    typeof error === 'string' ? error : '',
    error?.message,
    error?.cause?.message,
    String(error || ''),
  ]
    .filter(Boolean)
    .join(' ');

  const lower = rawMsg.toLowerCase();

  if (
    lower.includes('unknownhostexception') ||
    lower.includes('unable to resolve host') ||
    lower.includes('no address associated with hostname') ||
    lower.includes('network request failed') ||
    lower.includes('failed to fetch') ||
    lower.includes('fetch failed') ||
    lower.includes('enotfound') ||
    lower.includes('econnrefused') ||
    lower.includes('econnreset') ||
    lower.includes('eai_again') ||
    lower.includes('err_internet_disconnected')
  ) {
    return 'No internet connection. Please check your mobile data or Wi-Fi connection.';
  }

  if (error?.code === 'TIMEOUT' || lower.includes('timed out') || lower.includes('timeout')) {
    return 'Network request timed out. Please check your internet connection.';
  }

  return (typeof error === 'string' ? error : error.message) || 'Something went wrong. Please try again.';
}
