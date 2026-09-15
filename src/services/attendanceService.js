import { apiRequest } from './apiClient';
import { calculateAttendanceStats } from '../features/attendance/attendanceUtils';

export { calculateAttendanceStats };

export async function getAttendanceStatus(token, userId) {
  const data = await apiRequest(`/hrm/status?user_id=${userId}`, { token });
  const session = data?.active_session;
  return {
    isClockedIn: Boolean(session),
    activeSession: session ? {
      id: String(session.id || session.session_id),
      clockInTime: session.clock_in_time || session.created_at,
    } : null,
  };
}

export async function clockIn(location, token, userId) {
  return apiRequest('/hrm/clock-in', {
    method: 'POST',
    token,
    body: {
      user_id: userId,
      latitude: location.latitude,
      longitude: location.longitude,
      timestamp: new Date().toISOString(),
    },
  });
}

export async function clockOut(location, token, userId, sessionId) {
  return apiRequest('/hrm/clock-out', {
    method: 'POST',
    token,
    body: {
      user_id: userId,
      latitude: location.latitude,
      longitude: location.longitude,
      ...(sessionId ? { session_id: sessionId } : {}),
      timestamp: new Date().toISOString(),
    },
  });
}

export async function getAttendanceHistory(token, userId, days = 30) {
  const data = await apiRequest(`/hrm/history?user_id=${userId}&days=${days}`, { token });
  const list = Array.isArray(data) ? data : data?.records || data?.data || [];
  const records = list.map((raw, i) => ({
    id: String(raw.id || raw.session_id || `rec-${i}`),
    date: raw.date || raw.clock_in_time?.split('T')[0],
    clockInTime: raw.clock_in_time || raw.clockInTime,
    clockOutTime: raw.clock_out_time || raw.clockOutTime,
    durationSeconds: Number(raw.duration_seconds || raw.durationSeconds || 0),
  }));
  return { records };
}
