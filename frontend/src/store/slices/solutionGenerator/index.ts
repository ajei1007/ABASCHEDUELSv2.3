import { v4 as uuidv4 } from 'uuid';
import { createSlice } from '@reduxjs/toolkit';
import {
  upsertSolutionGeneratorJob,
  updateSolutionGeneratorJob,
  deleteSolutionGeneratorJob,
  deleteSolutionGeneratorJobs,
  deleteAllJobs,
  showReplaceEventsModal,
  hideReplaceEventsModal,
  showConflictingEventsModal,
  hideConflictingEventsModal,
  createSolutionGeneratorJob,
} from './actions';
import type { ISolutionGeneratorJob } from 'types';

// ==============================
// INITIAL STATE
// ==============================

const initialReplaceEventsModal = {
  isOpen: false,
  replaceReasons: [] as any[],
  toBeAddedEvent: null as any,
  toBeDeletedEvents: [] as any[],
};

const initialConflictingEventsModal = {
  isOpen: false,
  conflictReasons: [] as any[],
  toBeAddedEvent: null as any,
};

/**
 * Initial state for the solution generator slice.
 *
 * The state contains:
 * - solutionGeneratorJobs: Record of solution generator jobs keyed by
 *   resourceId__branchId format for efficient lookup and management
 * - solutionGeneratorResults: Separate storage for solution results
 *   keyed by the same format, allowing jobs and results to be managed independently
 * - replaceEventsModal: Modal state for managing event replacement operations,
 *   including visibility, replacement reasons, and events to be added/deleted
 */
const initialState = {
  solutionGeneratorJobs: {} as Record<string, ISolutionGeneratorJob>,
  solutionGeneratorResults: {} as Record<string, any[]>,
  replaceEventsModal: initialReplaceEventsModal,
  conflictingEventsModal: initialConflictingEventsModal,
};

// ==============================
// SOLUTION GENERATOR SLICE
// ==============================

/**
 * Redux slice for managing solution generator jobs and results.
 *
 * This slice handles the lifecycle of solution generation including:
 * - Creating and updating jobs (status, metadata)
 * - Storing solution results separately from job state
 * - Managing abort controllers for cancellation
 * - Deleting individual or all jobs and their results
 *
 * Key features:
 * - Concurrent job management with a maximum limit
 * - Separate storage for jobs and results
 * - Automatic abortion of existing jobs when new ones are created
 * - Proper cleanup of resources when jobs are deleted
 */
const solutionGeneratorSlice = createSlice({
  name: 'solutionGenerator',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /**
       * Handles upserting (insert or update) a solution generator job.
       *
       * If a job already exists for the resource/branch combination,
       * it reuses the existing job ID. Otherwise, it generates a new UUID.
       * This ensures job continuity while allowing for job updates.
       */
      .addCase(upsertSolutionGeneratorJob, (state, action) => {
        const job = action.payload;
        const solutionGeneratorJobs = state.solutionGeneratorJobs;
        const jobKey = `${job.resourceId}__${job.branchId}`;

        const oldJob = solutionGeneratorJobs[jobKey];
        const { result, ...jobWithoutResult } = job;

        const newJob: ISolutionGeneratorJob = {
          ...jobWithoutResult,
          id: oldJob ? oldJob.id : uuidv4(),
        };

        solutionGeneratorJobs[jobKey] = newJob;

        // Store results separately if provided
        if (result !== undefined && result !== null) {
          state.solutionGeneratorResults[jobKey] = result;
        }
      })
      /**
       * Handles updating an existing solution generator job.
       *
       * This is used to update job properties like status or abort controller.
       * Results are stored separately in solutionGeneratorResults state.
       * Only updates if the job already exists in state.
       */
      .addCase(updateSolutionGeneratorJob, (state, action) => {
        const job = action.payload;
        const solutionGeneratorJobs = state.solutionGeneratorJobs;
        const jobKey = `${job.resourceId}__${job.branchId}`;
        const oldJob = solutionGeneratorJobs[jobKey];

        if (oldJob) {
          // Update job properties (excluding result which is stored separately)
          const { result, ...jobWithoutResult } = job;
          solutionGeneratorJobs[jobKey] = {
            ...oldJob,
            ...jobWithoutResult,
          };

          // Store results separately if provided
          if (result !== undefined && result !== null) {
            state.solutionGeneratorResults[jobKey] = result;
          }
        }
      })
      /**
       * Handles the pending state of createSolutionGeneratorJob thunk.
       *
       * When a new solution generation request is initiated, this will
       * abort any existing job for the same resource/branch combination.
       * This prevents duplicate requests and ensures only the latest
       * request is processed.
       */
      .addCase(createSolutionGeneratorJob.pending, (state, action) => {
        const { resourceId, branchId } = action.meta.arg;
        const jobKey = `${resourceId}__${branchId}`;
        const solutionGeneratorJobs = state.solutionGeneratorJobs;
        const job = solutionGeneratorJobs[jobKey];
        job?.abortController?.abort();
      })
      /**
       * Handles deletion of a specific solution generator job.
       *
       * This reducer:
       * 1. Finds the job by resource and branch ID
       * 2. Aborts any ongoing request using the abort controller
       * 3. Removes the job from the state
       * 4. Cleans up associated results
       *
       * This ensures proper cleanup of resources and prevents memory leaks.
       */
      .addCase(deleteSolutionGeneratorJob, (state, action) => {
        const { resourceId, branchId } = action.payload;
        const jobKey = `${resourceId}__${branchId}`;
        const solutionGeneratorJobs = state.solutionGeneratorJobs;
        const job = solutionGeneratorJobs[jobKey];

        // Abort the job if there's an active abort controller
        if (job?.abortController) {
          job.abortController.abort();
        }

        // Remove the job from state
        delete solutionGeneratorJobs[jobKey];

        // Clean up associated results
        delete state.solutionGeneratorResults[jobKey];
      })
      /**
       * Handles deletion of multiple solution generator jobs.
       *
       * This reducer:
       * 1. Finds jobs by branchId and resourceIds combination
       * 2. Aborts each job that has an active abort controller
       * 3. Removes the matching jobs from the state
       * 4. Cleans up associated results
       *
       * This ensures proper cleanup of resources and prevents memory leaks.
       * More efficient than calling deleteSolutionGeneratorJob multiple times.
       */
      .addCase(deleteSolutionGeneratorJobs, (state, action) => {
        const { branchId, resourceIds } = action.payload;
        const solutionGeneratorJobs = state.solutionGeneratorJobs;

        // Process each resource ID for the given branch
        resourceIds.forEach((resourceId) => {
          const jobKey = `${resourceId}__${branchId}`;
          const job = solutionGeneratorJobs[jobKey];

          // Abort the job if there's an active abort controller
          if (job?.abortController) {
            job.abortController.abort();
          }

          // Remove the job from state
          delete solutionGeneratorJobs[jobKey];

          // Clean up associated results
          delete state.solutionGeneratorResults[jobKey];
        });
      })
      /**
       * Handles deletion of all solution generator jobs.
       *
       * This reducer:
       * 1. Iterates through all existing jobs
       * 2. Aborts each job that has an active abort controller
       * 3. Clears the entire jobs state
       * 4. Clears all associated results
       *
       * Useful for cleanup operations or when resetting the application state.
       */
      .addCase(deleteAllJobs, (state) => {
        const solutionGeneratorJobs = state.solutionGeneratorJobs;

        // Abort all active jobs before deleting
        Object.values(solutionGeneratorJobs).forEach((job) => {
          if (job?.abortController) {
            job.abortController.abort();
          }
        });

        // Clear all jobs and results
        state.solutionGeneratorJobs = {};
        state.solutionGeneratorResults = {};
      })
      /**
       * Handles showing the replace events modal.
       *
       * This reducer:
       * 1. Stores the reasons for the replacement operation
       * 2. Stores the new event to be added
       * 3. Stores the existing events to be deleted
       *
       * The modal allows users to review the replacement details
       * and confirm before applying changes to the schedule.
       */
      .addCase(showReplaceEventsModal, (state, action) => {
        state.replaceEventsModal = {
          isOpen: true,
          replaceReasons: action.payload.replaceReasons,
          toBeAddedEvent: action.payload.toBeAddedEvent,
          toBeDeletedEvents: action.payload.toBeDeletedEvents,
        };
      })
      /**
       * Handles hiding the replace events modal.
       *
       * This reducer:
       * 1. Resets the modal state to its initial values
       * 2. Clears all replacement data from the state
       * 3. Sets the modal visibility to false
       *
       * Called when the user cancels the replacement operation
       * or after successfully completing the event replacement.
       */
      .addCase(hideReplaceEventsModal, (state) => {
        state.replaceEventsModal = initialReplaceEventsModal;
      })
      /**
       * Handles showing the conflicting events modal.
       *
       * This reducer:
       * 1. Stores the reasons for the conflict
       * 2. Stores the event that has conflicts with existing events
       * 3. Sets the modal visibility to true
       *
       * The modal allows users to review the conflict details
       * and understand why an event cannot be added to the schedule.
       */
      .addCase(showConflictingEventsModal, (state, action) => {
        state.conflictingEventsModal = {
          isOpen: true,
          conflictReasons: action.payload.conflictReasons,
          toBeAddedEvent: action.payload.toBeAddedEvent,
        };
      })
      /**
       * Handles hiding the conflicting events modal.
       *
       * This reducer:
       * 1. Resets the modal state to its initial values
       * 2. Clears all conflict data from the state
       * 3. Sets the modal visibility to false
       *
       * Called when the user cancels the conflict resolution
       * or after successfully resolving the event conflicts.
       */
      .addCase(hideConflictingEventsModal, (state) => {
        state.conflictingEventsModal = initialConflictingEventsModal;
      });
  },
});

export default solutionGeneratorSlice.reducer;

// Export selectors
export * from './selectors';
