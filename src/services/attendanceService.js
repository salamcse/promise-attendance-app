import { apiRequest } from './apiClient';

/**
 * Calculate 30-day attendance statistics
 */
export function calculateAttendanceStats(records = []) {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  const presentDates = new Set();
  let totalSeconds = 0;

  records.forEach((r) => {
    const time = new Date(r.clockInTime || r.date).getTime();
    if (time >= thirtyDaysAgo) {
      const d = (r.date || r.clockInTime || '').split('T')[0];
      if (d) presentDates.add(d);
      totalSeconds += r.durationSeconds || 0;
    }
  });

  // Total working days in last 30 days (excluding Fridays)
  let workingDays = 0;
  for (let i = 1; i <= 30; i++) {
    if (new Date(now - i * 86400000).getDay() !== 5) {
      workingDays++;
    }
  }

  return {
    presentDays: presentDates.size,
    absentDays: Math.max(0, workingDays - presentDates.size),
    totalHours: Math.round((totalSeconds / 3600) * 10) / 10,
  };
}

export async function getAttendanceStatus(token, userId) {
  const data = await apiRequest(`/hrm/status?user_id=${userId}`, { token });
  const session = data?.active_session;
  const todayAttendance = data?.today_attendance;

  let todayBaseSeconds = 0;
  if (todayAttendance) {
    if (todayAttendance.total_work_seconds != null) {
      todayBaseSeconds = Number(todayAttendance.total_work_seconds);
    } else if (todayAttendance.total_work_minutes != null) {
      todayBaseSeconds = Number(todayAttendance.total_work_minutes) * 60;
    }
  }

  return {
    isClockedIn: Boolean(session),
    activeSession: session ? {
      id: String(session.id || session.session_id),
      clockInTime: session.clock_in_time || session.created_at,
    } : null,
    todayAttendance: todayAttendance || null,
    todayBaseSeconds,
  };
}

export async function clockIn(location, token, userId, note) {
  const locationType = location?.isOffice ? 'inside_office' : 'outside_office';
  return apiRequest('/hrm/clock-in', {
    method: 'POST',
    token,
    body: {
      user_id: userId,
      latitude: location.latitude,
      longitude: location.longitude,
      location_type: locationType,
      timestamp: new Date().toISOString(),
      ...(note ? { note: note.trim() } : {}),
    },
  });
}

export async function clockOut(location, token, userId, sessionId, note) {
  const locationType = location?.isOffice ? 'inside_office' : 'outside_office';
  return apiRequest('/hrm/clock-out', {
    method: 'POST',
    token,
    body: {
      user_id: userId,
      latitude: location.latitude,
      longitude: location.longitude,
      location_type: locationType,
      ...(sessionId ? { session_id: sessionId } : {}),
      ...(note ? { note: note.trim() } : {}),
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
