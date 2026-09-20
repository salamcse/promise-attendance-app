import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from './AuthContext';
import * as attendanceService from '../services/attendanceService';
import { calculateAttendanceStats } from '../services/attendanceService';
import * as locationService from '../services/locationService';
import { getErrorMessage } from '../services/apiClient';

const AttendanceContext = createContext(null);

export function AttendanceProvider({ children }) {
  const { user, token, logout } = useAuth();

  // Core State: activeSession is the single source of truth for clock status
  const [activeSession, setActiveSession] = useState(null);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({
    presentDays: 0,
    lateDays: 0,
    absentDays: 0,
    totalHours: 0,
    totalWorkText: '',
    monthName: '',
  });
  const [todayBaseSeconds, setTodayBaseSeconds] = useState(0);

  // Calculate today's completed work duration in seconds (prioritizing backend today_attendance)
  const todayWorkedSeconds = useMemo(() => {
    if (todayBaseSeconds > 0) {
      return todayBaseSeconds;
    }

    const todayStr = new Date().toDateString();
    let total = 0;
    (attendanceLogs || []).forEach((rec) => {
      // Don't count the current active session if it's already in logs
      if (activeSession && (rec.id === activeSession.id || rec.session_id === activeSession.id)) {
        return;
      }

      let isToday = false;
      if (rec.clockInTime) {
        isToday = new Date(rec.clockInTime).toDateString() === todayStr;
      } else if (rec.date) {
        isToday = new Date(rec.date).toDateString() === todayStr;
      }

      if (isToday) {
        let sec = Number(rec.durationSeconds || 0);
        if (!sec && rec.clockInTime && rec.clockOutTime) {
          const diff = Math.floor(
            (new Date(rec.clockOutTime).getTime() - new Date(rec.clockInTime).getTime()) / 1000
          );
          if (diff > 0) sec = diff;
        }
        total += sec;
      }
    });

    return total;
  }, [todayBaseSeconds, attendanceLogs, activeSession]);

  // UI / Status States
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenError, setScreenError] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Synchronous double-tap lock
  const isSubmittingRef = useRef(false);

  // Fetch live status from backend
  const fetchStatus = useCallback(async () => {
    if (!token || !user?.id) return;
    try {
      const statusData = await attendanceService.getAttendanceStatus(token, user.id);
      setActiveSession(statusData.activeSession);
      if (statusData.todayBaseSeconds != null) {
        setTodayBaseSeconds(statusData.todayBaseSeconds);
      }
      return statusData;
    } catch (err) {
      if (err.status === 401 || err.code === 'AUTH_ERROR') {
        await logout();
        return;
      }
      throw err;
    }
  }, [token, user?.id, logout]);

  // Fetch history from backend (supports options like status, date, from, to)
  const fetchHistory = useCallback(async (options = {}) => {
    if (!token || !user?.id) return;
    try {
      const historyData = await attendanceService.getAttendanceHistory(token, user.id, options);
      const records = historyData.records || [];
      setAttendanceLogs(records);
      if (historyData.monthlySummary) {
        setAttendanceStats(historyData.monthlySummary);
      } else {
        setAttendanceStats(calculateAttendanceStats(records));
      }
      return historyData;
    } catch (err) {
      if (err.status === 401 || err.code === 'AUTH_ERROR') {
        await logout();
        return;
      }
      throw err;
    }
  }, [token, user?.id, logout]);

  // Full refresh (status + history)
  const refreshAttendance = useCallback(async () => {
    setIsRefreshing(true);
    setScreenError(null);
    try {
      await Promise.all([fetchStatus(), fetchHistory()]);
    } catch (err) {
      setScreenError(getErrorMessage(err));
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchStatus, fetchHistory]);

  // Initial load on mount or when user changes
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setScreenError(null);
      try {
        await Promise.all([fetchStatus(), fetchHistory()]);
      } catch (err) {
        if (isMounted) {
          setScreenError(getErrorMessage(err));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (user?.id) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [user?.id, fetchStatus, fetchHistory]);

  // Clock In handler
  const handleClockIn = useCallback(async (note) => {
    if (isSubmittingRef.current) return;
    if (activeSession) {
      setActionError('You are already clocked in.');
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setActionError(null);

    try {
      const location = await locationService.getCurrentLocation();
      const isOffice = location.isOffice;

      if (!isOffice && (!note || !note.trim())) {
        setActionError('Note is required when clocking in outside office location.');
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        return;
      }

      const res = await attendanceService.clockIn(location, token, user?.id, note);

      // Instantly update active session so UI immediately reflects "WORKING"
      const session = res?.active_session || res?.data?.active_session;
      if (session) {
        setActiveSession({
          id: String(session.id || session.session_id),
          clockInTime: session.clock_in_time || session.created_at || new Date().toISOString(),
        });
      } else {
        setActiveSession({
          id: 'active-' + Date.now(),
          clockInTime: new Date().toISOString(),
        });
      }

      const todayAtt = res?.today_attendance || res?.data?.today_attendance;
      if (todayAtt?.total_work_minutes != null) {
        setTodayBaseSeconds(Number(todayAtt.total_work_minutes) * 60);
      }

      // Background server synchronization
      fetchStatus().catch(() => {});
      fetchHistory().catch(() => {});
    } catch (err) {
      if (err.status === 401 || err.code === 'AUTH_ERROR') {
        await logout();
        return;
      }
      setActionError(getErrorMessage(err));
      throw err;
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [activeSession, token, user?.id, fetchStatus, fetchHistory, logout]);

  // Clock Out handler
  const handleClockOut = useCallback(async (note) => {
    if (isSubmittingRef.current) return;
    if (!activeSession) {
      setActionError('No active clock-in session found.');
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setActionError(null);

    try {
      const location = await locationService.getCurrentLocation();
      const isOffice = location.isOffice;

      if (!isOffice && (!note || !note.trim())) {
        setActionError('Note is required when clocking out outside office location.');
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        return;
      }

      await attendanceService.clockOut(location, token, user?.id, activeSession?.id, note);

      // Instantly update active session so UI immediately reflects "NOT CLOCKED IN"
      setActiveSession(null);

      // Background server synchronization
      fetchStatus().catch(() => {});
      fetchHistory().catch(() => {});
    } catch (err) {
      if (err.status === 401 || err.code === 'AUTH_ERROR') {
        await logout();
        return;
      }
      setActionError(getErrorMessage(err));
      throw err;
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [activeSession, token, user?.id, fetchStatus, fetchHistory, logout]);

  return (
    <AttendanceContext.Provider
      value={{
        activeSession,
        isClockedIn: Boolean(activeSession),
        attendanceLogs,
        attendanceStats,
        todayWorkedSeconds,
        isLoading,
        isRefreshing,
        isSubmitting,
        screenError,
        actionError,
        clearActionError: () => setActionError(null),
        refreshAttendance,
        fetchHistory,
        handleClockIn,
        handleClockOut,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
}
