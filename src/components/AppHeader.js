import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { LogOut, Sun, Moon } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS } from '../constants/theme';

function getInitials(name) {
  if (!name) return 'EM';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const cleanParts = parts.filter((p) => !p.toLowerCase().startsWith('md'));
  if (cleanParts.length >= 2) {
    return (cleanParts[0][0] + cleanParts[1][0]).toUpperCase();
  }
  if (cleanParts.length === 1) {
    return cleanParts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function AppHeader({
  userName = 'Employee',
  onLogout,
  isLoggingOut = false,
}) {
  const { colors, isDark, toggleTheme } = useTheme();
  const initials = getInitials(userName);
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.header}>
      {/* Top Bar: Brand Identity & Actions */}
      <View style={styles.topBar}>
        <Image
          source={
            isDark
              ? require('../../assets/logo.png')
              : require('../../assets/logo-light-theme.png')
          }
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.actionsGroup}>
          {/* Theme Toggle Button */}
          <TouchableOpacity
            style={styles.themeToggleBtn}
            onPress={toggleTheme}
            activeOpacity={0.7}
            accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? (
              <Sun size={15} color="#F59E0B" />
            ) : (
              <Moon size={15} color={colors.primary} />
            )}
          </TouchableOpacity>

          {/* Logout Action */}
          <TouchableOpacity
            style={styles.logoutPill}
            onPress={onLogout}
            disabled={isLoggingOut}
            activeOpacity={0.7}
          >
            {isLoggingOut ? (
              <ActivityIndicator size="small" color={colors.danger} />
            ) : (
              <>
                <LogOut size={13} color={colors.danger} />
                <Text style={styles.logoutText}>Logout</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* User Greeting Card */}
      <View style={styles.userSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.welcomeGreeting}>WELCOME BACK</Text>
          <Text style={styles.userNameText} numberOfLines={1}>
            {userName}
          </Text>
        </View>

        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Active</Text>
        </View>
      </View>
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    header: {
      paddingHorizontal: SPACING.xl,
      paddingTop: SPACING.lg,
      paddingBottom: SPACING.sm,
      backgroundColor: colors.background,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: SPACING.md,
      marginBottom: SPACING.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    logo: {
      width: 120,
      height: 32,
    },
    actionsGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    themeToggleBtn: {
      width: 32,
      height: 32,
      borderRadius: RADIUS.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoutPill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 5,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.full,
      backgroundColor: colors.logoutPillBg,
      borderWidth: 1,
      borderColor: colors.logoutPillBorder,
    },
    logoutText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.danger,
      marginLeft: 5,
      letterSpacing: 0.3,
    },
    userSection: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    avatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.avatarBg,
      borderWidth: 1.5,
      borderColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: SPACING.md,
    },
    avatarText: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.primary,
      letterSpacing: 0.5,
    },
    userInfo: {
      flex: 1,
      marginRight: SPACING.sm,
    },
    welcomeGreeting: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textMuted,
      letterSpacing: 0.8,
    },
    userNameText: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
      marginTop: 1,
      letterSpacing: -0.2,
    },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.statusPillBg,
      paddingHorizontal: SPACING.sm + 2,
      paddingVertical: SPACING.xs,
      borderRadius: RADIUS.full,
      borderWidth: 1,
      borderColor: colors.statusPillBorder,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.success,
      marginRight: 4,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.success,
      letterSpacing: 0.3,
    },
  });
}
