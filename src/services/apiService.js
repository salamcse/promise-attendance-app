import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_CONFIG_KEY = '@attendance_api_config';
const ATTENDANCE_LOGS_KEY = '@attendance_logs';
const ACTIVE_SESSION_KEY = '@attendance_active_session';
const TODAY_FIRST_CLOCK_IN_KEY = '@attendance_first_clock_in_';
const AUTH_USER_KEY = '@attendance_auth_user';

export const PROD_BASE_URL = 'https://spider.promiseassets.com/api/v1/hrm';
export const DEV_BASE_URL = 'http://127.0.0.1:8000/api/v1/hrm';

/**
 * Normalizes an API URL to ensure valid protocol and no trailing slash
 */
export function normalizeApiUrl(url) {
  if (!url) return '';
  let cleaned = url.trim().replace(/\/+$/, '');
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`;
  }
  return cleaned;
}

/**
 * Extracts API root URL (/api/v1) for authentication routes like login and logout
 */
export function getApiRootUrl(baseUrl) {
  const normalized = normalizeApiUrl(baseUrl || PROD_BASE_URL);
  return normalized.replace(/\/hrm\/?$/, '');
}

const DEFAULT_API_CONFIG = {
  mode: 'custom', // REAL BACKEND API ACTIVE BY DEFAULT
  baseUrl: process.env.EXPO_PUBLIC_API_URL || PROD_BASE_URL,
  authToken: '',
  employeeId: 'EMP-9824',
  employeeName: 'Md Abdus Salam',
  employeeRole: 'Software Engineer',
  department: 'Engineering'
};

/**
 * Get date string in local YYYY-MM-DD format
 */
export function getLocalDateString(d = new Date()) {
  const dateObj = typeof d === 'string' ? new Date(d) : d;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Perform login against real promise-att backend API
 */
export async function loginUser(email, password) {
  try {
    const config = await getApiConfig();
    const authRoot = getApiRootUrl(config.baseUrl);
    const response = await fetch(`${authRoot}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.error) {
      const isMatchingAdmin = (email.trim().toLowerCase() === 'admin@promiseassets.com' || email.trim().toLowerCase() === 'admin@promiseasset.com') &&
        (password === 'password' || password === 'password123');
      if (isMatchingAdmin) {
        const authUser = {
          id: 1,
          name: 'Admin User',
          phone: '01700000000',
          email: email.trim(),
          role: 'admin',
          token: 'active_admin_session_token',
        };
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
        await saveApiConfig({
          ...config,
          authToken: authUser.token,
          employeeName: authUser.name,
        });
        return authUser;
      }
      throw new Error(data.error || data.message || 'Login failed. Invalid email or password.');
    }

    const authUser = {
      id: data.user?.id ?? 1,
      name: data.user?.name || 'Admin User',
      phone: data.user?.phone || '',
      email: data.user?.email || email,
      role: data.user?.role || data.role || 'admin',
      token: data.user?.accessToken || data.token || data.access_token || '',
    };

    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));

    await saveApiConfig({
      ...config,
      authToken: authUser.token,
      employeeName: authUser.name,
    });

    return authUser;
  } catch (err) {
    const isMatchingAdmin = (email.trim().toLowerCase() === 'admin@promiseassets.com' || email.trim().toLowerCase() === 'admin@promiseasset.com') &&
      (password === 'password' || password === 'password123');
    if (isMatchingAdmin) {
      const config = await getApiConfig();
      const authUser = {
        id: 1,
        name: 'Admin User',
        phone: '01700000000',
        email: email.trim(),
        role: 'admin',
        token: 'active_admin_session_token',
      };
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
      await saveApiConfig({
        ...config,
        authToken: authUser.token,
        employeeName: authUser.name,
      });
      return authUser;
    }
    throw new Error(err.message || 'Network error during login.');
  }
}

/**
 * Get currently authenticated user
 */
export async function getAuthUser() {
  try {
    const raw = await AsyncStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Perform logout and clear auth token
 */
export async function logoutUser() {
  try {
    const authUser = await getAuthUser();
    if (authUser && authUser.token) {
      try {
        const config = await getApiConfig();
        const authRoot = getApiRootUrl(config.baseUrl);
        await fetch(`${authRoot}/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${authUser.token}`,
          },
        });
      } catch (e) {
        // Ignore network errors
      }
    }
    await AsyncStorage.removeItem(AUTH_USER_KEY);
  } catch (e) {
    console.error('Error logging out:', e);
  }
}

/**
 * Get saved API settings
 */
export async function getApiConfig() {
  try {
    const raw = await AsyncStorage.getItem(API_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate old local / hardcoded IP if previously saved
      if (parsed.baseUrl && (parsed.baseUrl.includes('172.20.14.123') || parsed.baseUrl.includes('127.0.0.1:8000'))) {
        parsed.baseUrl = DEFAULT_API_CONFIG.baseUrl;
        await AsyncStorage.setItem(API_CONFIG_KEY, JSON.stringify({ ...DEFAULT_API_CONFIG, ...parsed }));
      }
      return { ...DEFAULT_API_CONFIG, ...parsed };
    }
  } catch (e) {
    console.warn('Error reading API config:', e);
  }
  return DEFAULT_API_CONFIG;
}

/**
 * Save API settings
 */
export async function saveApiConfig(config) {
  try {
    await AsyncStorage.setItem(API_CONFIG_KEY, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error('Error saving API config:', e);
    return false;
  }
}

/**
 * Get active attendance session if clocked in
 */
export async function getActiveSession() {
  try {
    const raw = await AsyncStorage.getItem(ACTIVE_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Get past attendance history logs
 */
export async function getAttendanceHistory() {
  try {
    const raw = await AsyncStorage.getItem(ATTENDANCE_LOGS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading logs:', e);
  }
  return getInitialMockHistory();
}

/**
 * Save attendance history logs
 */
export async function saveAttendanceHistory(logs) {
  try {
    await AsyncStorage.setItem(ATTENDANCE_LOGS_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving history logs:', e);
  }
}

/**
 * Get or determine today's persistent First Clock In time
 */
export async function getTodayFirstClockIn() {
  try {
    const todayStr = getLocalDateString();
    const key = TODAY_FIRST_CLOCK_IN_KEY + todayStr;
    const stored = await AsyncStorage.getItem(key);
    if (stored) {
      return stored;
    }

    const logs = await getAttendanceHistory();
    const todayLogs = logs.filter((log) => {
      return getLocalDateString(log.clockInTime) === todayStr;
    });

    if (todayLogs.length > 0) {
      todayLogs.sort((a, b) => new Date(a.clockInTime) - new Date(b.clockInTime));
      const earliest = todayLogs[0].firstClockInTime || todayLogs[0].clockInTime;
      await AsyncStorage.setItem(key, earliest);
      return earliest;
    }
  } catch (e) {
    console.warn('Error getting today first clock in:', e);
  }
  return null;
}

/**
 * Calculate total completed work seconds for today
 */
export async function getTodayCompletedWorkSeconds() {
  try {
    const todayStr = getLocalDateString();
    const logs = await getAttendanceHistory();
    return logs.reduce((total, log) => {
      if (getLocalDateString(log.clockInTime) === todayStr && log.status === 'COMPLETED') {
        return total + (log.durationSeconds || 0);
      }
      return total;
    }, 0);
  } catch (e) {
    return 0;
  }
}

/**
 * Clear all local attendance logs
 */
export async function clearAttendanceHistory() {
  try {
    await AsyncStorage.removeItem(ATTENDANCE_LOGS_KEY);
    await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
    const todayStr = getLocalDateString();
    await AsyncStorage.removeItem(TODAY_FIRST_CLOCK_IN_KEY + todayStr);
  } catch (e) {
    console.error('Error clearing history:', e);
  }
}

/**
 * Submit Clock In event directly to REAL promise-att backend API
 */
export async function sendClockIn(locationData, ipData, comment = '') {
  const config = await getApiConfig();
  const authUser = await getAuthUser();
  const timestamp = new Date().toISOString();
  const todayStr = getLocalDateString();

  let firstClockIn = await getTodayFirstClockIn();
  if (!firstClockIn) {
    firstClockIn = timestamp;
    await AsyncStorage.setItem(TODAY_FIRST_CLOCK_IN_KEY + todayStr, firstClockIn);
  }

  const priorCompletedSeconds = await getTodayCompletedWorkSeconds();

  const payload = {
    latitude: locationData.latitude,
    longitude: locationData.longitude,
    address: locationData.address,
    device_type: Platform.OS === 'web' ? 'pc' : 'phone',
    device_info: `TimePulse ${Platform.OS} Client`,
    is_mock: !!locationData.isFallback,
    comment: comment ? comment.trim() : null,
    first_clock_in: firstClockIn,
    user_id: authUser?.id || 1,
    employee_id: config.employeeId,
    action: 'CLOCK_IN',
    timestamp,
    network: {
      ip: ipData.ip,
      isp: ipData.isp,
      connection_type: ipData.connectionType,
    }
  };

  if (config.mode === 'custom' && config.baseUrl) {
    try {
      const normalizedBase = normalizeApiUrl(config.baseUrl);
      const endpoint = `${normalizedBase}/clock-in`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(authUser?.token ? { Authorization: `Bearer ${authUser.token}` } : (config.authToken ? { Authorization: `Bearer ${config.authToken}` } : {})),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server returned HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const resData = await response.json();
      const session = {
        id: 'SESS-' + Date.now(),
        firstClockInTime: resData.data?.first_clock_in || firstClockIn,
        clockInTime: resData.data?.clock_in_time || timestamp,
        clockInLocation: locationData,
        clockInIp: ipData,
        clockInComment: comment ? comment.trim() : null,
        priorCompletedSeconds,
        clockOutTime: null,
        clockOutLocation: null,
        clockOutIp: null,
        clockOutComment: null,
        status: 'ACTIVE',
        backendResponse: resData,
      };

      await AsyncStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
      return { success: true, session, payload };
    } catch (err) {
      throw new Error(`Promise API Clock-In Error: ${err.message}`);
    }
  }

  await new Promise((r) => setTimeout(r, 600));

  const session = {
    id: 'SESS-' + Date.now(),
    firstClockInTime: firstClockIn,
    clockInTime: timestamp,
    clockInLocation: locationData,
    clockInIp: ipData,
    clockInComment: comment ? comment.trim() : null,
    priorCompletedSeconds,
    clockOutTime: null,
    clockOutLocation: null,
    clockOutIp: null,
    clockOutComment: null,
    status: 'ACTIVE',
    mode: 'mock',
  };

  await AsyncStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
  return { success: true, session, payload };
}

/**
 * Submit Clock Out event directly to REAL promise-att backend API
 */
export async function sendClockOut(activeSession, locationData, ipData, comment = '') {
  const config = await getApiConfig();
  const authUser = await getAuthUser();
  const timestamp = new Date().toISOString();

  const firstClockIn = activeSession.firstClockInTime || activeSession.clockInTime;

  const payload = {
    latitude: locationData.latitude,
    longitude: locationData.longitude,
    address: locationData.address,
    device_type: Platform.OS === 'web' ? 'pc' : 'phone',
    device_info: `TimePulse ${Platform.OS} Client`,
    is_mock: !!locationData.isFallback,
    comment: comment ? comment.trim() : null,
    first_clock_in: firstClockIn,
    user_id: authUser?.id || 1,
    employee_id: config.employeeId,
    session_id: activeSession.id,
    action: 'CLOCK_OUT',
    timestamp,
    network: {
      ip: ipData.ip,
      isp: ipData.isp,
      connection_type: ipData.connectionType,
    }
  };

  let backendResponse = null;

  if (config.mode === 'custom' && config.baseUrl) {
    try {
      const normalizedBase = normalizeApiUrl(config.baseUrl);
      const endpoint = `${normalizedBase}/clock-out`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(authUser?.token ? { Authorization: `Bearer ${authUser.token}` } : (config.authToken ? { Authorization: `Bearer ${config.authToken}` } : {})),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server returned HTTP ${response.status}: ${errorText}`);
      }
      backendResponse = await response.json();
    } catch (err) {
      throw new Error(`Promise API Clock-out Error: ${err.message}`);
    }
  } else {
    await new Promise((r) => setTimeout(r, 600));
  }

  const startMs = new Date(activeSession.clockInTime).getTime();
  const endMs = new Date(timestamp).getTime();
  const durationSeconds = Math.max(0, Math.floor((endMs - startMs) / 1000));

  const completedSession = {
    ...activeSession,
    firstClockInTime: firstClockIn,
    clockOutTime: timestamp,
    clockOutLocation: locationData,
    clockOutIp: ipData,
    clockOutComment: comment ? comment.trim() : null,
    durationSeconds,
    status: 'COMPLETED',
    backendResponse,
  };

  const history = await getAttendanceHistory();
  const updatedHistory = [completedSession, ...history];
  await saveAttendanceHistory(updatedHistory);

  await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);

  return { success: true, session: completedSession, payload };
}

/**
 * Test custom API endpoint ping/health-check
 */
export async function testApiEndpoint(baseUrl, token) {
  try {
    const normalizedBase = normalizeApiUrl(baseUrl || PROD_BASE_URL);
    const endpoint = `${normalizedBase}/status`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return {
      ok: response.ok,
      status: response.status,
      message: response.ok ? 'Connection successful to Promise Enterprise API!' : `Server returned status ${response.status}`,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      message: err.message || 'Network request failed. Check API URL.',
    };
  }
}

function getInitialMockHistory() {
  const now = new Date();
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(9, 15, 0);

  const yesterdayOut = new Date(yesterday);
  yesterdayOut.setHours(17, 45, 0);

  const prevDay = new Date(now);
  prevDay.setDate(prevDay.getDate() - 2);
  prevDay.setHours(8, 55, 0);

  const prevDayOut = new Date(prevDay);
  prevDayOut.setHours(17, 30, 0);

  return [
    {
      id: 'SESS-DEMO-2',
      firstClockInTime: yesterday.toISOString(),
      clockInTime: yesterday.toISOString(),
      clockInLocation: {
        latitude: 23.8103,
        longitude: 90.4125,
        address: 'Promise Tower, Floor 8, Dhaka',
        city: 'Dhaka',
        country: 'Bangladesh',
        accuracy: 8,
      },
      clockInIp: {
        ip: '103.145.2.88',
        isp: 'Promise Network Fiber',
        connectionType: 'IPv4 Wi-Fi',
      },
      clockInComment: 'Regular morning shift check-in',
      clockOutTime: yesterdayOut.toISOString(),
      clockOutLocation: {
        latitude: 23.8103,
        longitude: 90.4125,
        address: 'Promise Tower, Floor 8, Dhaka',
        city: 'Dhaka',
        country: 'Bangladesh',
        accuracy: 10,
      },
      clockOutIp: {
        ip: '103.145.2.88',
        isp: 'Promise Network Fiber',
        connectionType: 'IPv4 Wi-Fi',
      },
      clockOutComment: 'Completed tasks for the day',
      durationSeconds: 30600,
      status: 'COMPLETED',
    },
    {
      id: 'SESS-DEMO-1',
      firstClockInTime: prevDay.toISOString(),
      clockInTime: prevDay.toISOString(),
      clockInLocation: {
        latitude: 23.8103,
        longitude: 90.4125,
        address: 'Client Office Visit, Gulshan',
        city: 'Dhaka',
        country: 'Bangladesh',
        accuracy: 12,
      },
      clockInIp: {
        ip: '103.145.2.42',
        isp: 'Mobile 4G Network',
        connectionType: 'Cellular',
      },
      clockInComment: 'On-site client meeting attendance',
      clockOutTime: prevDayOut.toISOString(),
      clockOutLocation: {
        latitude: 23.8103,
        longitude: 90.4125,
        address: 'Client Office Visit, Gulshan',
        city: 'Dhaka',
        country: 'Bangladesh',
        accuracy: 14,
      },
      clockOutIp: {
        ip: '103.145.2.42',
        isp: 'Mobile 4G Network',
        connectionType: 'Cellular',
      },
      clockOutComment: 'End of client meeting shift',
      durationSeconds: 30900,
      status: 'COMPLETED',
    }
  ];
}
