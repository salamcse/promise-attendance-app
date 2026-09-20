import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS } from '../constants/theme';
import PrimaryButton from './PrimaryButton';

export default function StatusCard({
  isClockedIn = false,
  formattedTimer = '00:00:00',
  isSubmitting = false,
  onClockIn,
  onClockOut,
  actionError = null,
}) {
  const [note, setNote] = useState('');
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  useEffect(() => {
    setNote('');
  }, [isClockedIn]);

  const handleAction = () => {
    if (isClockedIn) {
      onClockOut(note);
    } else {
      onClockIn(note);
    }
  };

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

      {/* Note Input Field */}
      <View style={styles.noteWrapper}>
        <Text style={styles.noteLabel}>Note / Reason</Text>
        <TextInput
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder="Add note (Required outside office)"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="sentences"
          returnKeyType="done"
        />
      </View>

      {/* Inline Action Error Message */}
      {Boolean(actionError) && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{actionError}</Text>
        </View>
      )}

      {/* Action Button */}
      <PrimaryButton
        title={isClockedIn ? 'CHECK OUT' : 'CHECK IN'}
        onPress={handleAction}
        loading={isSubmitting}
        disabled={isSubmitting}
        variant={isClockedIn ? 'danger' : 'primary'}
        style={styles.actionBtn}
      />
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.xl,
      padding: SPACING.xxl,
      alignItems: 'center',
      marginHorizontal: SPACING.xl,
      marginTop: SPACING.xl,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    cardClockedIn: {
      borderColor: colors.clockedInBorder,
      backgroundColor: colors.clockedInCardBg,
    },
    cardClockedOut: {
      borderColor: colors.cardBorder,
      backgroundColor: colors.surface,
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
      backgroundColor: colors.successBg,
    },
    badgeClockedOut: {
      backgroundColor: colors.clockedOutBadgeBg,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: SPACING.sm,
    },
    dotGreen: {
      backgroundColor: colors.success,
    },
    dotGray: {
      backgroundColor: colors.textMuted,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.8,
    },
    textGreen: {
      color: colors.success,
    },
    textGray: {
      color: colors.textSecondary,
    },
    timerText: {
      fontSize: 42,
      fontWeight: '800',
      color: colors.text,
      fontVariant: ['tabular-nums'],
      letterSpacing: 2,
      marginBottom: SPACING.lg,
    },
    noteWrapper: {
      width: '100%',
      marginBottom: SPACING.md,
    },
    noteLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 6,
    },
    noteInput: {
      backgroundColor: colors.inputBackground,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: SPACING.md,
      height: 44,
      color: colors.text,
      fontSize: 14,
      ...Platform.select({
        web: {
          outlineStyle: 'none',
          outlineWidth: 0,
        },
      }),
    },
    errorBox: {
      backgroundColor: colors.dangerBg,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.sm,
      marginBottom: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.logoutPillBorder,
      width: '100%',
    },
    errorText: {
      color: colors.errorText,
      fontSize: 12,
      textAlign: 'center',
      fontWeight: '500',
    },
    actionBtn: {
      width: '100%',
    },
  });
}
