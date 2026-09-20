import { apiRequest } from './apiClient';

/**
 * Calculate 30-day attendance statistics
 */
export function calculateAttendanceStats(records = []) {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  const presentDates = new Set();
  const lateDates = new Set();
  let totalSeconds = 0;

  records.forEach((r) => {
    const time = new Date(r.clockInTime || r.date).getTime();
    if (time >= thirtyDaysAgo) {
      const d = (r.date || r.clockInTime || '').split('T')[0];
      if (d) {
        if (r.status === 'late') {
          lateDates.add(d);
        } else {
          presentDates.add(d);
        }
      }
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

  const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;
  const attendedDays = presentDates.size + lateDates.size;

  return {
    presentDays: presentDates.size,
    lateDays: lateDates.size,
    absentDays: Math.max(0, workingDays - attendedDays),
    totalHours,
    totalWorkText: `${totalHours}h`,
    monthName: '',
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

export async function getAttendanceHistory(token, userId, options = {}) {
  const queryParts = [];
  let perPage = 50;
  let status = null;
  let from = null;
  let to = null;
  let date = null;
  let page = 1;

  if (typeof options === 'number') {
    perPage = options;
  } else if (typeof options === 'object' && options !== null) {
    if (options.per_page) perPage = options.per_page;
    if (options.status) status = options.status;
    if (options.from) from = options.from;
    if (options.to) to = options.to;
    if (options.date) date = options.date;
    if (options.page) page = options.page;
  }

  queryParts.push(`per_page=${perPage}`);
  if (status) queryParts.push(`status=${encodeURIComponent(status)}`);
  if (from) queryParts.push(`from=${encodeURIComponent(from)}`);
  if (to) queryParts.push(`to=${encodeURIComponent(to)}`);
  if (date) queryParts.push(`date=${encodeURIComponent(date)}`);
  if (page && page > 1) queryParts.push(`page=${page}`);

  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

  let responseData;
  try {
    responseData = await apiRequest(`/hrm/attendance/history${queryString}`, { token });
  } catch (err) {
    // Fallback to legacy endpoint if not supported
    if (err.status === 404) {
      const legacyDays = typeof options === 'number' ? options : 30;
      responseData = await apiRequest(`/hrm/history?user_id=${userId}&days=${legacyDays}`, { token });
    } else {
      throw err;
    }
  }

  // Parse monthly summary
  let monthlySummary = null;
  if (Array.isArray(responseData?.monthly_summary) && responseData.monthly_summary.length > 0) {
    const ms = responseData.monthly_summary[0];
    monthlySummary = {
      month: ms.month || '',
      monthName: ms.month_name || '',
      totalDays: Number(ms.total_days ?? 0),
      presentDays: Number(ms.present_days ?? 0),
      lateDays: Number(ms.late_days ?? 0),
      absentDays: Number(ms.absent_days ?? 0),
      totalWorkMinutes: Number(ms.total_work_minutes ?? 0),
      totalWorkText: ms.total_work_text || '',
      totalHours: Math.round(((Number(ms.total_work_minutes || 0)) / 60) * 10) / 10,
    };
  }

  // Normalize attendance records list
  const rawList = Array.isArray(responseData)
    ? responseData
    : responseData?.data || responseData?.records || [];

  const records = rawList.map((raw, i) => {
    const id = String(raw.id || raw.session_id || `rec-${i}`);
    const date = raw.date || (raw.clock_in?.datetime || raw.clock_in_time)?.split('T')[0] || '';
    const status = raw.status || (raw.duration_seconds || raw.duration_minutes ? 'present' : 'absent');
    const approvalStatus = raw.approval_status || 'approved';
    const isActiveSession = Boolean(raw.is_active_session || (raw.clock_in && !raw.clock_out?.datetime));

    const clockIn = raw.clock_in || {};
    const clockInTime = clockIn.datetime || raw.clock_in_time || raw.clockInTime;
    const clockInTimeFormatted = clockIn.time || '';
    const clockInLocation = clockIn.location || (raw.location_type === 'inside_office' ? 'Office' : 'Remote');
    const clockInDevice = clockIn.device || 'mobile';

    const clockOut = raw.clock_out || {};
    const clockOutTime = clockOut.datetime || raw.clock_out_time || raw.clockOutTime;
    const clockOutTimeFormatted = clockOut.time || '';
    const clockOutLocation = clockOut.location || clockInLocation;
    const clockOutDevice = clockOut.device || clockInDevice;

    const durationMinutes = Number(raw.duration_minutes ?? (raw.duration_seconds ? Math.round(raw.duration_seconds / 60) : 0));
    const durationSeconds = raw.duration_minutes != null ? durationMinutes * 60 : Number(raw.duration_seconds || 0);
    const durationText = raw.duration_text || (durationMinutes > 0 ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m` : '');

    const security = raw.security || {
      is_suspicious: false,
      details: null,
    };

    return {
      id,
      date,
      status,
      approvalStatus,
      isActiveSession,
      clockInTime,
      clockInTimeFormatted,
      clockInLocation,
      clockInDevice,
      clockOutTime,
      clockOutTimeFormatted,
      clockOutLocation,
      clockOutDevice,
      durationMinutes,
      durationSeconds,
      durationText,
      security,
      clockIn,
      clockOut,
    };
  });

  if (!monthlySummary) {
    const fallback = calculateAttendanceStats(records);
    monthlySummary = {
      month: '',
      monthName: 'Last 30 Days',
      totalDays: fallback.presentDays + fallback.lateDays + fallback.absentDays,
      presentDays: fallback.presentDays,
      lateDays: fallback.lateDays,
      absentDays: fallback.absentDays,
      totalWorkMinutes: Math.round(fallback.totalHours * 60),
      totalWorkText: fallback.totalWorkText,
      totalHours: fallback.totalHours,
    };
  }

  const meta = responseData?.meta || {
    currentPage: 1,
    lastPage: 1,
    perPage: perPage,
    total: records.length,
  };

  return {
    records,
    monthlySummary,
    meta,
  };
}
