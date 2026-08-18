/**
 * Design system constants for onboarding checklist components
 * Centralizes colors, spacing, and animation values for consistency
 */

export const CHECKLIST_COLORS = {
  primary: 'rgb(77, 83, 224)',
  primaryHover: 'rgba(77, 83, 224, 0.6)',
  primaryBackground: 'rgba(77, 83, 224, 0.075)',
  primaryBackgroundHover: 'rgba(77, 83, 224, 0.1)',
  primaryBorder: 'rgba(77, 83, 224, 0.4)',
  primaryText: 'rgb(62, 67, 179)',
  primaryTextMuted: 'rgba(77, 83, 224, 0.8)',

  neutral: '#999',
  neutralBorder: '#E5E7EB',
  neutralBackground: '#F9FAFB',
  text: 'rgba(15, 23, 42, 0.6)',
} as const;

export const CHECKLIST_SPACING = {
  itemPadding: '0.75rem',
  itemGap: '0.85rem',
  titleMarginTop: 1,
} as const;

export const CHECKLIST_TRANSITIONS = {
  default: 'all 0.2s ease-in-out',
  color: 'color 0.2s ease-in-out',
} as const;

export const CHECKLIST_TYPOGRAPHY = {
  title: {
    fontSize: '1rem!important',
    fontWeight: 'medium' as const,
  },
  description: {
    fontSize: '0.85rem!important',
    fontWeight: '400!important',
  },
} as const;
