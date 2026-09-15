import { useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { formatLiveTimer } from '../utils/dateUtils';

function getElapsedSeconds(clockInTime) {
  if (!clockInTime) return 0;
  const startTime = new Date(clockInTime).getTime();
  if (!Number.isFinite(startTime)) return 0;
  return Math.max(0, Math.floor((Date.now() - startTime) / 1000));
}

/**
 * Isolated Running Timer Hook
 * Calculates duration from server timestamp and handles AppState background/foreground transitions.
 *
 * @param {string|null} clockInTime - ISO UTC timestamp from active session
 * @returns {{ liveDuration: number, formattedTimer: string }}
 */
export function useRunningTimer(clockInTime) {
  const [liveDuration, setLiveDuration] = useState(() => getElapsedSeconds(clockInTime));
  const timerRef = useRef(null);

  useEffect(() => {
    if (!clockInTime) {
      setLiveDuration(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const startTimer = () => {
      // Sync immediately
      setLiveDuration(getElapsedSeconds(clockInTime));

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setLiveDuration(getElapsedSeconds(clockInTime));
      }, 1000);
    };

    const stopTimer = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    startTimer();

    // Listen to background / foreground transitions
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        startTimer();
      } else {
        stopTimer();
      }
    });

    return () => {
      stopTimer();
      subscription.remove();
    };
  }, [clockInTime]);

  return {
    liveDuration,
    formattedTimer: formatLiveTimer(liveDuration),
  };
}
