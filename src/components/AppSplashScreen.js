import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Easing,
  StatusBar,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS } from '../constants/theme';

export default function AppSplashScreen({ isReady = false, onFinish }) {
  const { colors, isDark } = useTheme();

  // Animation values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.82)).current;
  const logoTranslateY = useRef(new Animated.Value(14)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  // 1. Run Entrance Animation
  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6.5,
        tension: 45,
        useNativeDriver: true,
      }),
      Animated.timing(logoTranslateY, {
        toValue: 0,
        duration: 550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Subtitle entrance (staggered)
    const subtitleTimer = setTimeout(() => {
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 300);

    // Indeterminate Progress Bar loop
    const progressLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 850,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: 0,
          duration: 850,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    progressLoop.start();

    return () => {
      clearTimeout(subtitleTimer);
      progressLoop.stop();
    };
  }, []);

  // 2. Smooth Exit Transition once session restored and minimum display time elapsed
  useEffect(() => {
    if (!isReady) return;

    const exitTimer = setTimeout(() => {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 350,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        if (onFinish) {
          onFinish();
        }
      });
    }, 1100);

    return () => clearTimeout(exitTimer);
  }, [isReady, onFinish]);

  // Interpolate progress slider
  const translateX = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 68],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          opacity: containerOpacity,
        },
      ]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <View style={styles.centerContent}>
        {/* Animated Brand Logo */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: logoOpacity,
              transform: [
                { scale: logoScale },
                { translateY: logoTranslateY },
              ],
            },
          ]}
        >
          <Image
            source={
              isDark
                ? require('../../assets/logo.png')
                : require('../../assets/logo-light-theme.png')
            }
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Animated Brand Subtitle */}
        <Animated.View
          style={[
            styles.subtitleWrapper,
            { opacity: subtitleOpacity },
          ]}
        >
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Employee Attendance Portal
          </Text>
        </Animated.View>

        {/* Animated Sleek Loading Progress Indicator */}
        <Animated.View
          style={[
            styles.progressTrack,
            {
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.05)',
              opacity: subtitleOpacity,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.progressThumb,
              {
                backgroundColor: colors.primary,
                transform: [{ translateX }],
              },
            ]}
          />
        </Animated.View>
      </View>

      {/* Subtle Footer Watermark */}
      <View style={styles.footerWatermark}>
        <Text style={[styles.watermarkText, { color: colors.textMuted }]}>
          PROMISE GROUP
        </Text>
      </View>
    </Animated.View>
  );
}

const TRACK_WIDTH = 100;
const THUMB_WIDTH = 32;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  centerContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  logo: {
    width: 210,
    height: 68,
  },
  subtitleWrapper: {
    marginTop: 2,
    marginBottom: SPACING.xl + 4,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  progressTrack: {
    width: TRACK_WIDTH,
    height: 3,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressThumb: {
    width: THUMB_WIDTH,
    height: '100%',
    borderRadius: RADIUS.full,
  },
  footerWatermark: {
    position: 'absolute',
    bottom: SPACING.xxl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  watermarkText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    opacity: 0.6,
  },
});
