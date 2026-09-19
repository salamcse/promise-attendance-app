import { useState, useEffect } from 'react';
import { AppState } from 'react-native';
import { formatLiveTimer } from '../utils/dateUtils';

export function useRunningTimer(clockInTime, baseDuration = 0) {
  const getElapsed = () => {
    const base = Number(baseDuration) || 0;
    if (!clockInTime) return base;
    const start = new Date(clockInTime).getTime();
    const sessionElapsed = start ? Math.max(0, Math.floor((Date.now() - start) / 1000)) : 0;
    return base + sessionElapsed;
  };

  const [liveDuration, setLiveDuration] = useState(getElapsed);

  useEffect(() => {
    setLiveDuration(getElapsed());

    if (!clockInTime) {
      return;
    }

    const interval = setInterval(() => setLiveDuration(getElapsed()), 1000);

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setLiveDuration(getElapsed());
      }
    });

    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [clockInTime, baseDuration]);

  return {
    liveDuration,
    formattedTimer: formatLiveTimer(liveDuration),
  };
}
