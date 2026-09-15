import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';

export default function LoadingState({ message = 'Loading...' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      {Boolean(message) && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  message: {
    marginTop: SPACING.md,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
