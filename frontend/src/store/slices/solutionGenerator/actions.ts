import { createAction } from '@reduxjs/toolkit';
import type { ISolutionGeneratorJob } from 'types';

// ==============================
// SOLUTION GENERATOR ACTIONS
// ==============================

/**
 * Creates or updates a solution generator job in the Redux store.
 *
 * This action is used to:
 * - Create a new job when one doesn't exist for the resource/branch combination
 * - Update an existing job with new properties while preserving the job ID
 *
 * The job ID is automatically handled by the reducer - it will reuse existing
 * IDs or generate new UUIDs as needed.
 *
 * @param payload - Job data without the ID (ID is managed by the reducer)
 */
export const upsertSolutionGeneratorJob = createAction<
  Omit<ISolutionGeneratorJob, 'id'> & { result?: any[] }
>('solutionGenerator/upsertJob');

/**
 * Updates specific properties of an existing solution generator job.
 *
 * This action is typically used to:
 * - Update job status (loading, success, failed)
 * - Store job results after API completion
 * - Update abort controller references
 * - Modify job metadata
 *
 * The reducer will merge the provided data with the existing job data.
 * If the job doesn't exist, the update will be ignored.
 *
 * @param payload - Partial job data to update (ID is managed by the reducer)
 */
export const updateSolutionGeneratorJob = createAction<
  Omit<ISolutionGeneratorJob, 'id'> & { result?: any[] }
>('solutionGenerator/updateJob');

/**
 * Deletes a specific solution generator job from the Redux store.
 *
 * This action will:
 * 1. Find the job using the resourceId and branchId combination
 * 2. Abort any ongoing requests using the job's abort controller
 * 3. Remove the job from the state
 *
 * This ensures proper cleanup of resources and prevents memory leaks
 * from ongoing network requests or timeouts.
 *
 * @param payload - Object containing resourceId and branchId to identify the job
 */
export const deleteSolutionGeneratorJob = createAction<{
  resourceId: string;
  branchId: string;
}>('solutionGenerator/deleteJob');

/**
 * Deletes multiple solution generator jobs from the Redux store.
 *
 * This action will:
 * 1. Find jobs using the branchId and resourceIds combination
 * 2. Abort any ongoing requests using each job's abort controller
 * 3. Remove the matching jobs from the state
 *
 * This ensures proper cleanup of resources and prevents memory leaks
 * from ongoing network requests or timeouts. More efficient than calling
 * deleteSolutionGeneratorJob multiple times.
 *
 * @param payload - Object containing branchId and resourceIds array to identify the jobs
 */
export const deleteSolutionGeneratorJobs = createAction<{
  branchId: string;
  resourceIds: string[];
}>('solutionGenerator/deleteJobs');

/**
 * Deletes all solution generator jobs from the Redux store.
 *
 * This action will:
 * 1. Iterate through all existing jobs
 * 2. Abort each job's ongoing requests using their abort controllers
 * 3. Clear the entire jobs state
 *
 * Useful for:
 * - Application cleanup/reset
 * - User logout scenarios
 * - Clearing all jobs when switching contexts
 *
 * No payload is required as this affects all jobs.
 */
export const deleteAllJobs = createAction('solutionGenerator/deleteAllJobs');

/**
 * Shows the replace events modal with the necessary data for event replacement.
 *
 * This action is used to:
 * - Display the modal for replacing existing events with new ones
 * - Pass the event to be added in the replacement
 * - Provide the reasons for the replacement
 * - Include the events to be deleted in the replacement process
 *
 * The modal allows users to review and confirm the replacement of events
 * before the changes are applied to the schedule.
 *
 * @param payload - Object containing modal state and replacement data
 * @param payload.toBeAddedEvent - The event that will be added in the replacement
 * @param payload.replaceReasons - Reasons for the replacement operation
 * @param payload.toBeDeletedEvents - Events that will be deleted in the replacement
 */
export const showReplaceEventsModal = createAction<{
  toBeAddedEvent: any;
  replaceReasons: any[];
  toBeDeletedEvents: any[];
}>('solutionGenerator/showReplaceEventsModal');

/**
 * Hides the replace events modal.
 *
 * This action is used to:
 * - Close the replace events modal
 * - Reset the modal state to closed
 * - Clear any temporary replacement data from the UI
 *
 * Typically called when the user cancels the replacement operation
 * or after successfully completing the event replacement.
 *
 * No payload is required as this action simply closes the modal.
 */
export const hideReplaceEventsModal = createAction(
  'solutionGenerator/hideReplaceEventsModal',
);

/**
 * Shows the conflicting events modal with the necessary data for conflict resolution.
 *
 * This action is used to:
 * - Display the modal when event conflicts are detected
 * - Pass the event that conflicts with existing events
 * - Provide detailed reasons for the conflicts
 * - Allow users to review and resolve scheduling conflicts
 *
 * The modal helps users understand why an event cannot be added and
 * provides options for resolving the conflict.
 *
 * @param payload - Object containing modal state and conflict data
 * @param payload.conflictReasons - Array of reasons explaining the conflicts
 * @param payload.toBeAddedEvent - The event that has conflicts with existing events
 */
export const showConflictingEventsModal = createAction<{
  conflictReasons: any[];
  toBeAddedEvent: any;
}>('solutionGenerator/showConflictingEventsModal');

/**
 * Hides the conflicting events modal.
 *
 * This action is used to:
 * - Close the conflicting events modal
 * - Reset the modal state to closed
 * - Clear any temporary conflict data from the UI
 *
 * Typically called when the user cancels the conflict resolution
 * or after successfully resolving the event conflicts.
 *
 * No payload is required as this action simply closes the modal.
 */
export const hideConflictingEventsModal = createAction(
  'solutionGenerator/hideConflictingEventsModal',
);

/**
 * Async thunk for creating a solution generator job.
 *
 * This is the main action that initiates the solution generation process.
 * It handles the complete workflow including debouncing, API calls,
 * error handling, and job state management.
 *
 * See ./thunks.ts for detailed implementation.
 */
export {
  createSolutionGeneratorJob,
  retriggerSolutionGeneratorJobs,
} from './thunks';
