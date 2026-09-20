import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, Platform } from 'react-native';
import { FileText } from 'lucide-react-native';
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
  const [isFocused, setIsFocused] = useState(false);
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark, isClockedIn), [colors, isDark, isClockedIn]);

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
    <View style={styles.section}>
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
      <Text style={styles.timerSubText}>
        {isClockedIn ? "Today's shift elapsed time" : 'Ready to record attendance'}
      </Text>

      {/* Note Input Field */}
      <View style={styles.noteWrapper}>
        <Text style={styles.noteLabel}>NOTE / REASON</Text>
        <View
          style={[
            styles.inputWrapper,
            isFocused && styles.inputWrapperFocused,
          ]}
        >
          <FileText
            size={16}
            color={isFocused ? colors.primary : colors.textMuted}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Add note (Required outside office)"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="sentences"
            returnKeyType="done"
          />
        </View>
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

function getStyles(colors, isDark, isClockedIn) {
  return StyleSheet.create({
    section: {
      width: '100%',
      alignItems: 'center',
      paddingHorizontal: SPACING.xl,
      paddingTop: SPACING.lg + 2,
      paddingBottom: SPACING.lg + 2,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: RADIUS.full,
      marginBottom: SPACING.sm + 2,
      borderWidth: 1,
    },
    badgeClockedIn: {
      backgroundColor: colors.successBg,
      borderColor: colors.statusPillBorder,
    },
    badgeClockedOut: {
      backgroundColor: colors.clockedOutBadgeBg,
      borderColor: colors.border,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: SPACING.sm - 2,
    },
    dotGreen: {
      backgroundColor: colors.success,
    },
    dotGray: {
      backgroundColor: colors.textMuted,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    textGreen: {
      color: colors.success,
    },
    textGray: {
      color: colors.textSecondary,
    },
    timerText: {
      fontSize: 34,
      fontWeight: '700',
      color: colors.text,
      fontVariant: ['tabular-nums'],
      letterSpacing: 1.5,
    },
    timerSubText: {
      fontSize: 11,
      fontWeight: '500',
      color: colors.textMuted,
      marginTop: 3,
      marginBottom: SPACING.lg,
    },
    noteWrapper: {
      width: '100%',
      marginBottom: SPACING.md + 2,
    },
    noteLabel: {
      fontSize: 10,
      fontWeight: '600',
      letterSpacing: 0.6,
      color: colors.textMuted,
      marginBottom: 6,
      textTransform: 'uppercase',
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: RADIUS.md,
      paddingHorizontal: SPACING.md,
      height: 44,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inputWrapperFocused: {
      borderColor: colors.primary,
      backgroundColor: colors.surface,
    },
    inputIcon: {
      marginRight: SPACING.sm,
    },
    noteInput: {
      flex: 1,
      height: '100%',
      color: colors.text,
      fontSize: 13,
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
      marginBottom: SPACING.md,
      width: '100%',
      borderWidth: 1,
      borderColor: colors.danger,
    },
    errorText: {
      color: colors.errorText,
      fontSize: 12,
      textAlign: 'center',
      fontWeight: '600',
    },
    actionBtn: {
      width: '100%',
    },
  });
}
