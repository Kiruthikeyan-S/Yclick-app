/**
 * YClick Design System - Colors (Light Theme Only)
 * Calm, natural colors inspired by interiors and architecture.
 */
export const Colors = {
  // Primary Palette
  background: '#F7F8F4',
  cardBackground: '#FFFFFF',
  primary: '#244C3E', // Forest green
  secondary: '#557367', // Muted green
  subtleBackground: '#EDF4EE',
  border: '#E1E6DF',

  // Typography
  textPrimary: '#20362C',
  textSecondary: '#68756D',
  textMuted: '#8D9B93',
  textLight: '#FFFFFF',

  // Interactive & Feedback (Accessible)
  success: '#15803D',
  successBackground: '#DCFCE7',
  warning: '#B45309',
  warningBackground: '#FEF3C7',
  error: '#DC2626',
  errorBackground: '#FEE2E2',

  // Highlights & UI elements
  overlay: 'rgba(32, 54, 44, 0.45)',
  disabled: '#CBD5CD',
  disabledText: '#8D9B93',
  inputBackground: '#FFFFFF',
  ripple: 'rgba(36, 76, 62, 0.1)',
} as const;

export type ColorType = typeof Colors;
