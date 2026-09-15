import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

export default function EmptyState({
  title = 'No Records Found',
  message = 'There are no attendance records to display for this period.',
  icon = null,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        {icon || <Calendar size={32} color={COLORS.textMuted} />}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 1.5,
    paddingHorizontal: SPACING.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
});
