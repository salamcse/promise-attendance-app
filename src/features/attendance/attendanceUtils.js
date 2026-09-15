/**
 * Attendance calculation utilities
 */

/**
 * Calculate 30-day attendance statistics
 *
 * @param {Array} records - Normalized attendance history records
 * @param {Object} options - Calculation options (weekendDays, daysCount, etc.)
 * @returns {{ presentDays: number, absentDays: number, totalHours: number }}
 */
export function calculateAttendanceStats(records = [], options = {}) {
  const {
    weekendDays = [5], // Default: Friday (5)
    daysCount = 30,
    referenceDate = new Date(),
  } = options;

  if (!Array.isArray(records) || records.length === 0) {
    // Even if no records, compute total expected working days
    let workingDaysCount = 0;
    for (let i = 1; i <= daysCount; i++) {
      const d = new Date(referenceDate.getTime() - i * 24 * 60 * 60 * 1000);
      if (!weekendDays.includes(d.getDay())) {
        workingDaysCount++;
      }
    }
    return { presentDays: 0, absentDays: workingDaysCount, totalHours: 0 };
  }

  const windowStartMs = referenceDate.getTime() - daysCount * 24 * 60 * 60 * 1000;

  // Filter records strictly within the window
  const recentRecords = records.filter((r) => {
    const timestamp = new Date(r.clockInTime || r.date).getTime();
    return Number.isFinite(timestamp) && timestamp >= windowStartMs;
  });

  // Unique present days
  const presentDates = new Set();
  let totalSeconds = 0;

  recentRecords.forEach((r) => {
    const dateStr = (r.date || (r.clockInTime ? r.clockInTime.split('T')[0] : '')).trim();
    if (dateStr) {
      presentDates.add(dateStr);
    }
    totalSeconds += r.durationSeconds || 0;
  });

  const presentDays = presentDates.size;
  const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;

  // Calculate working days in the last 30 days
  let workingDaysCount = 0;
  for (let i = 1; i <= daysCount; i++) {
    const d = new Date(referenceDate.getTime() - i * 24 * 60 * 60 * 1000);
    if (!weekendDays.includes(d.getDay())) {
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
