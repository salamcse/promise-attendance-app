import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { LIGHT_COLORS, DARK_COLORS } from '../constants/theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  // Default to 'light' per user requirement ("ligst mood ta koro")
  const [themeMode, setThemeModeState] = useState('light');
  const [isThemeReady, setIsThemeReady] = useState(false);

  // Restore saved theme preference on launch
  useEffect(() => {
    let isMounted = true;
    async function loadStoredTheme() {
      try {
        const savedMode = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);
        if (isMounted && savedMode && (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system')) {
          setThemeModeState(savedMode);
        }
      } catch (err) {
        console.warn('[ThemeContext] Failed to load stored theme:', err);
      } finally {
        if (isMounted) {
          setIsThemeReady(true);
        }
      }
    }

    loadStoredTheme();
    return () => {
      isMounted = false;
    };
  }, []);

  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  const colors = useMemo(() => {
    return isDark ? DARK_COLORS : LIGHT_COLORS;
  }, [isDark]);

  const setThemeMode = useCallback(async (mode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
    } catch (err) {
      console.warn('[ThemeContext] Failed to persist theme:', err);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const nextMode = isDark ? 'light' : 'dark';
    setThemeMode(nextMode);
  }, [isDark, setThemeMode]);

  const contextValue = useMemo(
    () => ({
      themeMode,
      isDark,
      colors,
      toggleTheme,
      setThemeMode,
      isThemeReady,
    }),
    [themeMode, isDark, colors, toggleTheme, setThemeMode, isThemeReady]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
