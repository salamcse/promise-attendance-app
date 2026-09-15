const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://dev.promiseassets.com/api/v1';

export async function apiRequest(endpoint, { method = 'GET', body, token } = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data?.message || data?.error || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }

  return data;
}

export function getErrorMessage(error) {
  return error?.message || 'Something went wrong. Please try again.';
}
