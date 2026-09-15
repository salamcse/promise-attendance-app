import { API_BASE_URL, API_TIMEOUT_MS } from '../constants/config';

export class ApiError extends Error {
  constructor({
    status = 0,
    code = 'UNKNOWN_ERROR',
    message = 'Something went wrong.',
    data = null,
  }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

function buildUrl(endpoint, params) {
  let fullUrl = `${API_BASE_URL}${endpoint}`;

  if (params && typeof params === 'object') {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
    }
  }

  return fullUrl;
}

function parseResponseBody(text) {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function getApiError(response, data) {
  let code = 'CLIENT_ERROR';

  if (response.status === 401 || response.status === 403) {
    code = 'AUTH_ERROR';
  } else if (response.status >= 500) {
    code = 'SERVER_ERROR';
  }

  return new ApiError({
    status: response.status,
    code,
    message:
      data?.message ??
      data?.error ??
      `Request failed with status ${response.status}`,
    data,
  });
}

export async function apiRequest(endpoint, options = {}) {
  const {
    method = 'GET',
    body,
    token,
    params,
    headers = {},
    timeoutMs = API_TIMEOUT_MS,
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  const requestHeaders = {
    Accept: 'application/json',
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  try {
    const response = await fetch(buildUrl(endpoint, params), {
      method,
      headers: requestHeaders,
      body:
        body === undefined
          ? undefined
          : typeof body === 'string'
          ? body
          : JSON.stringify(body),
      signal: controller.signal,
    });

    const responseText = await response.text();
    const data = parseResponseBody(responseText);

    if (!response.ok) {
      throw getApiError(response, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error?.name === 'AbortError') {
      throw new ApiError({
        code: 'TIMEOUT_ERROR',
        message: 'The request timed out. Please try again.',
      });
    }

    throw new ApiError({
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to server. Please check your internet connection.',
      data: error,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
