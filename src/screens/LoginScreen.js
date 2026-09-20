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
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

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
      {/* Top-Right Theme Toggle (Outside form for clean centered balance) */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.themeToggleBtn}
          onPress={toggleTheme}
          activeOpacity={0.7}
          accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? (
            <Sun size={16} color="#F59E0B" />
          ) : (
            <Moon size={16} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <Image
              source={require('../../assets/logo-light-theme.png')}
              style={styles.brandLogo}
              resizeMode="contain"
            />
            <Text style={styles.brandSubtitle}>Employee Attendance Portal</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email or Username Field */}
            <Text style={styles.inputLabel}>EMAIL OR USERNAME</Text>
            <View
              style={[
                styles.inputWrapper,
                emailFocused && styles.inputWrapperFocused,
              ]}
            >
              <User
                size={18}
                color={emailFocused ? '#B88E28' : '#64748B'}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  if (authError) setAuthError(null);
                }}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder="Enter email or username"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="default"
                returnKeyType="next"
              />
            </View>

            {/* Password Field */}
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <View
              style={[
                styles.inputWrapper,
                passwordFocused && styles.inputWrapperFocused,
              ]}
            >
              <Lock
                size={18}
                color={passwordFocused ? '#B88E28' : '#64748B'}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  if (authError) setAuthError(null);
                }}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
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
                  <EyeOff size={18} color="#64748B" />
                ) : (
                  <Eye size={18} color="#64748B" />
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
      backgroundColor: '#FFFFFF',
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.xl,
      backgroundColor: '#FFFFFF',
    },
    card: {
      width: '100%',
      maxWidth: 420,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.lg,
      position: 'relative',
    },
    topNav: {
      position: 'absolute',
      top: SPACING.lg,
      right: SPACING.lg,
      zIndex: 20,
    },
    themeToggleBtn: {
      width: 38,
      height: 38,
      borderRadius: RADIUS.full,
      backgroundColor: '#F8FAFC',
      borderWidth: 1,
      borderColor: '#E2E8F0',
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
      color: '#64748B',
      marginTop: 4,
    },
    form: {
      gap: SPACING.sm,
    },
    inputLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: '#475569',
      letterSpacing: 0.8,
      marginTop: SPACING.xs,
      textTransform: 'uppercase',
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F8FAFC',
      borderRadius: RADIUS.md,
      paddingHorizontal: SPACING.lg,
      height: 50,
      borderWidth: 1.5,
      borderColor: '#E2E8F0',
    },
    inputWrapperFocused: {
      borderColor: '#B88E28',
      backgroundColor: '#FFFFFF',
    },
    inputIcon: {
      marginRight: SPACING.sm,
    },
    input: {
      flex: 1,
      color: '#0F172A',
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
      backgroundColor: '#FEE2E2',
      padding: SPACING.md,
      borderRadius: RADIUS.sm,
      marginTop: SPACING.xs,
    },
    errorText: {
      fontSize: 12,
      color: '#DC2626',
      textAlign: 'center',
      fontWeight: '500',
    },
    loginBtn: {
      marginTop: SPACING.md,
    },
  });
}
