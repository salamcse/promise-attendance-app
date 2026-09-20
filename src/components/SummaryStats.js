import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS } from '../constants/theme';

export default function SummaryStats({ stats = { presentDays: 0, absentDays: 0, totalHours: 0 } }) {
  const { presentDays = 0, absentDays = 0, totalHours = 0 } = stats;
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={[styles.val, styles.valPresent]}>{presentDays}</Text>
        <Text style={styles.label}>Present</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.card}>
        <Text style={[styles.val, styles.valAbsent]}>{absentDays}</Text>
        <Text style={styles.label}>Absent</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.card}>
        <Text style={[styles.val, styles.valHours]}>{totalHours}h</Text>
        <Text style={styles.label}>Hours</Text>
      </View>
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      paddingVertical: SPACING.lg,
      paddingHorizontal: SPACING.md,
      marginHorizontal: SPACING.xl,
      marginTop: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    card: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    divider: {
      width: 1,
      height: 36,
      backgroundColor: colors.border,
    },
    val: {
      fontSize: 22,
      fontWeight: '800',
      fontVariant: ['tabular-nums'],
      marginBottom: 4,
    },
    valPresent: {
      color: colors.success,
    },
    valAbsent: {
      color: colors.danger,
    },
    valHours: {
      color: colors.primary,
    },
    label: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '600',
    },
  });
}
