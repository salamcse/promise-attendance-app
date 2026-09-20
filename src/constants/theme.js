/**
 * Centralized Design System & Theme Tokens for Promise Attendance
 */

export const DARK_COLORS = {
  mode: 'dark',
  // Brand Gold Accents
  primary: '#C7A250',
  primaryPressed: '#D8B568',
  primaryMuted: 'rgba(199, 162, 80, 0.15)',

  // Backgrounds & Surfaces (Unified dark canvas)
  brandDark: '#1D1D1B',
  background: '#0B0F19',
  surface: '#0B0F19',
  surfaceHover: '#0B0F19',
  border: '#1E293B',

  // Input & Card Specifics
  inputBackground: '#131A2A',
  cardBorder: '#1E293B',
  clockedInCardBg: 'transparent',
  clockedInBorder: '#1E293B',
  clockedOutBadgeBg: 'rgba(167, 176, 192, 0.08)',

  // Typography Colors
  text: '#FFFFFF',
  textSecondary: '#A7B0C0',
  textMuted: '#64748B',

  // Status & Semantic Colors
  success: '#10B981',
  successBg: 'rgba(16, 185, 129, 0.15)',
  danger: '#EF4444',
  dangerBg: 'rgba(239, 68, 68, 0.15)',
  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.15)',
  errorText: '#FCA5A5',

  // Pills & Badges
  logoutPillBg: 'rgba(239, 68, 68, 0.08)',
  logoutPillBorder: 'rgba(239, 68, 68, 0.25)',
  statusPillBg: 'rgba(16, 185, 129, 0.1)',
  statusPillBorder: 'rgba(16, 185, 129, 0.25)',
  avatarBg: 'rgba(199, 162, 80, 0.12)',

  // System
  statusBarStyle: 'light-content',
  navShadow: '0 -2px 10px rgba(0, 0, 0, 0.25)',
  headerShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
};

export const LIGHT_COLORS = {
  mode: 'light',
  // Brand Gold Accents
  primary: '#B88E28',
  primaryPressed: '#9E771D',
  primaryMuted: 'rgba(184, 142, 40, 0.12)',

  // Backgrounds & Surfaces (Unified pure white canvas)
  brandDark: '#1D1D1B',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceHover: '#FFFFFF',
  border: '#E2E8F0',

  // Input & Card Specifics
  inputBackground: '#F8FAFC',
  cardBorder: '#E2E8F0',
  clockedInCardBg: 'transparent',
  clockedInBorder: '#E2E8F0',
  clockedOutBadgeBg: 'rgba(100, 116, 139, 0.08)',

  // Typography Colors
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',

  // Status & Semantic Colors
  success: '#059669',
  successBg: 'rgba(5, 150, 105, 0.1)',
  danger: '#DC2626',
  dangerBg: 'rgba(220, 38, 38, 0.08)',
  warning: '#D97706',
  warningBg: 'rgba(217, 119, 6, 0.1)',
  errorText: '#B91C1C',

  // Pills & Badges
  logoutPillBg: 'rgba(220, 38, 38, 0.08)',
  logoutPillBorder: 'rgba(220, 38, 38, 0.2)',
  statusPillBg: 'rgba(5, 150, 105, 0.08)',
  statusPillBorder: 'rgba(5, 150, 105, 0.2)',
  avatarBg: 'rgba(184, 142, 40, 0.1)',

  // System
  statusBarStyle: 'dark-content',
  navShadow: '0 -2px 10px rgba(0, 0, 0, 0.06)',
  headerShadow: '0 2px 10px rgba(0, 0, 0, 0.06)',
};

// Default backwards compatibility fallback
export const COLORS = LIGHT_COLORS;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

export const TYPOGRAPHY = {
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
  },
  subheading: {
    fontSize: 14,
    fontWeight: '600',
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
  },
};
