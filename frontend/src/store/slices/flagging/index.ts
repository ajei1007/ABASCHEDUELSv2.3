// Redux slice for managing the state of the flagging feature in the application.
// Handles modal visibility, filters, flagging data, and related UI state.
import { createSlice } from '@reduxjs/toolkit';
import {
  showFlaggingModal, // Action to open the flagging modal
  hideFlaggingModal, // Action to close the flagging modal
  toggleFlaggingModalOpen, // Action to toggle the modal's open state
  setFlaggingData, // Action to set the constraints data for flagging
  setFlaggingEnabled, // Action to enable/disable the flagging feature
  setFlaggingFilterUsers, // Action to set user filter for flagging
  setFlaggingFilterConstraintTypes, // Action to set constraint type filter
  setFlaggingFilterShowOnlyBroken, // Action to filter only broken constraints
  setCustomConstraints, // Action to set custom constraints
  fetchCustomConstraints, // Thunk to fetch custom constraints from the server
  saveDefaultConstraintPlacements, // Thunk to save default constraint placements
  addFlaggingJob, // Action to add a flagging job
  removeFlaggingJob, // Action to remove a flagging job
  removeFlaggingJobs,
  mergeToBeExcluded,
} from './actions';
import type { IFlaggingJob } from 'types';

// Initial state for the flagging slice
const initialState = {
  // Stores custom constraints set by the user or system
  customConstraints: null as any | null,
  // Controls the visibility of the flagging modal
  flaggingModalOpen: false,
  // Filters applied to the flagging data (users, constraint types, show only broken)
  flaggingFilters: {
    users: [] as any[], // List of user IDs or objects to filter by
    constraintTypes: [] as any[], // List of constraint types to filter by
    showOnlyBroken: false, // Whether to show only broken constraints
  },
  // The main flagging data, typically a list of constraints
  flaggingData: {
    constraints: [] as any[],
  },
  // Whether the flagging feature is enabled
  flaggingEnabled: false,

  flaggingJobs: {} as Record<string, IFlaggingJob>,
  flaggingJobsToBeExcluded: {} as Record<string, Record<string, boolean>>,
};

// Create the flagging slice with no local reducers, only handling extra reducers from actions
const flaggingSlice = createSlice({
  name: 'flagging',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Open the flagging modal
      .addCase(showFlaggingModal, (state) => {
        state.flaggingModalOpen = true;
      })
      // Close the flagging modal
      .addCase(hideFlaggingModal, (state) => {
        state.flaggingModalOpen = false;
      })
      // Toggle the flagging modal's open/close state
      .addCase(toggleFlaggingModalOpen, (state) => {
        state.flaggingModalOpen = !state.flaggingModalOpen;
      })
      // Set the main flagging data (constraints)
      .addCase(setFlaggingData, (state, action) => {
        state.flaggingData = action.payload;
      })
      // Enable or disable the flagging feature
      .addCase(setFlaggingEnabled, (state, action) => {
        state.flaggingEnabled = action.payload;
      })
      // Set the user filter for flagging
      .addCase(setFlaggingFilterUsers, (state, action) => {
        state.flaggingFilters.users = action.payload;
      })
      // Set the constraint type filter
      .addCase(setFlaggingFilterConstraintTypes, (state, action) => {
        state.flaggingFilters.constraintTypes = action.payload;
      })
      // Set whether to show only broken constraints
      .addCase(setFlaggingFilterShowOnlyBroken, (state, action) => {
        state.flaggingFilters.showOnlyBroken = action.payload;
      })
      // Set custom constraints
      .addCase(setCustomConstraints, (state, action) => {
        state.customConstraints = action.payload;
      })
      // Handle the fulfilled state of the fetchCustomConstraints thunk
      .addCase(fetchCustomConstraints.fulfilled, (state, action) => {
        state.customConstraints = action.payload;
      })
      // Handle the fulfilled state of the saveDefaultConstraintPlacements thunk
      .addCase(saveDefaultConstraintPlacements.fulfilled, (state, action) => {
        state.customConstraints = action.payload;
      })
      .addCase(addFlaggingJob, (state, action) => {
        const job = action.payload;
        state.flaggingJobs[job.id] = job;
      })
      .addCase(removeFlaggingJob, (state, action) => {
        const jobId = action.payload;
        delete state.flaggingJobs[jobId];
        // Remove the job from the exclusion map if it exists
        if (state.flaggingJobsToBeExcluded[jobId]) {
          delete state.flaggingJobsToBeExcluded[jobId];
        }
      })
      .addCase(removeFlaggingJobs, (state, action) => {
        const jobIds = action.payload;
        jobIds.forEach((jobId) => {
          delete state.flaggingJobs[jobId];
          // Remove the job from the exclusion map if it exists
          if (state.flaggingJobsToBeExcluded[jobId]) {
            delete state.flaggingJobsToBeExcluded[jobId];
          }
        });
      })
      .addCase(mergeToBeExcluded, (state, action) => {
        const payload = action.payload;
        Object.entries(payload).forEach(([jobId, resourceIds]) => {
          if (!state.flaggingJobsToBeExcluded[jobId]) {
            state.flaggingJobsToBeExcluded[jobId] = {};
          }

          Object.keys(resourceIds).forEach((resourceId) => {
            state.flaggingJobsToBeExcluded[jobId][resourceId] = true;
          });
        });
      });
  },
});

// Export the reducer to be used in the store
export default flaggingSlice.reducer;
