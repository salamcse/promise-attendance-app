let rawUrl = process.env.EXPO_PUBLIC_API_URL || 'https://dev.promiseassets.com/api/v1';
let cleanedUrl = rawUrl.trim().replace(/\/+$/, '');
if (cleanedUrl.endsWith('/hrm')) {
  cleanedUrl = cleanedUrl.slice(0, -4);
}
const BASE_URL = cleanedUrl;

export async function apiRequest(endpoint, { method = 'GET', body, token, timeoutMs = 15000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data?.message || data?.error || `Request failed (${response.status})`);
      error.status = response.status;
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
  return error?.message || 'Something went wrong. Please try again.';
}
