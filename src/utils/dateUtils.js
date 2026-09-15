/**
 * Date, time, and duration formatting utilities
 * Treats backend timestamps as UTC ISO and formats in local / Asia/Dhaka time.
 */

const BANGLADESH_TIMEZONE = 'Asia/Dhaka';

/**
 * Format ISO timestamp to readable date string: "Sep 15, 2026"
 */
export function formatDate(isoString, timeZone = BANGLADESH_TIMEZONE) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (!Number.isFinite(d.getTime())) return '';

  try {
    return d.toLocaleDateString('en-US', {
      timeZone,
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}

/**
 * Format ISO timestamp to readable time string: "09:30 AM"
 */
export function formatTime(isoString, timeZone = BANGLADESH_TIMEZONE) {
  if (!isoString) return '--:--';
  const d = new Date(isoString);
  if (!Number.isFinite(d.getTime())) return '--:--';

  try {
    return d.toLocaleTimeString('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
}

/**
 * Format duration in seconds to "8h 15m" or "45m"
 */
export function formatDuration(totalSeconds) {
  if (!totalSeconds || !Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return '0h 00m';
  }

  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);

  if (hrs > 0) {
    return `${hrs}h ${String(mins).padStart(2, '0')}m`;
  }
  return `${mins}m`;
}

/**
 * Format elapsed seconds to live stopwatch display: "08:15:20"
 */
export function formatLiveTimer(totalSeconds) {
  if (!totalSeconds || !Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return '00:00:00';
  }

  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);

  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}
