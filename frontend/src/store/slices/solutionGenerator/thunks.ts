import axios from 'axios';
import { toast } from 'react-toastify';
import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from 'store';
import config from 'config';
import { selectErrorMessage } from 'components/FormItems/error/errors';
import formatCustomConstraints from 'pages/calendar/utils/formatCustomConstraints';
import { generateTimeRangeParameter } from 'pages/calendar/utils/formatters';
import {
  upsertSolutionGeneratorJob,
  updateSolutionGeneratorJob,
  deleteSolutionGeneratorJobs,
} from './actions';
import { selectIsMaxConcurrentJobsReached } from './selectors';
import {
  selectActivityResourceIdsSet,
  selectLocationResourceIdsSet,
  selectBlockResourceIdsSet,
} from '../calendar/selectors';
import { delayWithAbort } from 'utils/delayWithAbort';
import { setExpandedResourses } from '../calendar/actions';
import type { ISolutionGeneratorJob } from 'types';

// ==============================
// CONSTANTS
// ==============================

const DEBOUNCE_DELAY = 500; // milliseconds

// ==============================
// TYPES
// ==============================

/** Options for creating solution generator job */
interface CreateSolutionGeneratorJobOptions {
  resourceId: string;
  branchId: string;
  filterResourceIds?: string[];
}

/** Options for retriggering solution generator jobs */
interface RetriggerSolutionGeneratorJobsOptions {
  /** The branch ID to filter jobs by */
  branchId: string;
  /** Array of resource IDs to filter jobs by */
  resourceIds: string[];
}

/** Parameters for the optimizer API call */
interface OptimizerApiParams {
  startDate: string;
  endDate: string;
  branchId: string;
  resourceId: string;
  filterResourceIds: string[];
  state: RootState;
  abortController: AbortController;
}

// ==============================
// UTILITY FUNCTIONS
// ==============================

/**
 * Makes the API call to the optimizer service.
 *
 * @param params - Parameters for the API call
 * @returns Promise with the response data
 */
const callOptimizerApi = async (params: OptimizerApiParams) => {
  const {
    startDate,
    endDate,
    resourceId,
    filterResourceIds,
    state,
    abortController,
  } = params;

  // Format custom constraints for the optimizer
  const customConstraints = state.flagging.customConstraints;
  const { soft, high, disabled, hard } =
    formatCustomConstraints(customConstraints);

  // Determine optimizer endpoint URL based on environment
  let optimizerURL = 'http://127.0.0.1:4000/optimizer/solution_generator';
  if (!import.meta.env.DEV) optimizerURL = '/lambda/solution_generator';

  // Retrieve authentication token
  const token = localStorage.getItem('token');

  // Make the API request to the optimizer service
  const response = await axios.post(
    optimizerURL,
    {
      data: {
        header: {
          Authorization: `Bearer ${token}`,
        },
        start_date: startDate,
        end_date: endDate,
        branch: state.calendar.current_branches.map((y: any) => y.value)?.[0],
        expanded_resources: [resourceId],
        // TODO: Use the correct expanded_resources_filter logic
        expanded_resources_filter: filterResourceIds,
        uncheckWhiteSolutionConstraints: [],
        uncheckOrangeSolutionConstraints: [],
        investigate: [],
        settings: state.settings.settingValues,
        // Constraint parameters
        soft,
        highPriority: high,
        disabled,
        hard,
      },
    },
    {
      signal: abortController.signal,
    },
  );

  return response.data;
};

// ==============================
// ASYNC THUNKS
// ==============================

/**
 * Creates a solution generator job for a specific resource and branch.
 *
 * This thunk handles the complete solution generation workflow:
 * 1. Validates job limits and prevents duplicate jobs
 * 2. Extracts calendar date range and timezone settings
 * 3. Formats custom constraints for optimization
 * 4. Implements debounce delay to prevent excessive API calls
 * 5. Calls the optimizer service with comprehensive parameters
 * 6. Processes response data to separate matched/unmatched events
 * 7. Updates job status and stores results
 *
 * Features:
 * - Debounced execution (500ms delay)
 * - Abort controller support for cancellation
 * - Comprehensive error handling
 * - Job status tracking and updates
 *
 * @param resourceId - The ID of the resource to generate solutions for
 * @param branchId - The ID of the branch context
 * @returns Promise<void> - Resolves when solution generation completes
 */
export const createSolutionGeneratorJob = createAsyncThunk<
  void,
  CreateSolutionGeneratorJobOptions,
  {
    rejectValue: string;
    state: RootState;
  }
>(
  'solutionGenerator/createJob',
  async (
    { resourceId, branchId, filterResourceIds = [] },
    { dispatch, getState, rejectWithValue },
  ) => {
    const state = getState();

    // Extract timezone settings with fallback to browser timezone
    const timeZone =
      state.settings?.settingValues?.timezone ??
      Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Generate formatted date range parameters for the API request
    const startDate = generateTimeRangeParameter(
      state.calendar.calendar_start,
      timeZone,
      'YYYY-MM-DD',
    );
    const endDate = generateTimeRangeParameter(
      state.calendar.calendar_end,
      timeZone,
      'YYYY-MM-DD',
    );

    // Create abort controller for request cancellation
    const abortController = new AbortController();

    // Initialize job item with loading status
    const jobItem: Omit<ISolutionGeneratorJob, 'id'> & { result?: any[] } = {
      startDate,
      endDate,
      resourceId,
      branchId,
      status: 'loading',
      errorMessage: null,
      triggeredAt: new Date(),
      filterResourceIds,
      abortController,
    };

    // Register the job in the store
    dispatch(upsertSolutionGeneratorJob(jobItem));

    try {
      // Implement debounce delay to prevent excessive API calls
      await delayWithAbort(DEBOUNCE_DELAY, abortController);

      // Make the API call to the optimizer service
      const data = await callOptimizerApi({
        startDate,
        endDate,
        branchId,
        resourceId,
        filterResourceIds,
        state,
        abortController,
      });

      // Process the response data
      let eventsPossible: any[] = [];

      // Process matched possible events
      if (data?.poss_events?.length) {
        const matchedPossibleEvents = data.poss_events.map((ev: any) => ({
          ...ev,
          matched: true,
        }));
        eventsPossible = [...eventsPossible, ...matchedPossibleEvents];
      }

      // Process unmatched possible events
      if (data?.unmatch_poss_events?.length) {
        const unmatchedPossibleEvents = data.unmatch_poss_events.map(
          (ev: any) => ({
            ...ev,
            matched: false,
          }),
        );
        eventsPossible = [...eventsPossible, ...unmatchedPossibleEvents];
      }

      // Update job status to success with results
      dispatch(
        updateSolutionGeneratorJob({
          ...jobItem,
          status: 'success',
          errorMessage: null,
          abortController: null,
          result: eventsPossible,
        }),
      );
    } catch (error: any) {
      // Handle abort errors gracefully - do nothing when request is aborted
      // Abort can occur in two scenarios:
      // 1. New action initiated - When a new createSolutionGeneratorJob action is dispatched
      //    for the same resource/branch combination, it will abort the previous request
      // 2. Job removal from state - When the job is being removed from the Redux state,
      //    the abort controller is triggered to cancel any ongoing requests
      if (
        error.message === 'Request was aborted during debounce period' ||
        error.name === 'AbortError' ||
        abortController.signal.aborted
      ) {
        // Do nothing on abort - let the job remain in its current state
        // This allows the calling code to handle the abortion based on context
        return;
      }

      // If the error is not an abort, handle it as a failed
      const errorMessage = selectErrorMessage(error);
      toast.error(`Solution generator failed: ${errorMessage}`);

      // Handle other errors
      dispatch(
        updateSolutionGeneratorJob({
          ...jobItem,
          status: 'failed',
          errorMessage,
          abortController: null,
        }),
      );

      return rejectWithValue(errorMessage);
    }
  },
  {
    /**
     * Condition function to control when the thunk should execute.
     *
     * This prevents execution when:
     * - Maximum number of concurrent jobs is reached
     * - Job already exists for the same resource and branch combination
     *
     * @param payload - The thunk payload containing resourceId and branchId
     * @param api - The thunk API containing getState function
     * @returns boolean - true if the thunk should execute, false otherwise
     */
    condition: ({ resourceId, branchId }, { getState }) => {
      const state = getState();
      const { solutionGenerator } = state;
      const solutionGeneratorJobs = solutionGenerator.solutionGeneratorJobs;
      const isMaxJobsReached = selectIsMaxConcurrentJobsReached(state);
      const isJobExists = !!solutionGeneratorJobs[`${resourceId}__${branchId}`];

      if (!isJobExists && isMaxJobsReached) {
        // If the job does not exist and the total jobs exceed the limit, do not proceed
        toast.error(`Max solution generator jobs reached. Please wait.`);
        return false;
      }

      return true;
    },
  },
);

/**
 * Retriggers solution generator jobs for specific resources and branch.
 *
 * This thunk handles the retriggering workflow:
 * 1. Gets all existing jobs from the state
 * 2. Filters jobs by branchId and resourceIds (only jobs with existing entries)
 * 3. Sorts filtered jobs by triggeredAt (oldest first) to prioritize early created jobs
 * 4. Keeps only the maximum allowed concurrent jobs
 * 5. Deletes jobs that exceed the maximum limit
 * 6. Retriggers the remaining jobs by calling createSolutionGeneratorJob
 *
 * Features:
 * - Respects maximum concurrent job limit
 * - Prioritizes jobs based on creation time (triggeredAt)
 * - Only triggers jobs that already exist in the state
 * - Cleans up excess jobs automatically
 * - Maintains job state consistency
 *
 * @param options - Configuration options for retriggering including branchId and resourceIds
 * @returns Promise<void> - Resolves when all jobs are retriggered
 */
export const retriggerSolutionGeneratorJobs = createAsyncThunk<
  void,
  RetriggerSolutionGeneratorJobsOptions,
  {
    rejectValue: string;
    state: RootState;
  }
>(
  'solutionGenerator/retriggerJobs',
  async (
    { branchId, resourceIds },
    { dispatch, getState, rejectWithValue },
  ) => {
    const state = getState();
    const { solutionGeneratorJobs, solutionGeneratorResults } =
      state.solutionGenerator;

    const activityResourceIdsSet = selectActivityResourceIdsSet(state);
    const locationResourceIdsSet = selectLocationResourceIdsSet(state);
    const blockResourceIdsSet = selectBlockResourceIdsSet(state);

    const personResourceIdsSet = new Set(
      resourceIds.filter(
        (id) =>
          !activityResourceIdsSet.has(id) &&
          !locationResourceIdsSet.has(id) &&
          !blockResourceIdsSet.has(id),
      ),
    );

    // Get all existing jobs as an array
    const allJobsKeys = Object.keys(solutionGeneratorJobs);

    // Filter jobs by branchId and resourceIds (only jobs with existing entries)
    const filteredJobs = allJobsKeys.reduce((acc, jobKey) => {
      const job = solutionGeneratorJobs[jobKey];
      const jobResult = Array.isArray(solutionGeneratorResults[jobKey])
        ? solutionGeneratorResults[jobKey]
        : [];

      if (job.branchId !== branchId) {
        return acc;
      }

      if (resourceIds.includes(job.resourceId)) {
        acc.push(job);
      } else if (
        jobResult.some((resultItem) =>
          resultItem?.resourceIds?.some((rId: string) =>
            personResourceIdsSet.has(`${rId}`.slice(0, 36)),
          ),
        )
      ) {
        acc.push(job);
      }

      return acc;
    }, [] as ISolutionGeneratorJob[]);

    if (filteredJobs.length === 0) {
      // No matching jobs to retrigger
      return;
    }

    // Sort jobs by triggeredAt (oldest first) to prioritize early created jobs
    const sortedJobs = filteredJobs.sort((a, b) => {
      const aTime = new Date(a.triggeredAt).getTime();
      const bTime = new Date(b.triggeredAt).getTime();
      return aTime - bTime;
    });

    // Keep only the maximum allowed concurrent jobs
    const jobsToKeep = sortedJobs.slice(
      0,
      config.maxSolutionGeneratorConcurrentJobs,
    );
    const jobsToDelete = sortedJobs.slice(
      config.maxSolutionGeneratorConcurrentJobs,
    );

    try {
      if (jobsToDelete.length > 0) {
        // Delete jobs that exceed the maximum limit
        const resourceIds = jobsToDelete.map((job) => job.resourceId);

        // Dispatch action to delete multiple jobs
        dispatch(
          deleteSolutionGeneratorJobs({
            branchId,
            resourceIds,
          }),
        );

        // Optionally, update expanded resources in the calendar state
        // to remove the deleted jobs' resources
        dispatch(
          setExpandedResourses(
            // Filter out resources that are being deleted
            state.calendar.expandedResources.filter(
              (res) => !resourceIds.includes(res.id),
            ),
          ),
        );
      }

      // Retrigger the remaining jobs
      for (const job of jobsToKeep) {
        dispatch(
          createSolutionGeneratorJob({
            resourceId: job.resourceId,
            branchId: job.branchId,
            filterResourceIds: job?.filterResourceIds || [],
          }),
        );
      }
    } catch (error: any) {
      const errorMessage = selectErrorMessage(error);
      toast.error(`Retrigger failed: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  },
);
