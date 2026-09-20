import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle, RefreshCw } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS } from '../constants/theme';
import PrimaryButton from './PrimaryButton';

export default function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry = null,
}) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <AlertCircle size={32} color={colors.danger} />
      </View>
      <Text style={styles.title}>Unable to Load Data</Text>
      <Text style={styles.message}>{message}</Text>
      {Boolean(onRetry) && (
        <PrimaryButton
          title="Retry"
          onPress={onRetry}
          icon={<RefreshCw size={16} color={isDark ? colors.brandDark : '#FFFFFF'} />}
          style={styles.retryBtn}
        />
      )}
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
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
      backgroundColor: colors.dangerBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: SPACING.md,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: SPACING.xs,
      textAlign: 'center',
    },
    message: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
      maxWidth: 280,
      lineHeight: 18,
      marginBottom: SPACING.lg,
    },
    retryBtn: {
      paddingHorizontal: SPACING.xl,
    },
  });
}
