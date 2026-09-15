import { useState, useEffect } from 'react';
import { AppState } from 'react-native';
import { formatLiveTimer } from '../utils/dateUtils';

export function useRunningTimer(clockInTime) {
  const getElapsed = () => {
    if (!clockInTime) return 0;
    const start = new Date(clockInTime).getTime();
    return start ? Math.max(0, Math.floor((Date.now() - start) / 1000)) : 0;
  };

  const [liveDuration, setLiveDuration] = useState(getElapsed);

  useEffect(() => {
    if (!clockInTime) {
      setLiveDuration(0);
      return;
    }

    setLiveDuration(getElapsed());
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
  }, [clockInTime]);

  return {
    liveDuration,
    formattedTimer: formatLiveTimer(liveDuration),
  };
}
