// src/store/slices/onboardingChecklist/selectors.ts
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from 'store';

/**
 * Select the entire onboarding checklist state
 */
export const selectOnboardingChecklistState = (state: RootState) =>
  state.onboardingChecklist;

/**
 * Select the checklist data
 */
export const selectOnboardingChecklist = (state: RootState) =>
  state.onboardingChecklist.checklist;

/**
 * Select the fetching status
 */
export const selectOnboardingChecklistFetchingStatus = (state: RootState) =>
  state.onboardingChecklist.fetchingStatus;

/**
 * Select the error message
 */
export const selectOnboardingChecklistError = (state: RootState) =>
  state.onboardingChecklist.error;

/**
 * Select whether the checklist is currently being fetched
 */
export const selectIsOnboardingChecklistLoading = (state: RootState) =>
  state.onboardingChecklist.fetchingStatus === 'loading';

/**
 * Select the record of item IDs that are currently being toggled
 */
export const selectTogglingItems = (state: RootState) =>
  state.onboardingChecklist.togglingItems;

/**
 * Check if a specific checklist item is currently being toggled
 */
export const selectIsItemToggling = (itemId: string) => (state: RootState) =>
  !!state.onboardingChecklist.togglingItems[itemId];

/**
 * Check if any item is currently being toggled
 */
export const selectIsAnyItemToggling = (state: RootState) =>
  Object.keys(state.onboardingChecklist.togglingItems).length > 0;

/**
 * Find a specific checklist item by ID across all phases
 */
export const selectChecklistItemById =
  (itemId: string) => (state: RootState) => {
    const { checklist } = state.onboardingChecklist;

    for (const phase of checklist) {
      for (const item of phase.items) {
        if (item.id === itemId) {
          return item;
        }
      }
    }

    return null;
  };

/**
 * Calculate overall progress metrics for the entire onboarding checklist
 * Uses createSelector for memoization - only recalculates when checklist data changes
 */
export const selectOnboardingChecklistOverallProgress = createSelector(
  [selectOnboardingChecklist],
  (checklist) => {
    // Early return for empty checklist to avoid unnecessary computation
    if (!checklist?.length) {
      return {
        totalItems: 0,
        completedItems: 0,
        percentage: 0,
        isCompleted: false,
      };
    }

    // Single pass through the checklist for better performance
    const { totalItems, completedItems } = checklist.reduce(
      (acc, phase) => {
        // Guard against invalid phase data
        if (!phase?.items?.length) {
          return acc;
        }

        const phaseTotal = phase.items.length;
        const phaseCompleted = phase.items.filter(
          (item) => item?.isCompleted,
        ).length;

        return {
          totalItems: acc.totalItems + phaseTotal,
          completedItems: acc.completedItems + phaseCompleted,
        };
      },
      { totalItems: 0, completedItems: 0 },
    );

    const percentage =
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    const isCompleted = totalItems > 0 && completedItems === totalItems;

    return {
      totalItems,
      completedItems,
      percentage,
      isCompleted,
    };
  },
);

/**
 * Select the overall completion percentage (0-100)
 * Memoized - only recalculates when overall progress changes
 */
export const selectOnboardingChecklistOverallPercentage = createSelector(
  [selectOnboardingChecklistOverallProgress],
  (progress) => progress.percentage,
);

/**
 * Select the total number of items across all phases
 * Memoized - only recalculates when overall progress changes
 */
export const selectOnboardingChecklistTotalItems = createSelector(
  [selectOnboardingChecklistOverallProgress],
  (progress) => progress.totalItems,
);

/**
 * Select the number of completed items across all phases
 * Memoized - only recalculates when overall progress changes
 */
export const selectOnboardingChecklistCompletedItems = createSelector(
  [selectOnboardingChecklistOverallProgress],
  (progress) => progress.completedItems,
);

/**
 * Select whether all checklist items are completed
 * Memoized - only recalculates when overall progress changes
 */
export const selectIsOnboardingChecklistCompleted = createSelector(
  [selectOnboardingChecklistOverallProgress],
  (progress) => progress.isCompleted,
);

// Performance optimization notes:
// - selectOnboardingChecklistOverallProgress: Only recalculates when checklist data changes
// - Individual selectors: Only recalculate when the overall progress object changes
// - This ensures minimal re-renders and optimal performance across multiple components
