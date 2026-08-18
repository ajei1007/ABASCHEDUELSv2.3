import { useAppSelector } from 'store/hooks';
import {
  selectOnboardingChecklistOverallProgress,
  selectOnboardingChecklistOverallPercentage,
  selectOnboardingChecklistTotalItems,
  selectOnboardingChecklistCompletedItems,
  selectIsOnboardingChecklistCompleted,
} from 'store/slices/onboardingChecklist/selectors';

/**
 * Return type for the onboarding progress hooks
 */
export interface UseOnboardingProgressReturn {
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
 * Custom hook for accessing overall onboarding checklist progress from Redux state.
 * This is the recommended way to access progress data across the application.
 *
 * @returns Object containing progress metrics and completion status
 *
 * @example
 * ```tsx
 * const { percentage, totalItems, completedItems, isCompleted } = useOnboardingProgress();
 * ```
 */
export function useOnboardingProgress(): UseOnboardingProgressReturn {
  return useAppSelector(selectOnboardingChecklistOverallProgress);
}

/**
 * Hook to get only the completion percentage
 */
export function useOnboardingPercentage(): number {
  return useAppSelector(selectOnboardingChecklistOverallPercentage);
}

/**
 * Hook to get only the total number of items
 */
export function useOnboardingTotalItems(): number {
  return useAppSelector(selectOnboardingChecklistTotalItems);
}

/**
 * Hook to get only the number of completed items
 */
export function useOnboardingCompletedItems(): number {
  return useAppSelector(selectOnboardingChecklistCompletedItems);
}

/**
 * Hook to check if the onboarding is fully completed
 */
export function useIsOnboardingCompleted(): boolean {
  return useAppSelector(selectIsOnboardingChecklistCompleted);
}
