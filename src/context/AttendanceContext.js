import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getCurrentLocation } from '../services/locationService';
import { getIpInfo } from '../services/ipService';
import {
  getApiConfig,
  saveApiConfig,
  getActiveSession,
  getAttendanceHistory,
  sendClockIn,
  sendClockOut,
  clearAttendanceHistory,
  getTodayFirstClockIn,
  getTodayCompletedWorkSeconds,
  loginUser,
  getAuthUser,
  logoutUser
} from '../services/apiService';

const AttendanceContext = createContext();

export function AttendanceProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [apiConfig, setApiConfigState] = useState(null);
  const [firstClockInToday, setFirstClockInToday] = useState(null);
  const [todayCompletedSeconds, setTodayCompletedSeconds] = useState(0);

  const [currentLocation, setCurrentLocation] = useState({
    loading: true,
    data: null,
    error: null,
  });

  const [currentIpInfo, setCurrentIpInfo] = useState({
    loading: true,
    data: null,
    error: null,
  });

  const [isActionLoading, setIsActionLoading] = useState(false);
  const [liveDuration, setLiveDuration] = useState(0);

  const timerRef = useRef(null);

  const refreshTodayStats = async () => {
    const firstIn = await getTodayFirstClockIn();
    const completedSecs = await getTodayCompletedWorkSeconds();
    setFirstClockInToday(firstIn);
    setTodayCompletedSeconds(completedSecs);
  };

  useEffect(() => {
    async function initData() {
      const user = await getAuthUser();
      setAuthUser(user);

      const config = await getApiConfig();
      setApiConfigState(config);

      const session = await getActiveSession();
      setActiveSession(session);

      const logs = await getAttendanceHistory();
      setAttendanceLogs(logs);

      await refreshTodayStats();
      await refreshLocationAndIp();
    }

    initData();
  }, []);

  useEffect(() => {
    if (activeSession && activeSession.clockInTime) {
      const updateDuration = () => {
        const startMs = new Date(activeSession.clockInTime).getTime();
        const nowMs = Date.now();
        const diffSeconds = Math.max(0, Math.floor((nowMs - startMs) / 1000));
        setLiveDuration(diffSeconds);
      };

      updateDuration();
      timerRef.current = setInterval(updateDuration, 1000);
    } else {
      setLiveDuration(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSession]);

  const login = async (email, password) => {
    setIsAuthLoading(true);
    try {
      const user = await loginUser(email, password);
      setAuthUser(user);
      return user;
    } catch (err) {
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = async () => {
    setIsAuthLoading(true);
    try {
      await logoutUser();
      setAuthUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const refreshLocationAndIp = async () => {
    setCurrentLocation((prev) => ({ ...prev, loading: true, error: null }));
    setCurrentIpInfo((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const [loc, ip] = await Promise.all([getCurrentLocation(), getIpInfo()]);
      setCurrentLocation({ loading: false, data: loc, error: loc.errorMsg || null });
      setCurrentIpInfo({ loading: false, data: ip, error: ip.errorMsg || null });
      return { location: loc, ip };
    } catch (err) {
      console.error('Error refreshing metrics:', err);
      setCurrentLocation((prev) => ({ ...prev, loading: false, error: err.message }));
      setCurrentIpInfo((prev) => ({ ...prev, loading: false, error: err.message }));
      return null;
    }
  };

  const handleClockIn = async (comment = '') => {
    if (activeSession) {
      throw new Error('You are already clocked in!');
    }

    setIsActionLoading(true);
    try {
      const metrics = await refreshLocationAndIp();
      const locData = metrics?.location || currentLocation.data || await getCurrentLocation();
      const ipData = metrics?.ip || currentIpInfo.data || await getIpInfo();

      const result = await sendClockIn(locData, ipData, comment);
      if (result.success) {
        setActiveSession(result.session);
        await refreshTodayStats();
        return result;
      }
    } catch (err) {
      console.error('Clock In Failed:', err);
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleClockOut = async (comment = '') => {
    if (!activeSession) {
      throw new Error('No active clock-in session found!');
    }

    setIsActionLoading(true);
    try {
      const metrics = await refreshLocationAndIp();
      const locData = metrics?.location || currentLocation.data || await getCurrentLocation();
      const ipData = metrics?.ip || currentIpInfo.data || await getIpInfo();

      const result = await sendClockOut(activeSession, locData, ipData, comment);
      if (result.success) {
        setActiveSession(null);
        setAttendanceLogs((prev) => [result.session, ...prev]);
        await refreshTodayStats();
        return result;
      }
    } catch (err) {
      console.error('Clock Out Failed:', err);
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  const updateApiConfig = async (newConfig) => {
    const updated = { ...apiConfig, ...newConfig };
    setApiConfigState(updated);
    await saveApiConfig(updated);
  };

  const handleClearLogs = async () => {
    await clearAttendanceHistory();
    setAttendanceLogs([]);
    setActiveSession(null);
    setFirstClockInToday(null);
    setTodayCompletedSeconds(0);
    setLiveDuration(0);
  };

  const todayTotalDuration = todayCompletedSeconds + (activeSession ? liveDuration : 0);

  // Check if current user has Admin privileges
  // STRICT CHECK: only known admin email or phone — role not returned by API
  const isAdmin = !!(
    authUser &&
    (authUser.email === 'admin@promiseasset.com' ||
      authUser.role === 'admin' ||
      authUser.role === 'Admin' ||
      authUser.phone === '01700000000')
  );

  return (
    <AttendanceContext.Provider
      value={{
        authUser,
        isAuthenticated: !!authUser,
        isAdmin,
        isAuthLoading,
        login,
        logout,
        isClockedIn: !!activeSession,
        activeSession,
        attendanceLogs,
        currentLocation,
        currentIpInfo,
        apiConfig,
        liveDuration,
        todayCompletedSeconds,
        todayTotalDuration,
        firstClockInToday,
        isActionLoading,
        handleClockIn,
        handleClockOut,
        refreshLocationAndIp,
        updateApiConfig,
        handleClearLogs,
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
