import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING } from '../constants/theme';

export default function SummaryStats({ stats = {} }) {
  const {
    presentDays = 0,
    lateDays = 0,
    absentDays = 0,
    totalHours = 0,
    totalWorkText = '',
    monthName = '',
  } = stats || {};

  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const headerTitle = monthName
    ? `${monthName.toUpperCase()} SUMMARY`
    : 'MONTHLY SUMMARY (30 DAYS)';

  const workTimeDisplay = totalWorkText || `${totalHours}h`;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>{headerTitle}</Text>

      <View style={styles.metricsRow}>
        <View style={styles.statCol}>
          <Text style={[styles.val, styles.valPresent]}>{presentDays}</Text>
          <Text style={styles.label}>Present</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statCol}>
          <Text style={[styles.val, styles.valLate]}>{lateDays}</Text>
          <Text style={styles.label}>Late</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statCol}>
          <Text style={[styles.val, styles.valAbsent]}>{absentDays}</Text>
          <Text style={styles.label}>Absent</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statCol}>
          <Text
            style={[styles.val, styles.valWork]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {workTimeDisplay}
          </Text>
          <Text style={styles.label}>Work Time</Text>
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
      paddingHorizontal: SPACING.md,
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
      paddingHorizontal: 2,
    },
    divider: {
      width: 1,
      height: 22,
      backgroundColor: colors.border,
    },
    val: {
      fontSize: 17,
      fontWeight: '700',
      fontVariant: ['tabular-nums'],
      marginBottom: 2,
      letterSpacing: -0.3,
    },
    valPresent: {
      color: colors.success,
    },
    valLate: {
      color: '#F59E0B',
    },
    valAbsent: {
      color: colors.danger,
    },
    valWork: {
      color: colors.primary,
      fontSize: 15,
    },
    label: {
      fontSize: 10,
      color: colors.textMuted,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.2,
    },
  });
}

