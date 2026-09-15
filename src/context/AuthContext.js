import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';
import { getErrorMessage } from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Restore provisional session on app startup
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        const session = await authService.restoreSession();
        if (isMounted && session) {
          setToken(session.token);
          setUser(session.user);
        }
      } catch (err) {
        console.warn('[AuthContext] Session restoration failed:', err);
      } finally {
        if (isMounted) {
          setIsRestoringSession(false);
        }
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (identifier, password) => {
    setIsLoggingIn(true);
    setAuthError(null);

    try {
      const session = await authService.login(identifier, password);
      setToken(session.token);
      setUser(session.user);
      return session;
    } catch (err) {
      console.warn('[AuthContext] Login failed:', err.status, err.code, err.message, err.data);
      const msg = getErrorMessage(err);
      setAuthError(msg);
      throw err;
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout(token);
    } finally {
      setToken(null);
      setUser(null);
      setAuthError(null);
      setIsLoggingOut(false);
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        isRestoringSession,
        isLoggingIn,
        isLoggingOut,
        authError,
        setAuthError,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
