import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Lock, User, Eye, EyeOff, Sun, Moon } from 'lucide-react-native';
import { SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';
import PrimaryButton from '../components/PrimaryButton';

export default function LoginScreen() {
  const { login, isLoggingIn, authError, setAuthError } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const trimmedEmail = email.trim();
  const isFormValid = trimmedEmail.length > 0 && password.length > 0;

  const styles = useMemo(() => getStyles(colors), [colors]);

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!isFormValid || isLoggingIn) return;

    try {
      await login(trimmedEmail, password);
    } catch {
      // Error is stored in authError inside AuthContext
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* Top Row: Theme Toggle */}
          <View style={styles.topRow}>
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
          </View>

          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <Image
              source={
                isDark
                  ? require('../../assets/logo.png')
                  : require('../../assets/logo-light-theme.png')
              }
              style={styles.brandLogo}
              resizeMode="contain"
            />
            <Text style={styles.brandSubtitle}>Employee Attendance Portal</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email or Username Field */}
            <Text style={styles.inputLabel}>Email or Username</Text>
            <View style={styles.inputWrapper}>
              <User size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  if (authError) setAuthError(null);
                }}
                placeholder="Enter email or username"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="default"
                returnKeyType="next"
              />
            </View>

            {/* Password Field */}
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  if (authError) setAuthError(null);
                }}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                style={styles.eyeBtn}
                activeOpacity={0.7}
              >
                {showPassword ? (
                  <EyeOff size={18} color={colors.textSecondary} />
                ) : (
                  <Eye size={18} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            {/* Error Message Display */}
            {Boolean(authError) && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{authError}</Text>
              </View>
            )}

            {/* Submit CTA */}
            <PrimaryButton
              title="LOGIN"
              onPress={handleSubmit}
              loading={isLoggingIn}
              disabled={!isFormValid || isLoggingIn}
              style={styles.loginBtn}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.xl,
    },
    card: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: colors.surface,
      borderRadius: RADIUS.xl,
      padding: SPACING.xxl,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      position: 'relative',
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginBottom: SPACING.xs,
    },
    themeToggleBtn: {
      width: 32,
      height: 32,
      borderRadius: RADIUS.full,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    brandHeader: {
      alignItems: 'center',
      marginBottom: SPACING.xl,
    },
    brandLogo: {
      width: 175,
      height: 60,
      marginBottom: SPACING.xs,
    },
    brandSubtitle: {
      ...TYPOGRAPHY.caption,
      color: colors.textMuted,
      marginTop: 4,
    },
    form: {
      gap: SPACING.sm,
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      marginTop: SPACING.xs,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: RADIUS.md,
      paddingHorizontal: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
      height: 48,
    },
    inputIcon: {
      marginRight: SPACING.sm,
    },
    input: {
      flex: 1,
      color: colors.text,
      fontSize: 14,
      height: '100%',
      ...Platform.select({
        web: {
          outlineStyle: 'none',
          outlineWidth: 0,
        },
      }),
    },
    eyeBtn: {
      padding: SPACING.xs,
    },
    errorBox: {
      backgroundColor: colors.dangerBg,
      padding: SPACING.md,
      borderRadius: RADIUS.sm,
      marginTop: SPACING.xs,
      borderWidth: 1,
      borderColor: colors.logoutPillBorder,
    },
    errorText: {
      fontSize: 12,
      color: colors.errorText,
      textAlign: 'center',
      fontWeight: '500',
    },
    loginBtn: {
      marginTop: SPACING.md,
    },
  });
}
