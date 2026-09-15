import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import * as attendanceService from '../features/attendance/attendanceService';
import { calculateAttendanceStats } from '../features/attendance/attendanceUtils';
import * as locationService from '../services/locationService';
import { getErrorMessage } from '../utils/errorUtils';

const AttendanceContext = createContext(null);

export function AttendanceProvider({ children }) {
  const { user, token, logout } = useAuth();

  // Core State: activeSession is the single source of truth for clock status
  const [activeSession, setActiveSession] = useState(null);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({
    presentDays: 0,
    absentDays: 0,
    totalHours: 0,
  });

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
      return statusData;
    } catch (err) {
      if (err.status === 401 || err.code === 'AUTH_ERROR') {
        await logout();
        return;
      }
      throw err;
    }
  }, [token, user?.id, logout]);

  // Fetch 30-day history from backend
  const fetchHistory = useCallback(async () => {
    if (!token || !user?.id) return;
    try {
      const historyData = await attendanceService.getAttendanceHistory(token, user.id, 30);
      const records = historyData.records || [];
      setAttendanceLogs(records);
      setAttendanceStats(calculateAttendanceStats(records));
      return records;
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
  const handleClockIn = useCallback(async () => {
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
      await attendanceService.clockIn(location, token, user?.id);

      // Canonical server sync
      await fetchStatus();
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
  const handleClockOut = useCallback(async () => {
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
      await attendanceService.clockOut(location, token, user?.id, activeSession?.id);

      // Canonical server sync
      await fetchStatus();
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
        isLoading,
        isRefreshing,
        isSubmitting,
        screenError,
        actionError,
        clearActionError: () => setActionError(null),
        refreshAttendance,
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
