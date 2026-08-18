import { useMemo } from 'react';
import {
  CHECKLIST_COLORS,
  CHECKLIST_TRANSITIONS,
  CHECKLIST_TYPOGRAPHY,
} from '../constants/checklistStyles';

/**
 * Custom hook for generating styles for checklist items
 * Uses memoization for performance optimization
 */
export function useChecklistItemStyles({
  completed,
  hasAccessToggleItem,
}: {
  completed: boolean;
  hasAccessToggleItem: boolean;
}) {
  // Memoized styles for better performance
  const containerStyles = useMemo(
    () => ({
      borderRadius: 2,
      border: '1px solid',
      borderColor: completed ? CHECKLIST_COLORS.primaryBorder : 'transparent',
      backgroundColor: completed
        ? CHECKLIST_COLORS.primaryBackground
        : 'transparent',
      transition: CHECKLIST_TRANSITIONS.default,
      cursor: hasAccessToggleItem ? 'pointer' : 'default',
      '&:hover': {
        borderColor: completed
          ? CHECKLIST_COLORS.primaryHover
          : CHECKLIST_COLORS.neutralBorder,
        backgroundColor: completed
          ? CHECKLIST_COLORS.primaryBackgroundHover
          : CHECKLIST_COLORS.neutralBackground,
      },
    }),
    [completed],
  );

  const titleStyles = useMemo(
    () => ({
      color: completed ? CHECKLIST_COLORS.primaryText : 'text.primary',
      textDecoration: completed ? 'line-through' : 'none',
      transition: CHECKLIST_TRANSITIONS.default,
      ...CHECKLIST_TYPOGRAPHY.title,
    }),
    [completed],
  );

  const checkboxStyles = useMemo(
    () => ({
      p: 0,
      color: completed
        ? `${CHECKLIST_COLORS.primary}!important`
        : CHECKLIST_COLORS.neutral,
      transition: CHECKLIST_TRANSITIONS.color,
    }),
    [completed],
  );

  return {
    containerStyles,
    titleStyles,
    checkboxStyles,
  };
}
