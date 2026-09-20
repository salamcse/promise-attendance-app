import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { useAttendance } from '../context/AttendanceContext';
import { useTheme } from '../context/ThemeContext';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Calendar,
} from 'lucide-react-native';
import {
  formatShortDate,
  getMonthDateRange,
  shiftMonth,
  formatTime,
} from '../utils/dateUtils';
import { SPACING, RADIUS } from '../constants/theme';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import SummaryStats from '../components/SummaryStats';
import AttendanceDetailModal from '../components/AttendanceDetailModal';

export default function HistoryScreen({ onBack }) {
  const {
    attendanceLogs,
    attendanceStats,
    isLoading,
    isRefreshing,
    screenError,
    fetchHistory,
    refreshAttendance,
  } = useAttendance();

  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  // Selected Month State (defaults to current month)
  const [selectedMonthDate, setSelectedMonthDate] = useState(new Date());
  const [isMonthLoading, setIsMonthLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const { from, to, monthLabel, isCurrentMonth } = useMemo(
    () => getMonthDateRange(selectedMonthDate),
    [selectedMonthDate]
  );

  // Fetch month data when target month changes
  const loadMonthData = useCallback(
    async (targetDate) => {
      const range = getMonthDateRange(targetDate);
      setIsMonthLoading(true);
      try {
        await fetchHistory({
          from: range.from,
          to: range.to,
          per_page: 50,
        });
      } catch {
        // Handled in context
      } finally {
        setIsMonthLoading(false);
      }
    },
    [fetchHistory]
  );

  // Initial load for current month specifically
  useEffect(() => {
    loadMonthData(selectedMonthDate);
  }, []);

  const handlePrevMonth = () => {
    const prev = shiftMonth(selectedMonthDate, -1);
    setSelectedMonthDate(prev);
    loadMonthData(prev);
  };

  const handleNextMonth = () => {
    const next = shiftMonth(selectedMonthDate, 1);
    setSelectedMonthDate(next);
    loadMonthData(next);
  };

  const handleRefresh = useCallback(() => {
    return loadMonthData(selectedMonthDate);
  }, [loadMonthData, selectedMonthDate]);

  // Filter counts
  const filterCounts = useMemo(() => {
    let late = 0;
    let present = 0;
    let absent = 0;
    (attendanceLogs || []).forEach((r) => {
      const st = (r.status || '').toLowerCase();
      if (st === 'late') late++;
      else if (st === 'present') present++;
      else if (st === 'absent') absent++;
    });
    return {
      all: attendanceLogs.length,
      late,
      present,
      absent,
    };
  }, [attendanceLogs]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    if (activeFilter === 'all') return attendanceLogs;
    return (attendanceLogs || []).filter(
      (r) => (r.status || '').toLowerCase() === activeFilter
    );
  }, [attendanceLogs, activeFilter]);

  return (
    <View style={styles.container}>
      {/* Top Header with Back Button */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeft size={20} color={colors.text} />
          <Text style={styles.headerTitle}>Attendance History</Text>
        </TouchableOpacity>
      </View>

      {/* Month Navigator Header Bar */}
      <View style={styles.monthBar}>
        <TouchableOpacity
          style={styles.monthNavBtn}
          onPress={handlePrevMonth}
          activeOpacity={0.7}
        >
          <ChevronLeft size={20} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.monthLabelContainer}>
          <Calendar size={15} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={styles.monthLabelText}>{monthLabel}</Text>
          {isCurrentMonth && <View style={styles.currentMonthDot} />}
        </View>

        <TouchableOpacity
          style={[styles.monthNavBtn, isCurrentMonth && styles.monthNavBtnDisabled]}
          onPress={handleNextMonth}
          disabled={isCurrentMonth}
          activeOpacity={0.7}
        >
          <ChevronRight
            size={20}
            color={isCurrentMonth ? colors.textMuted : colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* Main Content with Explicit States */}
      {(isLoading || isMonthLoading) && !isRefreshing ? (
        <LoadingState message={`Loading ${monthLabel} attendance...`} />
      ) : screenError ? (
        <ErrorState message={screenError} onRetry={handleRefresh} />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {/* Monthly Executive Summary for Selected Month */}
          <View style={styles.summaryWrapper}>
            <SummaryStats stats={attendanceStats} />
          </View>

          {/* Quick Filter Tabs */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                activeFilter === 'all' && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter('all')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === 'all' && styles.filterTextActive,
                ]}
              >
                All ({filterCounts.all})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                activeFilter === 'late' && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter('late')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === 'late' && styles.filterTextActive,
                ]}
              >
                Late ({filterCounts.late})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                activeFilter === 'present' && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter('present')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === 'present' && styles.filterTextActive,
                ]}
              >
                Present ({filterCounts.present})
              </Text>
            </TouchableOpacity>

            {filterCounts.absent > 0 && (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  activeFilter === 'absent' && styles.filterChipActive,
                ]}
                onPress={() => setActiveFilter('absent')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === 'absent' && styles.filterTextActive,
                  ]}
                >
                  Absent ({filterCounts.absent})
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Clean Streamlined Rows */}
          {filteredRecords.length === 0 ? (
            <EmptyState
              title={`No Records for ${monthLabel}`}
              message={
                activeFilter === 'all'
                  ? `No attendance check-ins recorded for ${monthLabel}.`
                  : `No records found with status "${activeFilter}" in ${monthLabel}.`
              }
            />
          ) : (
            filteredRecords.map((item, index) => {
              const dateStr = formatShortDate(item.date || item.clockInTime);
              const inTime = item.firstClockIn || item.clockInTimeFormatted || (item.clockInTime ? formatTime(item.clockInTime) : '--');
              const outTime = item.isActiveSession
                ? 'Active'
                : item.lastClockOut || item.clockOutTimeFormatted || (item.clockOutTime ? formatTime(item.clockOutTime) : '--');
              const durationText = item.totalWorkText || item.durationText || (item.totalWorkMinutes ? `${Math.floor(item.totalWorkMinutes / 60)}h ${item.totalWorkMinutes % 60}m` : `${item.durationMinutes || 0}m`);
              const isActive = item.isActiveSession || (!item.lastClockOut && !item.clockOutTime && !item.clockOutTimeFormatted);
              const status = (item.status || '').toLowerCase();
              const isLate = status === 'late';
              const isAbsent = status === 'absent';

              return (
                <TouchableOpacity
                  key={item.id || `rec-${index}`}
                  style={styles.cleanRow}
                  onPress={() => setSelectedRecord(item)}
                  activeOpacity={0.7}
                >
                  {/* Left Column: Date & Single Status Badge */}
                  <View style={styles.dateCol}>
                    <Text style={styles.rowDateText}>{dateStr}</Text>

                    <View
                      style={[
                        styles.miniBadge,
                        isActive
                          ? styles.miniBadgeActive
                          : isLate
                          ? styles.miniBadgeLate
                          : isAbsent
                          ? styles.miniBadgeAbsent
                          : styles.miniBadgePresent,
                      ]}
                    >
                      <Text
                        style={[
                          styles.miniBadgeText,
                          isActive
                            ? styles.miniBadgeTextActive
                            : isLate
                            ? styles.miniBadgeTextLate
                            : isAbsent
                            ? styles.miniBadgeTextAbsent
                            : styles.miniBadgeTextPresent,
                        ]}
                      >
                        {isActive ? 'Active' : isLate ? 'Late' : isAbsent ? 'Absent' : 'Present'}
                      </Text>
                    </View>
                  </View>

                  {/* Middle Column: Work Duration & Time Range */}
                  <View style={styles.timesCol}>
                    <Text style={styles.workDurationPrimary}>
                      {isActive ? 'In Progress' : durationText}
                    </Text>
                    <Text style={styles.timeRangeSub}>
                      {inTime} – {outTime}
                    </Text>
                  </View>

                  {/* Right Column: Clean Details Button */}
                  <View style={styles.viewBtn}>
                    <Eye size={13} color={colors.primary} style={{ marginRight: 4 }} />
                    <Text style={styles.viewBtnText}>Details</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Session Details Modal */}
      <AttendanceDetailModal
        visible={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        record={selectedRecord}
      />
    </View>
  );
}

function getStyles(colors, isDark) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topHeader: {
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.lg,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      zIndex: 10,
      ...Platform.select({
        ios: {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: isDark ? 0.2 : 0.05,
          shadowRadius: 6,
        },
        android: {
          elevation: isDark ? 8 : 4,
        },
        web: {
          boxShadow: colors.headerShadow,
        },
      }),
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      marginLeft: SPACING.md,
    },
    monthBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    monthNavBtn: {
      width: 36,
      height: 36,
      borderRadius: RADIUS.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.inputBackground,
    },
    monthNavBtnDisabled: {
      opacity: 0.35,
    },
    monthLabelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    monthLabelText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.2,
    },
    currentMonthDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
      marginLeft: 6,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingBottom: SPACING.xxl * 2.5,
    },
    summaryWrapper: {
      marginBottom: SPACING.md,
    },
    filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.xl,
      marginBottom: SPACING.md,
      gap: SPACING.sm,
      flexWrap: 'wrap',
    },
    filterChip: {
      paddingHorizontal: SPACING.md,
      paddingVertical: 5,
      borderRadius: RADIUS.full,
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    filterTextActive: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
    cleanRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: SPACING.md + 2,
      paddingHorizontal: SPACING.xl,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    dateCol: {
      flex: 1.1,
    },
    rowDateText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 3,
    },
    miniBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: RADIUS.xs,
    },
    miniBadgeLate: {
      backgroundColor: 'rgba(245, 158, 11, 0.12)',
    },
    miniBadgePresent: {
      backgroundColor: colors.successBg,
    },
    miniBadgeActive: {
      backgroundColor: colors.successBg,
    },
    miniBadgeAbsent: {
      backgroundColor: 'rgba(239, 68, 68, 0.12)',
    },
    miniBadgeText: {
      fontSize: 10,
      fontWeight: '700',
    },
    miniBadgeTextLate: {
      color: '#F59E0B',
    },
    miniBadgeTextPresent: {
      color: colors.success,
    },
    miniBadgeTextActive: {
      color: colors.success,
    },
    miniBadgeTextAbsent: {
      color: '#EF4444',
    },
    timesCol: {
      flex: 1.3,
      paddingHorizontal: SPACING.xs,
    },
    workDurationPrimary: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 2,
    },
    timeRangeSub: {
      fontSize: 11,
      fontWeight: '500',
      color: colors.textSecondary,
      fontVariant: ['tabular-nums'],
    },
    viewBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primaryMuted,
      paddingHorizontal: SPACING.sm + 4,
      paddingVertical: 6,
      borderRadius: RADIUS.sm,
      marginLeft: SPACING.xs,
    },
    viewBtnText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
    },
  });
}

