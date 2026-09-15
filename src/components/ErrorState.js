import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle, RefreshCw } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import PrimaryButton from './PrimaryButton';

export default function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry = null,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <AlertCircle size={32} color={COLORS.danger} />
      </View>
      <Text style={styles.title}>Unable to Load Data</Text>
      <Text style={styles.message}>{message}</Text>
      {Boolean(onRetry) && (
        <PrimaryButton
          title="Retry"
          onPress={onRetry}
          icon={<RefreshCw size={16} color={COLORS.brandDark} />}
          style={styles.retryBtn}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.dangerBg,
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
    marginBottom: SPACING.lg,
  },
  retryBtn: {
    paddingHorizontal: SPACING.xl,
  },
});
