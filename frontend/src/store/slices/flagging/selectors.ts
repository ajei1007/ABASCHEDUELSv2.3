// Selectors for the flagging feature state management
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from 'store';

/**
 * Root selector for the flagging slice of the Redux state.
 * Returns the entire flagging state object.
 */
const selectFlaggingState = (state: RootState) => state.flagging;

/**
 * Selector for all flagging jobs.
 * Returns the flaggingJobs object from the flagging state, which contains all active flagging jobs keyed by job ID.
 */
export const selectFlaggingJobs = createSelector(
  [selectFlaggingState],
  (flagging) => flagging.flaggingJobs,
);

/**
 * Selector for resources currently being fetched by flagging jobs.
 * Iterates over all flagging jobs and collects all resource IDs that are currently being processed.
 * Returns a Set of resource IDs for efficient lookup.
 */
export const selectFlaggingBeingFetchedResourcesSet = createSelector(
  [selectFlaggingJobs],
  (flaggingJobs) => {
    const runningResourcesSet = new Set<string>();
    Object.values(flaggingJobs).forEach((job) => {
      Object.keys(job.resourceIds).forEach((resourceId) => {
        runningResourcesSet.add(resourceId);
      });
    });
    return runningResourcesSet;
  },
);
