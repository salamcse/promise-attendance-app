import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Platform } from 'react-native';
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
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  return (
    <View style={styles.headerContainer}>
      {/* 1. Header Top Bar (Brand & Actions) */}
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

      {/* 2. User Profile Section (Dedicated Background Band) */}
      <View style={styles.profileSection}>
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

function getStyles(colors, isDark) {
  return StyleSheet.create({
    headerContainer: {
      width: '100%',
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.sm + 2,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      zIndex: 10,
      ...Platform.select({
        ios: {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: isDark ? 0.2 : 0.05,
          shadowRadius: 6,
        },
        android: {
          elevation: isDark ? 8 : 4,
        },
        web: {
          boxShadow: colors.headerShadow,
        },
      }),
    },
    logo: {
      width: 140,
      height: 50,
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
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
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
      fontSize: 10,
      fontWeight: '700',
      color: colors.danger,
      marginLeft: 4,
      letterSpacing: 0.2,
    },
    profileSection: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.sm + 4,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.avatarBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: SPACING.md - 2,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    avatarText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primary,
      letterSpacing: 0.3,
    },
    userInfo: {
      flex: 1,
      marginRight: SPACING.sm,
    },
    welcomeGreeting: {
      fontSize: 9,
      fontWeight: '600',
      color: colors.textMuted,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
    },
    userNameText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginTop: 1,
      letterSpacing: -0.2,
    },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.statusPillBg,
      paddingHorizontal: SPACING.sm + 2,
      paddingVertical: 3,
      borderRadius: RADIUS.full,
      borderWidth: 1,
      borderColor: colors.statusPillBorder,
    },
    statusDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: colors.success,
      marginRight: 4,
    },
    statusText: {
      fontSize: 9,
      fontWeight: '700',
      color: colors.success,
      letterSpacing: 0.2,
    },
  });
}
