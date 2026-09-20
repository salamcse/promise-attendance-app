import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { RADIUS, SPACING } from '../constants/theme';

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
  const { colors, isDark } = useTheme();
  const isActionDisabled = disabled || loading;

  const getBackgroundColor = () => {
    if (variant === 'danger') return colors.danger;
    if (variant === 'secondary') return colors.inputBackground;
    return colors.primary;
  };

  const getTextColor = () => {
    if (variant === 'secondary') return colors.text;
    if (variant === 'danger') return '#FFFFFF';
    return isDark ? colors.brandDark : '#FFFFFF';
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: variant === 'secondary' ? colors.border : 'transparent',
        },
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
