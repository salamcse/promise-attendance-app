import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from './apiClient';

const TOKEN_KEY = '@promise_auth_token';
const USER_KEY = '@promise_auth_user';

export async function login(email, password) {
  const payload = { email: email.trim(), password };

  const data = await apiRequest('/hrm/login', {
    method: 'POST',
    body: payload,
  });

  const responseUser = data?.user || data?.employee || data?.data?.user || data;
  const token = responseUser?.accessToken || data?.token || data?.access_token || data?.data?.token;

  if (!token) {
    throw new Error('Authentication failed: Access token missing in response');
  }

  const user = {
    id: responseUser?.id || responseUser?.phone || email.trim(),
    name: responseUser?.name || email.trim(),
    email: responseUser?.email || email.trim(),
    phone: responseUser?.phone || '',
    expiresIn: responseUser?.expiresIn || null,
    ...responseUser,
  };

  delete user.accessToken;

  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [USER_KEY, JSON.stringify(user)],
  ]);

  return { token, user };
}

export async function logout(token) {
  try {
    if (token) {
      await apiRequest('/hrm/logout', { method: 'POST', token });
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
