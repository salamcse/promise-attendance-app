import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import {
  X,
  Clock,
  MapPin,
  Monitor,
  Smartphone,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Globe,
} from 'lucide-react-native';
import { formatDate } from '../utils/dateUtils';
import { SPACING, RADIUS } from '../constants/theme';

export default function AttendanceDetailModal({ visible, onClose, record }) {
  const { colors, isDark } = useTheme();
  if (!record) return null;

  const styles = getStyles(colors, isDark);

  const dateStr = formatDate(record.date || record.clockInTime);
  const status = (record.status || '').toLowerCase();
  const isLate = status === 'late';
  const isActive = record.isActiveSession || (!record.clockOutTime && !record.clockOutTimeFormatted);
  const isApproved = record.approvalStatus === 'approved';
  const isSuspicious = Boolean(record.security?.is_suspicious);

  const inTime = record.clockInTimeFormatted || record.clockIn?.time || '--';
  const inLocation = record.clockInLocation || record.clockIn?.location || 'Remote';
  const inDevice = (record.clockInDevice || record.clockIn?.device || 'pc').toLowerCase();
  const inIp = record.clockIn?.ip || '103.177.123.41';
  const inAddress = record.clockIn?.address;

  const outTime = isActive
    ? 'In Progress'
    : record.clockOutTimeFormatted || record.clockOut?.time || '--';
  const outLocation = record.clockOutLocation || record.clockOut?.location || 'Remote';
  const outDevice = (record.clockOutDevice || record.clockOut?.device || 'pc').toLowerCase();
  const outIp = record.clockOut?.ip || '103.177.123.41';
  const outAddress = record.clockOut?.address;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.dialogCard}>
          {/* Header */}
          <View style={styles.dialogHeader}>
            <View>
              <Text style={styles.dialogTitle}>Attendance Details</Text>
              <Text style={styles.dialogSubtitle}>{dateStr}</Text>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Status Badges Row */}
            <View style={styles.statusRow}>
              {isActive ? (
                <View style={[styles.badge, styles.badgeActive]}>
                  <Text style={[styles.badgeText, styles.textActive]}>Active Session</Text>
                </View>
              ) : isLate ? (
                <View style={[styles.badge, styles.badgeLate]}>
                  <Text style={[styles.badgeText, styles.textLate]}>Late Arrival</Text>
                </View>
              ) : (
                <View style={[styles.badge, styles.badgePresent]}>
                  <Text style={[styles.badgeText, styles.textPresent]}>On Time / Present</Text>
                </View>
              )}

              <View
                style={[
                  styles.badge,
                  isApproved ? styles.badgeApproved : styles.badgePending,
                ]}
              >
                {isApproved && (
                  <CheckCircle2
                    size={12}
                    color={colors.success}
                    style={{ marginRight: 4 }}
                  />
                )}
                <Text
                  style={[
                    styles.badgeText,
                    isApproved ? styles.textApproved : styles.textPending,
                  ]}
                >
                  {isApproved ? 'Approved' : 'Pending Approval'}
                </Text>
              </View>
            </View>

            {/* Total Duration Banner */}
            <View style={styles.durationBanner}>
              <Clock size={16} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.durationBannerLabel}>Total Duration:</Text>
              <Text style={styles.durationBannerValue}>
                {isActive ? 'Session Active' : record.durationText || `${record.durationMinutes || 0}m`}
              </Text>
            </View>

            {/* Clock In Section */}
            <View style={styles.sessionSection}>
              <Text style={styles.sectionHeading}>CLOCK IN DETAILS</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValBold}>{inTime}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Location</Text>
                <View style={styles.inlineVal}>
                  <MapPin size={13} color={colors.textMuted} style={{ marginRight: 4 }} />
                  <Text style={styles.detailVal}>{inLocation}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Device</Text>
                <View style={styles.inlineVal}>
                  {inDevice === 'pc' ? (
                    <Monitor size={13} color={colors.textMuted} style={{ marginRight: 4 }} />
                  ) : (
                    <Smartphone size={13} color={colors.textMuted} style={{ marginRight: 4 }} />
                  )}
                  <Text style={styles.detailVal}>{inDevice === 'pc' ? 'Desktop PC' : 'Mobile'}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>IP Address</Text>
                <View style={styles.inlineVal}>
                  <Globe size={13} color={colors.textMuted} style={{ marginRight: 4 }} />
                  <Text style={styles.detailVal}>{inIp}</Text>
                </View>
              </View>

              {inAddress && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Address</Text>
                  <Text style={styles.detailVal}>{inAddress}</Text>
                </View>
              )}
            </View>

            {/* Clock Out Section */}
            <View style={styles.sessionSection}>
              <Text style={styles.sectionHeading}>CLOCK OUT DETAILS</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValBold}>{outTime}</Text>
              </View>

              {!isActive && (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Location</Text>
                    <View style={styles.inlineVal}>
                      <MapPin size={13} color={colors.textMuted} style={{ marginRight: 4 }} />
                      <Text style={styles.detailVal}>{outLocation}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Device</Text>
                    <View style={styles.inlineVal}>
                      {outDevice === 'pc' ? (
                        <Monitor size={13} color={colors.textMuted} style={{ marginRight: 4 }} />
                      ) : (
                        <Smartphone size={13} color={colors.textMuted} style={{ marginRight: 4 }} />
                      )}
                      <Text style={styles.detailVal}>{outDevice === 'pc' ? 'Desktop PC' : 'Mobile'}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>IP Address</Text>
                    <View style={styles.inlineVal}>
                      <Globe size={13} color={colors.textMuted} style={{ marginRight: 4 }} />
                      <Text style={styles.detailVal}>{outIp}</Text>
                    </View>
                  </View>

                  {outAddress && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Address</Text>
                      <Text style={styles.detailVal}>{outAddress}</Text>
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Security Check Section */}
            {isSuspicious ? (
              <View style={styles.securityWarning}>
                <AlertTriangle size={16} color="#EF4444" style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.securityWarningTitle}>Suspicious Travel Flagged</Text>
                  <Text style={styles.securityWarningBody}>{record.security?.details}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.securitySafe}>
                <ShieldCheck size={16} color={colors.success} style={{ marginRight: 8 }} />
                <Text style={styles.securitySafeText}>Security & location auto-verified</Text>
              </View>
            )}
          </ScrollView>

          {/* Footer Close Button */}
          <View style={styles.dialogFooter}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function getStyles(colors, isDark) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.lg,
    },
    dialogCard: {
      width: '100%',
      maxWidth: 420,
      maxHeight: '85%',
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
        },
        android: {
          elevation: 12,
        },
      }),
    },
    dialogHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    dialogTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    dialogSubtitle: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: RADIUS.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.inputBackground,
    },
    scrollBody: {
      flexGrow: 0,
    },
    scrollContent: {
      padding: SPACING.xl,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      marginBottom: SPACING.md,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: RADIUS.sm,
    },
    badgeActive: {
      backgroundColor: colors.successBg,
    },
    badgeLate: {
      backgroundColor: 'rgba(245, 158, 11, 0.14)',
    },
    badgePresent: {
      backgroundColor: colors.successBg,
    },
    badgeApproved: {
      backgroundColor: colors.inputBackground,
    },
    badgePending: {
      backgroundColor: 'rgba(245, 158, 11, 0.10)',
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '700',
    },
    textActive: {
      color: colors.success,
    },
    textLate: {
      color: '#F59E0B',
    },
    textPresent: {
      color: colors.success,
    },
    textApproved: {
      color: colors.success,
    },
    textPending: {
      color: '#F59E0B',
    },
    durationBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primaryMuted,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm + 2,
      borderRadius: RADIUS.md,
      marginBottom: SPACING.lg,
    },
    durationBannerLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    durationBannerValue: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
      marginLeft: 6,
    },
    sessionSection: {
      backgroundColor: colors.inputBackground,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      marginBottom: SPACING.md,
    },
    sectionHeading: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.8,
      color: colors.textMuted,
      marginBottom: SPACING.sm,
      textTransform: 'uppercase',
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    detailLabel: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '500',
    },
    detailValBold: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      fontVariant: ['tabular-nums'],
    },
    detailVal: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    inlineVal: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    securityWarning: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)',
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      borderLeftWidth: 3,
      borderLeftColor: '#EF4444',
      marginTop: SPACING.xs,
    },
    securityWarningTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: '#EF4444',
      marginBottom: 2,
    },
    securityWarningBody: {
      fontSize: 11,
      color: isDark ? '#FCA5A5' : '#DC2626',
      lineHeight: 15,
    },
    securitySafe: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.xs,
      marginTop: SPACING.xs,
    },
    securitySafeText: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '500',
    },
    dialogFooter: {
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
    },
    actionBtn: {
      backgroundColor: colors.primary,
      paddingVertical: 11,
      borderRadius: RADIUS.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
    },
  });
}
