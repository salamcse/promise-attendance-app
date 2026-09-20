import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING } from '../constants/theme';

export default function SummaryStats({ stats = { presentDays: 0, absentDays: 0, totalHours: 0 } }) {
  const { presentDays = 0, absentDays = 0, totalHours = 0 } = stats;
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>MONTHLY SUMMARY (30 DAYS)</Text>

      <View style={styles.metricsRow}>
        <View style={styles.statCol}>
          <Text style={[styles.val, styles.valPresent]}>{presentDays}</Text>
          <Text style={styles.label}>Present</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statCol}>
          <Text style={[styles.val, styles.valAbsent]}>{absentDays}</Text>
          <Text style={styles.label}>Absent</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statCol}>
          <Text style={[styles.val, styles.valHours]}>{totalHours}h</Text>
          <Text style={styles.label}>Hours</Text>
        </View>
      </View>
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      width: '100%',
      paddingVertical: SPACING.md + 2,
      paddingHorizontal: SPACING.xl,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sectionHeader: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.8,
      color: colors.textMuted,
      textTransform: 'uppercase',
      marginBottom: SPACING.sm + 2,
      textAlign: 'center',
    },
    metricsRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statCol: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    divider: {
      width: 1,
      height: 22,
      backgroundColor: colors.border,
    },
    val: {
      fontSize: 18,
      fontWeight: '700',
      fontVariant: ['tabular-nums'],
      marginBottom: 2,
      letterSpacing: -0.3,
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
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '500',
    },
  });
}

