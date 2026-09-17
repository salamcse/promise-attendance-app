import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from './apiClient';

const TOKEN_KEY = '@promise_auth_token';
const USER_KEY = '@promise_auth_user';

export async function login(identifier, password) {
  const payload = { identifier: identifier.trim(), password };

  const data = await apiRequest('/login', {
    method: 'POST',
    body: payload,
  });

  const token = data.token || data.access_token || data.user?.accessToken;
  const user = data.user || { id: identifier, name: identifier };

  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [USER_KEY, JSON.stringify(user)],
  ]);

  return { token, user };
}

export async function logout(token) {
  try {
    if (token) {
      await apiRequest('/logout', { method: 'POST', token });
    }
  } catch {
    // Ignore network failure during logout
  } finally {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  }
}

export async function restoreSession() {
  const [token, rawUser] = await Promise.all([
    AsyncStorage.getItem(TOKEN_KEY),
    AsyncStorage.getItem(USER_KEY),
  ]);

  if (!token || !rawUser) return null;

  try {
    return { token, user: JSON.parse(rawUser) };
  } catch {
    return null;
  }
}
