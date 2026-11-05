import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useAttendance } from '../context/AttendanceContext';
import { useTheme } from '../context/ThemeContext';
import { useRunningTimer } from '../hooks/useRunningTimer';
import AppHeader from '../components/AppHeader';
import StatusCard from '../components/StatusCard';
import SummaryStats from '../components/SummaryStats';
import PrimaryButton from '../components/PrimaryButton';
import { Calendar, ShieldCheck, ShieldAlert } from 'lucide-react-native';
import { SPACING, RADIUS } from '../constants/theme';

export default function DashboardScreen({ onNavigateHistory }) {
  const { user, logout, isLoggingOut } = useAuth();
  const { colors, isDark } = useTheme();
  const {
    activeSession,
    isClockedIn,
    attendanceStats,
    todayWorkedSeconds,
    isRefreshing,
    isSubmitting,
    actionError,
    isVpnDetected,
    vpnInfo,
    refreshAttendance,
    handleClockIn,
    handleClockOut,
  } = useAttendance();

  // Pure decoupled timer calculation with today's accumulated duration
  const { formattedTimer } = useRunningTimer(activeSession?.clockInTime, todayWorkedSeconds);
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

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
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* VPN Active Warning Banner */}
        {Boolean(isVpnDetected) && (
          <View style={styles.vpnBanner}>
            <ShieldAlert size={20} color="#F59E0B" style={styles.vpnIcon} />
            <View style={styles.vpnContent}>
              <Text style={styles.vpnTitle}>VPN Detected</Text>
              <Text style={styles.vpnText}>
                VPN চালু রয়েছে। সঠিক হাজিরা নিশ্চিত করতে দয়া করে VPN বন্ধ করুন।
              </Text>
              {Boolean(vpnInfo?.reason) && (
                <Text style={styles.vpnReason}>({vpnInfo.reason})</Text>
              )}
            </View>
          </View>
        )}

        {/* Status Check-in / Check-out Hero Section */}
        <StatusCard
          isClockedIn={isClockedIn}
          formattedTimer={formattedTimer}
          isSubmitting={isSubmitting}
          onClockIn={handleClockIn}
          onClockOut={handleClockOut}
          actionError={actionError}
        />

        {/* 30-Day Summary Statistics Section */}
        <SummaryStats stats={attendanceStats} />

        {/* View Attendance History Navigation CTA */}
        <View style={styles.historyBtnWrapper}>
          <PrimaryButton
            title="View Attendance History"
            onPress={onNavigateHistory}
            variant="secondary"
            icon={<Calendar size={18} color={colors.primary} />}
            textStyle={styles.historyBtnText}
          />

          <View style={styles.verifiedRow}>
            <ShieldCheck size={14} color={colors.textMuted} style={styles.verifiedIcon} />
            <Text style={styles.verifiedText}>Location & network auto-verified</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function getStyles(colors, isDark) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingBottom: SPACING.xxl * 2.5,
    },
    vpnBanner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : '#FFFBEB',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(245, 158, 11, 0.35)' : '#FDE68A',
      borderRadius: RADIUS.md || 10,
      padding: SPACING.md,
      marginHorizontal: SPACING.xl,
      marginBottom: SPACING.md,
    },
    vpnIcon: {
      marginRight: SPACING.sm,
      marginTop: 1,
    },
    vpnContent: {
      flex: 1,
    },
    vpnTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: '#D97706',
      marginBottom: 2,
    },
    vpnText: {
      fontSize: 12,
      color: isDark ? '#FCD34D' : '#92400E',
      lineHeight: 17,
      fontWeight: '500',
    },
    vpnReason: {
      fontSize: 11,
      color: isDark ? '#A7B0C0' : '#78350F',
      marginTop: 2,
    },
    historyBtnWrapper: {
      marginHorizontal: SPACING.xl,
      marginTop: SPACING.lg,
      alignItems: 'center',
    },
    historyBtnText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
    },
    verifiedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: SPACING.md,
    },
    verifiedIcon: {
      marginRight: 6,
    },
    verifiedText: {
      fontSize: 11,
      fontWeight: '500',
      color: colors.textMuted,
    },
  });
}

