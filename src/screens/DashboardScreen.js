import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useAttendance } from '../context/AttendanceContext';
import { useRunningTimer } from '../hooks/useRunningTimer';
import AppHeader from '../components/AppHeader';
import StatusCard from '../components/StatusCard';
import SummaryStats from '../components/SummaryStats';
import PrimaryButton from '../components/PrimaryButton';
import { Calendar } from 'lucide-react-native';
import { COLORS, SPACING } from '../constants/theme';

export default function DashboardScreen({ onNavigateHistory }) {
  const { user, logout, isLoggingOut } = useAuth();
  const {
    activeSession,
    isClockedIn,
    attendanceStats,
    todayWorkedSeconds,
    isRefreshing,
    isSubmitting,
    actionError,
    refreshAttendance,
    handleClockIn,
    handleClockOut,
  } = useAttendance();

  // Pure decoupled timer calculation with today's accumulated duration
  const { formattedTimer } = useRunningTimer(activeSession?.clockInTime, todayWorkedSeconds);

  return (
    <View style={styles.container}>
      {/* Decoupled Header */}
      <AppHeader
        userName={user?.name || user?.username || 'Employee'}
        onLogout={logout}
        isLoggingOut={isLoggingOut}
      />

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
        {/* Status Check-in / Check-out Card */}
        <StatusCard
          isClockedIn={isClockedIn}
          formattedTimer={formattedTimer}
          isSubmitting={isSubmitting}
          onClockIn={handleClockIn}
          onClockOut={handleClockOut}
          actionError={actionError}
        />

        {/* 30-Day Summary Statistics */}
        <SummaryStats stats={attendanceStats} />

        {/* View Attendance History Navigation CTA */}
        <View style={styles.historyBtnWrapper}>
          <PrimaryButton
            title="View Attendance History"
            onPress={onNavigateHistory}
            variant="secondary"
            icon={<Calendar size={18} color={COLORS.primary} />}
            textStyle={styles.historyBtnText}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: SPACING.xxl * 2.5,
  },
  historyBtnWrapper: {
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
  },
  historyBtnText: {
    color: COLORS.text,
    fontSize: 14,
  },
});
