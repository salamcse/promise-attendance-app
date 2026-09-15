import { apiRequest } from './apiClient';
import {
  saveAuthSession,
  getStoredToken,
  getStoredUser,
  clearAuthSession,
} from './storageService';

function normalizeAuthUser(data, identifier) {
  const user = data.user ?? {};

  const normalizedUser = {
    id: user.id,
    name: user.name ?? user.username ?? identifier,
    email: user.email ?? null,
    username: user.username ?? identifier,
  };

  if (!normalizedUser.id) {
    throw new Error('Authentication succeeded but user ID was not returned.');
  }

  return normalizedUser;
}

function extractToken(data) {
  return data.token ?? data.access_token ?? data.user?.accessToken ?? null;
}

export async function login(identifier, password) {
  const cleanIdentifier = identifier?.trim();

  if (!cleanIdentifier || !password) {
    throw new Error('Username or email and password are required.');
  }

  const isEmail = cleanIdentifier.includes('@');
  const payload = isEmail
    ? { email: cleanIdentifier.toLowerCase(), password }
    : { username: cleanIdentifier, password };

  const data = await apiRequest('/login', {
    method: 'POST',
    body: payload,
  });

  const token = extractToken(data);

  if (!token) {
    throw new Error(
      'Authentication succeeded but no access token was returned by the server.'
    );
  }

  const user = normalizeAuthUser(data, cleanIdentifier);

  await saveAuthSession(token, user);

  return { token, user };
}

export async function logout(token) {
  try {
    if (token) {
      await apiRequest('/logout', {
        method: 'POST',
        token,
        timeoutMs: 6000,
      });
    }
  } catch (error) {
    console.warn('[AuthService] Backend logout failed:', error?.message);
  } finally {
    await clearAuthSession();
  }
}

export async function restoreSession() {
  const [token, user] = await Promise.all([
    getStoredToken(),
    getStoredUser(),
  ]);

  if (!token || !user?.id) {
    return null;
  }

  return { token, user };
}
