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
  Layers,
  FileText,
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
  const isAbsent = status === 'absent';
  const isActive = record.isActiveSession || (!record.lastClockOut && !record.clockOutTime && !record.clockOutTimeFormatted);
  const isApproved = record.approvalStatus === 'approved';

  const sessions = Array.isArray(record.sessions) && record.sessions.length > 0
    ? record.sessions
    : null;

  const totalDuration = record.totalWorkText || record.durationText || `${record.totalWorkMinutes || record.durationMinutes || 0}m`;
  const locationName = record.location;
  const firstIn = record.firstClockIn || record.clockInTimeFormatted || record.clockIn?.time || '--';
  const lastOut = isActive ? 'In Progress' : record.lastClockOut || record.clockOutTimeFormatted || record.clockOut?.time || '--';

  const anySuspicious = (sessions && sessions.some((s) => s.security?.is_suspicious)) || Boolean(record.security?.is_suspicious);

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
            {/* Status & Approval Badges Row */}
            <View style={styles.statusRow}>
              {isActive ? (
                <View style={[styles.badge, styles.badgeActive]}>
                  <Text style={[styles.badgeText, styles.textActive]}>Active Session</Text>
                </View>
              ) : isLate ? (
                <View style={[styles.badge, styles.badgeLate]}>
                  <Text style={[styles.badgeText, styles.textLate]}>Late Arrival</Text>
                </View>
              ) : isAbsent ? (
                <View style={[styles.badge, styles.badgeAbsent]}>
                  <Text style={[styles.badgeText, styles.textAbsent]}>Absent</Text>
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

              {sessions && sessions.length > 1 && (
                <View style={[styles.badge, styles.badgeSessions]}>
                  <Layers size={12} color={colors.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.textSessions}>
                    {sessions.length} sessions
                  </Text>
                </View>
              )}
            </View>

            {/* Day Summary Overview Card */}
            <View style={styles.daySummaryCard}>
              <View style={styles.daySummaryRow}>
                <View style={styles.daySummaryItem}>
                  <Text style={styles.daySummaryLabel}>TOTAL WORK TIME</Text>
                  <Text style={styles.daySummaryValuePrimary}>
                    {isActive ? 'In Progress' : totalDuration}
                  </Text>
                </View>

                <View style={styles.daySummaryDivider} />

                <View style={styles.daySummaryItem}>
                  <Text style={styles.daySummaryLabel}>DAY PUNCH SPAN</Text>
                  <Text style={styles.daySummaryValue}>
                    {firstIn} → {lastOut}
                  </Text>
                </View>
              </View>

              {Boolean(locationName) && (
                <View style={styles.summaryLocationRow}>
                  <MapPin size={13} color={colors.textSecondary} style={{ marginRight: 5 }} />
                  <Text style={styles.summaryLocationText}>{locationName}</Text>
                </View>
              )}

              {Boolean(record?.note) && (
                <View style={styles.summaryNoteRow}>
                  <FileText size={13} color={colors.primary} style={{ marginRight: 5 }} />
                  <Text style={styles.summaryNoteText}>Note: {record.note}</Text>
                </View>
              )}
            </View>

            {/* Sessions Header */}
            {sessions && (
              <View style={styles.sessionsSectionHeader}>
                <Text style={styles.sessionsSectionTitle}>
                  PUNCH SESSIONS ({sessions.length})
                </Text>
              </View>
            )}

            {/* Render Sessions List */}
            {sessions ? (
              sessions.map((sess, idx) => {
                const sIn = sess.clockIn || {};
                const sOut = sess.clockOut || {};
                const sInDevice = (sIn.device || 'phone').toLowerCase();
                const sOutDevice = (sOut.device || 'phone').toLowerCase();
                const sIsActive = !sOut.time && !sOut.datetime;
                const sSuspicious = Boolean(sess.security?.is_suspicious);

                return (
                  <View key={sess.id || `sess-${idx}`} style={styles.sessionCard}>
                    <View style={styles.sessionCardHeader}>
                      <View style={styles.sessionIndexPill}>
                        <Text style={styles.sessionIndexText}>
                          {sessions.length > 1 ? `Session ${idx + 1}` : 'Session Details'}
                        </Text>
                      </View>
                      {Boolean(sess.durationText) && (
                        <View style={styles.sessionDurationPill}>
                          <Clock size={11} color={colors.primary} style={{ marginRight: 4 }} />
                          <Text style={styles.sessionDurationText}>{sess.durationText}</Text>
                        </View>
                      )}
                    </View>

                    {/* Clock In */}
                    <View style={styles.subSessionSection}>
                      <Text style={styles.subSectionHeading}>CLOCK IN</Text>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Time</Text>
                        <Text style={styles.detailValBold}>{sIn.time || '--'}</Text>
                      </View>

                      {Boolean(sIn.location || sIn.address) && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Location</Text>
                          <View style={styles.inlineVal}>
                            <MapPin size={12} color={colors.textMuted} style={{ marginRight: 4 }} />
                            <Text style={styles.detailVal}>
                              {sIn.address || sIn.location || 'Remote'}
                            </Text>
                          </View>
                        </View>
                      )}

                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Device & IP</Text>
                        <View style={styles.inlineVal}>
                          {sInDevice === 'pc' ? (
                            <Monitor size={12} color={colors.textMuted} style={{ marginRight: 4 }} />
                          ) : (
                            <Smartphone size={12} color={colors.textMuted} style={{ marginRight: 4 }} />
                          )}
                          <Text style={styles.detailVal}>
                            {sInDevice === 'pc' ? 'PC' : 'Mobile'}
                            {sIn.ip ? ` • ${sIn.ip}` : ''}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Divider */}
                    <View style={styles.sessionDivider} />

                    {/* Clock Out */}
                    <View style={styles.subSessionSection}>
                      <Text style={styles.subSectionHeading}>CLOCK OUT</Text>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Time</Text>
                        <Text style={[styles.detailValBold, sIsActive && styles.textActive]}>
                          {sIsActive ? 'In Progress' : sOut.time || '--'}
                        </Text>
                      </View>

                      {!sIsActive && (
                        <>
                          {Boolean(sOut.location || sOut.address) && (
                            <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>Location</Text>
                              <View style={styles.inlineVal}>
                                <MapPin size={12} color={colors.textMuted} style={{ marginRight: 4 }} />
                                <Text style={styles.detailVal}>
                                  {sOut.address || sOut.location || 'Remote'}
                                </Text>
                              </View>
                            </View>
                          )}

                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Device & IP</Text>
                            <View style={styles.inlineVal}>
                              {sOutDevice === 'pc' ? (
                                <Monitor size={12} color={colors.textMuted} style={{ marginRight: 4 }} />
                              ) : (
                                <Smartphone size={12} color={colors.textMuted} style={{ marginRight: 4 }} />
                              )}
                              <Text style={styles.detailVal}>
                                {sOutDevice === 'pc' ? 'PC' : 'Mobile'}
                                {sOut.ip ? ` • ${sOut.ip}` : ''}
                              </Text>
                            </View>
                          </View>
                        </>
                      )}
                    </View>

                    {/* Suspicious warning for this session */}
                    {sSuspicious && (
                      <View style={styles.securityWarning}>
                        <AlertTriangle size={15} color="#EF4444" style={{ marginRight: 8 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.securityWarningTitle}>Suspicious Travel Flagged</Text>
                          <Text style={styles.securityWarningBody}>{sess.security?.details}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })
            ) : null}

            {/* Overall Security Check Footer */}
            {!anySuspicious ? (
              <View style={styles.securitySafe}>
                <ShieldCheck size={16} color={colors.success} style={{ marginRight: 8 }} />
                <Text style={styles.securitySafeText}>Security & location auto-verified</Text>
              </View>
            ) : null}
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
      maxWidth: 440,
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
      flexWrap: 'wrap',
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
    badgeAbsent: {
      backgroundColor: 'rgba(239, 68, 68, 0.14)',
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
    badgeSessions: {
      backgroundColor: colors.primaryMuted,
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
    textAbsent: {
      color: '#EF4444',
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
    textSessions: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
    },
    daySummaryCard: {
      backgroundColor: colors.inputBackground,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      marginBottom: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    daySummaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    daySummaryItem: {
      flex: 1,
    },
    daySummaryDivider: {
      width: 1,
      height: 32,
      backgroundColor: colors.border,
      marginHorizontal: SPACING.md,
    },
    daySummaryLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textMuted,
      letterSpacing: 0.5,
      marginBottom: 3,
    },
    daySummaryValuePrimary: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.primary,
    },
    daySummaryValue: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.text,
    },
    summaryLocationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: SPACING.sm,
      paddingTop: SPACING.xs + 2,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    summaryLocationText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    summaryNoteRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: SPACING.xs,
      paddingTop: SPACING.xs,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    summaryNoteText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.text,
      flex: 1,
    },
    sessionsSectionHeader: {
      marginTop: SPACING.xs,
      marginBottom: SPACING.sm,
    },
    sessionsSectionTitle: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.8,
      color: colors.textMuted,
    },
    sessionCard: {
      backgroundColor: colors.inputBackground,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      marginBottom: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sessionCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.sm,
    },
    sessionIndexPill: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: RADIUS.xs,
      backgroundColor: colors.surface,
    },
    sessionIndexText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.text,
    },
    sessionDurationPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primaryMuted,
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: RADIUS.xs,
    },
    sessionDurationText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.primary,
    },
    subSessionSection: {
      marginVertical: 2,
    },
    subSectionHeading: {
      fontSize: 9,
      fontWeight: '700',
      letterSpacing: 0.6,
      color: colors.textMuted,
      marginBottom: 4,
      textTransform: 'uppercase',
    },
    sessionDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: SPACING.sm,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 3,
    },
    detailLabel: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '500',
    },
    detailValBold: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      fontVariant: ['tabular-nums'],
    },
    detailVal: {
      fontSize: 12,
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
      marginTop: SPACING.sm,
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
