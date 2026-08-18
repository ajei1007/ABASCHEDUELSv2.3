import { useMemo } from 'react';
import type { IApiOnboardingChecklistPhaseItem } from 'types/api';

/**
 * Enhanced onboarding checklist phase with expansion state
 */
export interface IOnboardingPhaseWithExpansion
  extends IApiOnboardingChecklistPhaseItem {
  readonly initialExpanded: boolean;
  readonly isCompleted: boolean;
}

/**
 * Custom hook that enhances onboarding checklist phases with expansion logic.
 *
 * Determines which phase should be initially expanded based on completion status:
 * - The first incomplete phase will be expanded to guide user attention
 * - All other phases remain collapsed by default
 *
 * @param checklist - Array of onboarding checklist phases
 * @returns Enhanced checklist with expansion and completion metadata
 */
export function useOnboardingChecklistWithExpansion(
  checklist: IApiOnboardingChecklistPhaseItem[] = [],
): IOnboardingPhaseWithExpansion[] {
  return useMemo(() => {
    // Early return for empty arrays
    if (!checklist.length) {
      return [];
    }

    let firstIncompleteFound = false;

    return checklist.map((phase): IOnboardingPhaseWithExpansion => {
      // Pre-calculate completion status to avoid multiple iterations
      const isCompleted =
        phase.items?.every((item) => item.isCompleted) ?? false;

      // Determine if this phase should be initially expanded
      const shouldExpand = !firstIncompleteFound && !isCompleted;
      if (shouldExpand) {
        firstIncompleteFound = true;
      }

      return {
        ...phase,
        initialExpanded: shouldExpand,
        isCompleted,
      } as const;
    });
  }, [checklist]);
}
