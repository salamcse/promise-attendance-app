/**
 * Calculate 30-day attendance statistics
 */
export function calculateAttendanceStats(records = []) {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  const presentDates = new Set();
  let totalSeconds = 0;

  records.forEach((r) => {
    const time = new Date(r.clockInTime || r.date).getTime();
    if (time >= thirtyDaysAgo) {
      const d = (r.date || r.clockInTime || '').split('T')[0];
      if (d) presentDates.add(d);
      totalSeconds += r.durationSeconds || 0;
    }
  });

  // Total working days in last 30 days (excluding Fridays)
  let workingDays = 0;
  for (let i = 1; i <= 30; i++) {
    if (new Date(now - i * 86400000).getDay() !== 5) {
      workingDays++;
    }
  }

  return {
    presentDays: presentDates.size,
    absentDays: Math.max(0, workingDays - presentDates.size),
    totalHours: Math.round((totalSeconds / 3600) * 10) / 10,
  };
}
