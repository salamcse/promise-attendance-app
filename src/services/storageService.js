import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';

function serializeUser(user) {
  return JSON.stringify(user);
}

export async function saveAuthSession(token, user) {
  if (!token || !user) {
    throw new Error('Token and user are required to save an auth session.');
  }

  await AsyncStorage.multiSet([
    [STORAGE_KEYS.AUTH_TOKEN, token],
    [STORAGE_KEYS.AUTH_USER, serializeUser(user)],
  ]);
}

export async function getStoredToken() {
  return AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}

export async function getStoredUser() {
  const rawUser = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_USER);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

export async function clearAuthSession() {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.AUTH_TOKEN,
    STORAGE_KEYS.AUTH_USER,
  ]);
}
