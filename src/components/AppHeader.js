import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LogOut, Clock } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

export default function AppHeader({
  userName = 'Employee',
  onLogout,
  isLoggingOut = false,
}) {
  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.brandGroup}>
          <View style={styles.logoBadge}>
            <Clock size={18} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.appTitle}>Promise Attendance</Text>
            <Text style={styles.welcomeText}>Welcome, {userName}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={onLogout}
          disabled={isLoggingOut}
          activeOpacity={0.7}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color={COLORS.danger} />
          ) : (
            <>
              <LogOut size={15} color={COLORS.danger} />
              <Text style={styles.logoutText}>Logout</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  appTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  welcomeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.danger,
    marginLeft: 6,
  },
});
