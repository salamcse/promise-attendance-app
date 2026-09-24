import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  TouchableWithoutFeedback,
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
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const scrollViewRef = useRef(null);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => {
      setIsKeyboardOpen(true);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardOpen(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const trimmedEmail = email.trim();
  const isFormValid = trimmedEmail.length > 0 && password.length > 0;

  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!isFormValid || isLoggingIn) return;

    try {
      await login(trimmedEmail, password);
    } catch {
      // Error is stored in authError inside AuthContext
    }
  };

  const handleInputFocus = (field) => {
    if (field === 'email') setEmailFocused(true);
    if (field === 'password') setPasswordFocused(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
    >
      {/* Top-Right Theme Toggle */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.themeToggleBtn}
          onPress={toggleTheme}
          activeOpacity={0.7}
          accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? (
            <Sun size={17} color="#F59E0B" />
          ) : (
            <Moon size={17} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.scrollContent,
          isKeyboardOpen && styles.scrollContentKeyboard,
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.card}>
            {/* Brand Header */}
            <View style={[styles.brandHeader, isKeyboardOpen && styles.brandHeaderKeyboard]}>
              <Image
                source={
                  isDark
                    ? require('../../assets/logo.png')
                    : require('../../assets/logo-light-theme.png')
                }
                style={[styles.brandLogo, isKeyboardOpen && styles.brandLogoKeyboard]}
                resizeMode="contain"
              />
              {!isKeyboardOpen && (
                <Text style={styles.brandSubtitle}>Employee Attendance Portal</Text>
              )}
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
                  color={emailFocused ? colors.primary : colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (authError) setAuthError(null);
                  }}
                  onFocus={() => handleInputFocus('email')}
                  onBlur={() => setEmailFocused(false)}
                  placeholder="Enter email or username"
                  placeholderTextColor={colors.textMuted}
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
                  color={passwordFocused ? colors.primary : colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (authError) setAuthError(null);
                  }}
                  onFocus={() => handleInputFocus('password')}
                  onBlur={() => setPasswordFocused(false)}
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
                    <EyeOff size={18} color={colors.textMuted} />
                  ) : (
                    <Eye size={18} color={colors.textMuted} />
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
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function getStyles(colors, isDark) {
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
      backgroundColor: colors.background,
    },
    scrollContentKeyboard: {
      justifyContent: 'flex-start',
      paddingTop: Platform.OS === 'ios' ? SPACING.xxl : SPACING.lg,
      paddingBottom: Platform.OS === 'ios' ? 100 : 150,
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
      backgroundColor: isDark ? colors.inputBackground : '#F8FAFC',
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    brandHeader: {
      alignItems: 'center',
      marginBottom: SPACING.xl,
    },
    brandHeaderKeyboard: {
      marginBottom: SPACING.sm,
      marginTop: Platform.OS === 'ios' ? SPACING.xs : 0,
    },
    brandLogo: {
      width: 175,
      height: 60,
      marginBottom: SPACING.xs,
    },
    brandLogoKeyboard: {
      width: 125,
      height: 38,
      marginBottom: 0,
    },
    brandSubtitle: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      marginTop: 4,
    },
    form: {
      gap: SPACING.sm,
    },
    inputLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
      letterSpacing: 0.8,
      marginTop: SPACING.xs,
      textTransform: 'uppercase',
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: RADIUS.md,
      paddingHorizontal: SPACING.lg,
      height: 50,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    inputWrapperFocused: {
      borderColor: colors.primary,
      backgroundColor: isDark ? '#172033' : '#FFFFFF',
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
      borderWidth: 1,
      borderColor: isDark ? 'rgba(239, 68, 68, 0.35)' : 'rgba(220, 38, 38, 0.2)',
      padding: SPACING.md,
      borderRadius: RADIUS.sm,
      marginTop: SPACING.xs,
    },
    errorText: {
      fontSize: 12,
      color: colors.errorText || colors.danger,
      textAlign: 'center',
      fontWeight: '500',
    },
    loginBtn: {
      marginTop: SPACING.md,
    },
  });
}
