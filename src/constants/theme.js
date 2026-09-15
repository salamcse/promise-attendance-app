/**
 * Centralized Design System & Theme Tokens for Promise Attendance
 */

export const COLORS = {
  // Brand Gold Accents
  primary: '#C7A250',
  primaryPressed: '#D8B568',
  primaryMuted: 'rgba(199, 162, 80, 0.15)',

  // Backgrounds & Surfaces
  brandDark: '#1D1D1B',
  background: '#0B0F19',
  surface: '#131A2A',
  surfaceHover: '#1B2438',
  border: '#232D42',

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
};

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
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  subheading: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.text,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
};
