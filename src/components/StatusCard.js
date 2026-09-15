import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import PrimaryButton from './PrimaryButton';

export default function StatusCard({
  isClockedIn = false,
  formattedTimer = '00:00:00',
  isSubmitting = false,
  onClockIn,
  onClockOut,
  actionError = null,
}) {
  return (
    <View
      style={[
        styles.card,
        isClockedIn ? styles.cardClockedIn : styles.cardClockedOut,
      ]}
    >
      {/* State Badge */}
      <View
        style={[
          styles.badge,
          isClockedIn ? styles.badgeClockedIn : styles.badgeClockedOut,
        ]}
      >
        <View
          style={[
            styles.dot,
            isClockedIn ? styles.dotGreen : styles.dotGray,
          ]}
        />
        <Text
          style={[
            styles.badgeText,
            isClockedIn ? styles.textGreen : styles.textGray,
          ]}
        >
          {isClockedIn ? 'WORKING' : 'NOT CLOCKED IN'}
        </Text>
      </View>

      {/* Stopwatch Display */}
      <Text style={styles.timerText}>{formattedTimer}</Text>

      {/* Inline Action Error Message */}
      {Boolean(actionError) && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{actionError}</Text>
        </View>
      )}

      {/* Action Button */}
      <PrimaryButton
        title={isClockedIn ? 'CHECK OUT' : 'CHECK IN'}
        onPress={isClockedIn ? onClockOut : onClockIn}
        loading={isSubmitting}
        disabled={isSubmitting}
        variant={isClockedIn ? 'danger' : 'primary'}
        style={styles.actionBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xxl,
    alignItems: 'center',
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardClockedIn: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
  },
  cardClockedOut: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.lg,
  },
  badgeClockedIn: {
    backgroundColor: COLORS.successBg,
  },
  badgeClockedOut: {
    backgroundColor: 'rgba(167, 176, 192, 0.1)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  dotGreen: {
    backgroundColor: COLORS.success,
  },
  dotGray: {
    backgroundColor: COLORS.textMuted,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  textGreen: {
    color: COLORS.success,
  },
  textGray: {
    color: COLORS.textSecondary,
  },
  timerText: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.text,
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
    marginBottom: SPACING.xl,
  },
  errorBox: {
    backgroundColor: COLORS.dangerBg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    width: '100%',
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  actionBtn: {
    width: '100%',
  },
});
