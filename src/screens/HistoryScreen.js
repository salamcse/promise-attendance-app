import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useAttendance } from '../context/AttendanceContext';
import { ArrowLeft, Clock } from 'lucide-react-native';
import { formatDate, formatTime, formatDuration } from '../utils/dateUtils';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

export default function HistoryScreen({ onBack }) {
  const {
    attendanceLogs,
    isLoading,
    isRefreshing,
    screenError,
    refreshAttendance,
  } = useAttendance();

  return (
    <View style={styles.container}>
      {/* Top Header with Back Button */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeft size={20} color={COLORS.text} />
          <Text style={styles.headerTitle}>Attendance History</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content with Explicit States */}
      {isLoading && !isRefreshing ? (
        <LoadingState message="Loading attendance history..." />
      ) : screenError ? (
        <ErrorState message={screenError} onRetry={refreshAttendance} />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refreshAttendance}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        >
          <Text style={styles.sectionTitle}>Last 30 Days</Text>

          {attendanceLogs.length === 0 ? (
            <EmptyState
              title="No Attendance Records"
              message="No attendance check-ins recorded for this account in the last 30 days."
            />
          ) : (
            attendanceLogs.map((item, index) => {
              const dateStr = formatDate(item.date || item.clockInTime);
              const inTimeStr = formatTime(item.clockInTime);
              const outTimeStr = item.clockOutTime ? formatTime(item.clockOutTime) : 'Active';
              const durationStr = formatDuration(item.durationSeconds);
              const isActive = !item.clockOutTime;

              return (
                <View key={item.id || `rec-${index}`} style={styles.recordCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.recordDate}>{dateStr}</Text>
                    <View
                      style={[
                        styles.durationBadge,
                        isActive && styles.activeBadge,
                      ]}
                    >
                      <Clock
                        size={12}
                        color={isActive ? COLORS.success : COLORS.primary}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={[
                          styles.durationText,
                          isActive && styles.activeText,
                        ]}
                      >
                        {isActive ? 'In Progress' : durationStr}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.timesRow}>
                    <Text style={styles.timesText}>
                      {inTimeStr} → {outTimeStr}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topHeader: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: SPACING.md,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl * 2.5,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  recordCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  recordDate: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  activeBadge: {
    backgroundColor: COLORS.successBg,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  activeText: {
    color: COLORS.success,
  },
  timesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timesText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
