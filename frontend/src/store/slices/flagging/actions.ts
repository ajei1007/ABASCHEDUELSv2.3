// Redux actions for the flagging feature. These actions are used to control modal visibility, filters, data, and UI state for flagging constraints in the application.
// Redux actions for the flagging feature. These actions are used to control modal visibility, filters, data, and UI state for flagging constraints in the application.
import { createAction } from '@reduxjs/toolkit';
import type { IFlaggingJob } from 'types';

/**
 * Action to open the flagging modal dialog.
 * Triggers the UI to display the flagging modal for constraint review.
 */
export const showFlaggingModal = createAction('flagging/showFlaggingModal');

/**
 * Action to close the flagging modal dialog.
 * Triggers the UI to hide the flagging modal.
 */
export const hideFlaggingModal = createAction('flagging/hideFlaggingModal');

/**
 * Action to toggle the open/close state of the flagging modal.
 * Useful for toggling modal visibility from any UI event.
 */
export const toggleFlaggingModalOpen = createAction(
  'flagging/toggleFlaggingModalOpen',
);

/**
 * Action to set the main flagging data (constraints array).
 * Accepts an object with a constraints array, representing all constraint violations for flagging.
 */
export const setFlaggingData = createAction<{
  constraints: any[];
}>('flagging/setFlaggingData');

/**
 * Action to enable or disable the flagging feature.
 * Accepts a boolean to turn flagging on or off for the current session.
 */
export const setFlaggingEnabled = createAction<boolean>(
  'flagging/setFlaggingEnabled',
);

/**
 * Action to set the user filter for flagging.
 * Accepts an array of user objects or IDs to filter flagging data by specific users/resources.
 */
export const setFlaggingFilterUsers = createAction<any[]>(
  'flagging/setFlaggingFilterUsers',
);

/**
 * Action to set the constraint type filter for flagging.
 * Accepts an array of constraint types to filter flagging data by type.
 */
export const setFlaggingFilterConstraintTypes = createAction<any[]>(
  'flagging/setFlaggingFilterConstraintTypes',
);

/**
 * Action to set whether to show only broken constraints in the flagging modal.
 * Accepts a boolean to filter the modal view to only show broken constraints.
 */
export const setFlaggingFilterShowOnlyBroken = createAction<boolean>(
  'flagging/setFlaggingFilterShowOnlyBroken',
);

/**
 * Action to set custom constraints (array of constraint objects).
 * Accepts an array of custom constraint objects to be used in flagging logic.
 */
export const setCustomConstraints = createAction<any[]>(
  'flagging/setCustomConstraints',
);

/**
 * Action to add a flagging job to the store.
 * Accepts an IFlaggingJob object representing an async flagging request in progress.
 */
export const addFlaggingJob = createAction<IFlaggingJob>(
  'flagging/addFlaggingJob',
);

/**
 * Action to remove a flagging job from the store by job ID.
 * Accepts a string job ID to remove the corresponding job.
 */
export const removeFlaggingJob = createAction<string>(
  'flagging/removeFlaggingJob',
);

/**
 * Action to remove multiple flagging jobs from the store by job IDs.
 * Accepts an array of string job IDs to remove all specified jobs.
 */
export const removeFlaggingJobs = createAction<string[]>(
  'flagging/removeFlaggingJobs',
);

/**
 * Action to merge exclusion lists for flagging jobs.
 * Accepts a mapping of job IDs to resource IDs to be excluded from flagging results.
 */
export const mergeToBeExcluded = createAction<
  Record<string, Record<string, boolean>>
>('flagging/mergeToBeExcluded');

/**
 * Thunks and async logic for the flagging feature.
 * These are imported from thunks.ts and include async actions for fetching, saving, and updating flagging data and constraints.
 */
export {
  fetchCustomConstraints, // Fetches custom constraints and placements for the current branch
  saveDefaultConstraintPlacements, // Saves default constraint placements for the current branch
  fetchFlaggingData, // Fetches flagging data (constraint violations) for users/resources
  updateConstraintPlacements, // Updates custom constraint placements in the store (local only)
  showBrokenFlaggingConstraints, // Shows the flagging modal for newly broken constraints
} from './thunks';
