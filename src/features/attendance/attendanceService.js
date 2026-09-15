import { apiRequest } from '../../services/apiClient';

/**
 * Attendance Service: Pure API calls and response normalization
 * Backend is single source of truth - zero mock fallbacks.
 */

function ensureUserId(userId) {
  if (!userId) {
    throw new Error('User ID is required for attendance operations.');
  }
  return userId;
}

/**
 * Normalize raw status response from backend
 */
function normalizeStatus(data) {
  if (!data) {
    return { isClockedIn: false, activeSession: null };
  }

  const isClockedIn = Boolean(data.is_clocked_in || data.active_session);
  let activeSession = null;

  if (isClockedIn && data.active_session) {
    const sessionId = data.active_session.id ?? data.active_session.session_id ?? null;
    const clockIn =
      data.active_session.clock_in_time ??
      data.active_session.created_at ??
      data.active_session.started_at ??
      null;

    if (sessionId && clockIn) {
      activeSession = {
        id: String(sessionId),
        clockInTime: clockIn,
      };
    }
  }

  return { isClockedIn: Boolean(activeSession), activeSession };
}

/**
 * Normalize a single attendance history item
 */
function normalizeRecord(raw, index) {
  const clockIn = raw.clock_in_time ?? raw.clockInTime ?? raw.created_at ?? raw.started_at ?? null;
  const clockOut = raw.clock_out_time ?? raw.clockOutTime ?? raw.ended_at ?? null;

  // Derive date in YYYY-MM-DD
  let dateStr = raw.date;
  if (!dateStr && clockIn) {
    dateStr = clockIn.split('T')[0];
  }

  let durationSeconds = Number(raw.duration_seconds ?? raw.durationSeconds ?? 0);
  if (!durationSeconds && clockIn && clockOut) {
    const diff = Math.floor((new Date(clockOut).getTime() - new Date(clockIn).getTime()) / 1000);
    durationSeconds = Math.max(0, diff);
  }

  const recordId = raw.id ?? raw.session_id ?? `rec-${index}`;

  return {
    id: String(recordId),
    date: dateStr || new Date().toISOString().split('T')[0],
    clockInTime: clockIn,
    clockOutTime: clockOut,
    durationSeconds,
    status: clockOut ? 'completed' : 'active',
  };
}

/**
 * Fetch live attendance status
 */
export async function getAttendanceStatus(token, userId) {
  const validUserId = ensureUserId(userId);

  const response = await apiRequest('/hrm/status', {
    method: 'GET',
    token,
    params: { user_id: validUserId },
  });

  return normalizeStatus(response);
}

/**
 * Submit Clock In
 */
export async function clockIn(location, token, userId) {
  const validUserId = ensureUserId(userId);

  const payload = {
    user_id: validUserId,
    latitude: location.latitude,
    longitude: location.longitude,
    timestamp: new Date().toISOString(),
  };

  return apiRequest('/hrm/clock-in', {
    method: 'POST',
    token,
    body: payload,
  });
}

/**
 * Submit Clock Out
 */
export async function clockOut(location, token, userId, sessionId) {
  const validUserId = ensureUserId(userId);

  const payload = {
    user_id: validUserId,
    latitude: location.latitude,
    longitude: location.longitude,
    ...(sessionId ? { session_id: sessionId } : {}),
    timestamp: new Date().toISOString(),
  };

  return apiRequest('/hrm/clock-out', {
    method: 'POST',
    token,
    body: payload,
  });
}

/**
 * Fetch 30-day attendance history
 */
export async function getAttendanceHistory(token, userId, days = 30) {
  const validUserId = ensureUserId(userId);

  const response = await apiRequest('/hrm/history', {
    method: 'GET',
    token,
    params: {
      user_id: validUserId,
      days,
    },
  });

  const rawList = Array.isArray(response)
    ? response
    : Array.isArray(response?.records)
    ? response.records
    : Array.isArray(response?.data)
    ? response.data
    : [];

  const records = rawList.map(normalizeRecord);

  // Sort descending: latest records first
  records.sort((a, b) => {
    const timeA = new Date(a.clockInTime || a.date).getTime();
    const timeB = new Date(b.clockInTime || b.date).getTime();
    return timeB - timeA;
  });

  return { records };
}
