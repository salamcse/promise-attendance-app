import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon = null,
  variant = 'primary', // 'primary' | 'danger' | 'secondary'
  style,
  textStyle,
}) {
  const isActionDisabled = disabled || loading;

  const getBackgroundColor = () => {
    if (variant === 'danger') return COLORS.danger;
    if (variant === 'secondary') return COLORS.surface;
    return COLORS.primary;
  };

  const getTextColor = () => {
    if (variant === 'secondary') return COLORS.text;
    if (variant === 'danger') return '#FFFFFF';
    return COLORS.brandDark;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'secondary' && styles.secondaryBorder,
        isActionDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isActionDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconBox}>{icon}</View>}
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  secondaryBorder: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  disabled: {
    opacity: 0.6,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    marginRight: SPACING.sm,
  },
  text: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
