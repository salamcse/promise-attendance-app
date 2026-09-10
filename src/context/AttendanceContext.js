import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getCurrentLocation } from '../services/locationService';
import {
  getAuthUser,
  loginUser,
  logoutUser,
  getAttendanceStatus,
  clockIn,
  clockOut,
  getAttendanceHistory,
  recordCompletedShift,
} from '../services/apiService';
import { calculateMonthStats } from '../services/attendanceUtils';

const AttendanceContext = createContext();

export function AttendanceProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [isClockedIn, setIsClockedIn] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [liveDuration, setLiveDuration] = useState(0);

  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [monthStats, setMonthStats] = useState({ presentDays: 0, absentDays: 0, totalHours: 0 });

  const timerRef = useRef(null);

  // Refresh attendance data from server
  const refreshAttendance = useCallback(async (userOverride) => {
    const user = userOverride || authUser;
    if (!user) return;

    try {
      // 1. Fetch live status
      const statusData = await getAttendanceStatus(user.token, user.id).catch(() => null);
      if (statusData?.is_clocked_in && statusData.active_session) {
        setIsClockedIn(true);
        setActiveSession({
          id: statusData.active_session.id,
          clockInTime: statusData.active_session.clock_in_time || statusData.active_session.created_at || new Date().toISOString(),
        });
      } else {
        setIsClockedIn(false);
        setActiveSession(null);
      }

      // 2. Fetch history
      const historyData = await getAttendanceHistory(user.token, user.id);
      const records = historyData.records || [];
      setAttendanceLogs(records);
      setMonthStats(calculateMonthStats(records));
    } catch (e) {
      console.warn('Failed to refresh attendance:', e);
    }
  }, [authUser]);

  // Initial Auth Check
  useEffect(() => {
    async function init() {
      try {
        const user = await getAuthUser();
        setAuthUser(user);
        if (user) {
          await refreshAttendance(user);
        }
      } finally {
        setIsAuthLoading(false);
      }
    }
    init();
  }, [refreshAttendance]);

  // Client-side live timer (runs only when clocked in, NO polling)
  useEffect(() => {
    if (isClockedIn && activeSession?.clockInTime) {
      const startMs = new Date(activeSession.clockInTime).getTime();

      const updateTimer = () => {
        const diff = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
        setLiveDuration(diff);
      };

      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);
    } else {
      setLiveDuration(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isClockedIn, activeSession]);

  // Login handler
  const login = async (identifier, password) => {
    setIsActionLoading(true);
    try {
      const user = await loginUser(identifier, password);
      setAuthUser(user);
      await refreshAttendance(user);
      return user;
    } finally {
      setIsActionLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    setIsActionLoading(true);
    try {
      await logoutUser(authUser?.token);
      setAuthUser(null);
      setIsClockedIn(false);
      setActiveSession(null);
      setLiveDuration(0);
      setAttendanceLogs([]);
      setMonthStats({ presentDays: 0, absentDays: 0, totalHours: 0 });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Clock In handler
  const handleClockIn = async () => {
    if (isClockedIn) throw new Error('You are already clocked in.');
    setIsActionLoading(true);

    try {
      const location = await getCurrentLocation();
      const res = await clockIn(location, authUser?.token, authUser?.id);

      const session = {
        id: res.data?.id || `shift-${Date.now()}`,
        clockInTime: res.data?.clock_in_time || new Date().toISOString(),
      };

      setActiveSession(session);
      setIsClockedIn(true);
      return session;
    } finally {
      setIsActionLoading(false);
    }
  };

  // Clock Out handler
  const handleClockOut = async () => {
    if (!isClockedIn) throw new Error('No active clock-in session found.');
    setIsActionLoading(true);

    try {
      const location = await getCurrentLocation();
      await clockOut(location, authUser?.token, authUser?.id, activeSession?.id);

      const now = new Date();
      const durationSeconds = Math.max(
        0,
        Math.floor((now.getTime() - new Date(activeSession.clockInTime).getTime()) / 1000)
      );

      const newRecord = {
        id: activeSession?.id || `shift-${Date.now()}`,
        date: now.toISOString().split('T')[0],
        clockInTime: activeSession.clockInTime,
        clockOutTime: now.toISOString(),
        durationSeconds,
      };

      const updatedRecords = await recordCompletedShift(newRecord);
      setAttendanceLogs(updatedRecords);
      setMonthStats(calculateMonthStats(updatedRecords));

      setIsClockedIn(false);
      setActiveSession(null);
      setLiveDuration(0);
      return newRecord;
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <AttendanceContext.Provider
      value={{
        authUser,
        isAuthenticated: !!authUser,
        isAuthLoading,
        isActionLoading,
        isClockedIn,
        activeSession,
        liveDuration,
        attendanceLogs,
        monthStats,
        login,
        logout,
        handleClockIn,
        handleClockOut,
        refreshAttendance,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within AttendanceProvider');
  }
  return context;
}

