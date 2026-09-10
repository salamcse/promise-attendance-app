import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAttendance } from '../context/AttendanceContext';

export default function SummaryStats() {
  const { monthStats } = useAttendance();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={[styles.val, styles.valPresent]}>{monthStats.presentDays}</Text>
        <Text style={styles.label}>Present</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.card}>
        <Text style={[styles.val, styles.valAbsent]}>{monthStats.absentDays}</Text>
        <Text style={styles.label}>Absent</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.card}>
        <Text style={[styles.val, styles.valHours]}>{monthStats.totalHours}h</Text>
        <Text style={styles.label}>Hours</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginHorizontal: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: '#334155',
  },
  val: {
    fontSize: 22,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    marginBottom: 4,
  },
  valPresent: {
    color: '#10B981',
  },
  valAbsent: {
    color: '#F43F5E',
  },
  valHours: {
    color: '#6366F1',
  },
  label: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
