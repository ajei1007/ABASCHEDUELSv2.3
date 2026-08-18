import { useAppSelector } from 'store/hooks';
import { selectOnboardingChecklistOverallProgress } from 'store/slices/onboardingChecklist/selectors';

/**
 * Return type for the onboarding checklist overall progress hook
 */
export interface UseOnboardingChecklistOverallProgressReturn {
  /** Overall completion percentage (0-100) */
  percentage: number;
  /** Total number of items across all phases */
  totalItems: number;
  /** Number of completed items across all phases */
  completedItems: number;
  /** Whether all items are completed */
  isCompleted: boolean;
}

/**
 * Custom hook for calculating overall progress across all onboarding checklist phases.
 * Uses Redux state to calculate progress metrics.
 *
 * @returns Object containing progress metrics and completion status
 *
 * @example
 * ```tsx
 * const { percentage, totalItems, completedItems, isCompleted } =
 *   useOnboardingChecklistOverallProgress();
 * ```
 */
export function useOnboardingChecklistOverallProgress(): UseOnboardingChecklistOverallProgressReturn {
  const progressMetrics = useAppSelector(
    selectOnboardingChecklistOverallProgress,
  );

  return progressMetrics;
}
