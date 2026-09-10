/**
 * Pure utility function to calculate last 30-day attendance statistics.
 *
 * @param {Array} records - Attendance history records
 * @returns {{ presentDays: number, absentDays: number, totalHours: number }}
 */
export function calculateMonthStats(records = []) {
  if (!Array.isArray(records) || records.length === 0) {
    return { presentDays: 0, absentDays: 0, totalHours: 0 };
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Filter records within last 30 days
  const recentRecords = records.filter((r) => {
    const time = new Date(r.clockInTime || r.date).getTime();
    return time >= thirtyDaysAgo.getTime();
  });

  // Unique present days
  const presentDates = new Set();
  let totalSeconds = 0;

  recentRecords.forEach((r) => {
    const dateStr = (r.date || r.clockInTime || '').split('T')[0];
    if (dateStr) presentDates.add(dateStr);
    totalSeconds += r.durationSeconds || 0;
  });

  const presentDays = presentDates.size;
  const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;

  // Calculate working days in the last 30 days (excluding Fridays, as standard weekend)
  let workingDaysCount = 0;
  for (let i = 1; i <= 30; i++) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayOfWeek = d.getDay();
    // 5 = Friday
    if (dayOfWeek !== 5) {
      workingDaysCount++;
    }
  }

  const absentDays = Math.max(0, workingDaysCount - presentDays);

  return {
    presentDays,
    absentDays,
    totalHours,
  };
}
