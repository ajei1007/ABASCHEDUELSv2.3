import { useMemo } from 'react';
import type { IApiOnboardingChecklistPhaseItem } from 'types/api';

export interface UseOnboardingChecklistPhaseProgressParams {
  /** Phase data containing checklist items */
  phase: IApiOnboardingChecklistPhaseItem;
}

export interface UseOnboardingChecklistPhaseProgressReturn {
  /** Progress percentage (0-100) */
  percentage: number;
  /** Total number of items in the phase */
  totalItems: number;
  /** Number of completed items */
  completedItems: number;
  /** Whether all items in the phase are completed */
  isCompleted: boolean;
}

/**
 * Custom hook to calculate progress statistics for an onboarding checklist phase
 *
 * @param params - Hook parameters
 * @returns Progress statistics for the phase
 */
export function useOnboardingChecklistPhaseProgress({
  phase,
}: UseOnboardingChecklistPhaseProgressParams): UseOnboardingChecklistPhaseProgressReturn {
  const items = phase.items || [];
  const totalItems = items.length;

  const completedItems = useMemo(
    () => items.filter((item) => item.isCompleted).length,
    [items],
  );

  const percentage = useMemo(
    () =>
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
    [totalItems, completedItems],
  );

  const isCompleted = useMemo(
    () => totalItems > 0 && completedItems === totalItems,
    [totalItems, completedItems],
  );

  return {
    percentage,
    totalItems,
    completedItems,
    isCompleted,
  };
}
