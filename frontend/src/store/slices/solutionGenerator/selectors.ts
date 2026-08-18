import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from 'store';
import config from 'config';

// ==============================
// BASE SELECTORS
// ==============================

/**
 * Base selector to get the entire solution generator state
 */
const selectSolutionGeneratorState = (state: RootState) =>
  state.solutionGenerator;

/**
 * Base selector to get all solution generator results
 */
export const selectSolutionGeneratorResults = createSelector(
  [selectSolutionGeneratorState],
  (solutionGenerator) => solutionGenerator.solutionGeneratorResults,
);

/**
 * Base selector to get all solution generator jobs
 */
export const selectSolutionGeneratorJobs = createSelector(
  [selectSolutionGeneratorState],
  (solutionGenerator) => solutionGenerator.solutionGeneratorJobs,
);

// ==============================
// COMBINED SELECTORS
// ==============================

/**
 * Selector to get the total count of running solution generator jobs.
 *
 * This selector counts all jobs that are currently in 'loading' status,
 * which represents jobs that are actively running/processing.
 *
 * @returns Total number of jobs with 'loading' status
 */
export const selectTotalRunningJobs = createSelector(
  [selectSolutionGeneratorJobs],
  (jobs) => {
    return Object.values(jobs).filter((job) => job.status === 'loading').length;
  },
);

/**
 * Selector to determine if the maximum concurrent jobs limit has been reached or exceeded.
 *
 * This selector checks if the total number of running jobs is greater than or equal to
 * the maximum allowed concurrent jobs limit.
 *
 * @returns Boolean indicating if the job limit has been reached or exceeded
 */
export const selectIsMaxConcurrentJobsReached = createSelector(
  [selectTotalRunningJobs],
  (totalRunningJobs) => {
    return totalRunningJobs >= config.maxSolutionGeneratorConcurrentJobs;
  },
);

/**
 * Memoized selector that combines all solution generator possible events into one array.
 *
 * This selector:
 * 1. Takes all possible events from different jobs (keyed by resourceId__branchId)
 * 2. Flattens them into a single array containing all possible events
 * 3. Maintains referential equality when results haven't changed (memoization)
 *
 * @returns Array of all possible events from all solution generator jobs
 */
export const selectSolutionGeneratorPossibleEvents = createSelector(
  [selectSolutionGeneratorResults],
  (resultsRecord) => {
    const allResults: any[] = [];

    // Combine all possible events from different jobs into one array
    Object.values(resultsRecord).forEach((results) => {
      if (Array.isArray(results)) {
        allResults.push(...results);
      }
    });

    return allResults;
  },
);

/**
 * Selector to get the total count of all solution generator possible events
 *
 * @returns Total number of possible events across all jobs
 */
export const selectSolutionGeneratorPossibleEventsCount = createSelector(
  [selectSolutionGeneratorPossibleEvents],
  (allResults) => allResults.length,
);

/**
 * Selector to check if there are any solution generator possible events
 *
 * @returns Boolean indicating if any possible events exist
 */
export const selectHasSolutionGeneratorPossibleEvents = createSelector(
  [selectSolutionGeneratorPossibleEventsCount],
  (count) => count > 0,
);

/**
 * Selector that extracts the replace events modal state from the solution generator slice.
 *
 * @returns The replace events modal state object containing modal visibility and configuration
 */
export const selectReplaceEventsModal = createSelector(
  [selectSolutionGeneratorState],
  (solutionGenerator) => solutionGenerator.replaceEventsModal,
);

/**
 * Selector that extracts the conflicting events modal state from the solution generator slice.
 *
 * @returns The conflicting events modal state object containing modal visibility and configuration
 */
export const selectConflictingEventsModal = createSelector(
  [selectSolutionGeneratorState],
  (solutionGenerator) => solutionGenerator.conflictingEventsModal,
);
