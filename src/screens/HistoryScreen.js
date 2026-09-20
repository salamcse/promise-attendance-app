import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { useAttendance } from '../context/AttendanceContext';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, Clock } from 'lucide-react-native';
import { formatDate, formatTime, formatDuration } from '../utils/dateUtils';
import { SPACING, RADIUS } from '../constants/theme';
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
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  return (
    <View style={styles.container}>
      {/* Top Header with Back Button */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeft size={20} color={colors.text} />
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
              tintColor={colors.primary}
              colors={[colors.primary]}
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
                        color={isActive ? colors.success : colors.primary}
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
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal: SPACING.xl,
      paddingTop: SPACING.lg,
      paddingBottom: SPACING.xxl * 2.5,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: SPACING.sm,
    },
    recordCard: {
      paddingVertical: SPACING.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
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
      color: colors.text,
    },
    durationBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primaryMuted,
      paddingHorizontal: SPACING.sm + 2,
      paddingVertical: 4,
      borderRadius: RADIUS.sm,
    },
    activeBadge: {
      backgroundColor: colors.successBg,
    },
    durationText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
    },
    activeText: {
      color: colors.success,
    },
    timesRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    timesText: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '500',
    },
  });
}
