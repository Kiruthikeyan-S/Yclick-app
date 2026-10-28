/**
 * YClick Design System - Spacing, Border Radii & Refined Elevations
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  screenPadding: 18,
  borderRadiusSm: 8,
  borderRadiusMd: 14,
  borderRadiusLg: 18,
  borderRadiusXl: 26,
  touchTargetMin: 48,
} as const;

export const Shadows = {
  none: {},
  subtle: {
    shadowColor: '#20362C',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  card: {
    shadowColor: '#20362C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  raised: {
    shadowColor: '#20362C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 16,
    elevation: 4,
  },
  floating: {
    shadowColor: '#20362C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
} as const;
