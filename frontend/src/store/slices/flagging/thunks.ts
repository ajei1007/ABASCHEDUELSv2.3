// Thunks and async logic for the flagging feature. Handles fetching, saving, and updating constraints and flagging data, as well as UI state for the flagging modal.
import axios from 'axios';
import { toast } from 'react-toastify';
import { createAsyncThunk } from '@reduxjs/toolkit';
import role_permissions from 'helpers/role_permissions';
import moment from 'moment';
import formatCustomConstraints from 'pages/calendar/utils/formatCustomConstraints';
import { formatFlagginData } from 'pages/calendar/utils/formatters';
import type { AppDispatch, RootState } from 'store';
import { selectErrorMessage } from 'components/FormItems/error/errors';
import { v4 as uuidv4 } from 'uuid';
import {
  setCustomConstraints, // Sets custom constraints in the store
  showFlaggingModal, // Opens the flagging modal
  setFlaggingFilterConstraintTypes, // Sets constraint type filter
  setFlaggingFilterUsers, // Sets user filter
  setFlaggingData, // Sets the main flagging data
  addFlaggingJob,
  removeFlaggingJob,
  removeFlaggingJobs,
  mergeToBeExcluded,
} from './actions';
import type { IFlaggingJob } from 'types';

/**
 * Fetches custom constraints and their placements for the current branch.
 * Returns an array of constraint placement objects, merging server data with local state.
 */
export const fetchCustomConstraints = createAsyncThunk<
  any[],
  void,
  {
    rejectValue: any;
    state: RootState;
  }
>(
  'flagging/fetchCustomConstraints',
  async (_, { getState, rejectWithValue }) => {
    try {
      const currentBranchIds = getState().calendar.current_branches.map(
        (e) => e.value,
      );

      // Fetch constraints and their placements in parallel
      const [response, responseConstraintPlacements] = await Promise.all([
        axios.get('/newconstraintgenerator/for-scheduler', {
          params: {
            branches: currentBranchIds.join('|'),
          },
        }),
        axios.get('/constraintPlacement', {
          params: {
            branchId: currentBranchIds[0],
          },
        }),
      ]);

      const constraints = response.data;
      const constraintPlacements = responseConstraintPlacements.data;

      // Merge constraints with their placements, or create default placements if missing
      let updatedConstraintPlacements: any = [];
      constraints.forEach((item: any) => {
        const findConstraintPlacement = constraintPlacements.find(
          (c: any) => c.constraintId === item.id,
        );
        if (findConstraintPlacement) {
          updatedConstraintPlacements = [
            ...updatedConstraintPlacements,
            {
              id: findConstraintPlacement.id,
              constraintId: findConstraintPlacement.constraintId,
              content: findConstraintPlacement.constraint.description,
              constraintType: findConstraintPlacement.constraint.constraintType,
              rank: findConstraintPlacement?.rank,
              solutionGenerator: findConstraintPlacement.solutionGenerator,
              flagging: findConstraintPlacement.flagging,
              optimizer: findConstraintPlacement.optimizer,
              soft: findConstraintPlacement.constraint.soft ?? false,
            },
          ];
        } else {
          updatedConstraintPlacements = [
            ...updatedConstraintPlacements,
            {
              id: null,
              constraintId: item.id,
              constraintType: item.constraintType,
              content: item.description,
              solutionGenerator: true,
              flagging: true,
              optimizer: true,
              soft: item?.soft ?? false,
            },
          ];
        }
      });
      return updatedConstraintPlacements;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  },
);

/**
 * Saves the default constraint placements for the current branch.
 * Accepts an array of constraint placement objects and persists them to the server.
 */
export const saveDefaultConstraintPlacements = createAsyncThunk<
  any[],
  any[],
  {
    rejectValue: any;
    state: RootState;
  }
>(
  'flagging/saveDefaultConstraintPlacements',
  async (arr, { getState, rejectWithValue }) => {
    try {
      const currentBranchIds = getState().calendar.current_branches.map(
        (e: any) => e.value,
      );
      const currentBranchId = currentBranchIds[0];

      // Prepare data for saving, including rank and importance
      const data = arr.map((c: any, index: number) => ({
        id: c.id,
        constraintId: c.constraintId,
        rank: index + 1,
        branchId: currentBranchId,
        importance: c?.soft ? 'low' : 'high',
        flagging: c.flagging,
        optimizer: c.optimizer,
        solutionGenerator: c.solutionGenerator,
        content: c.content,
        constraintType: c.constraintType,
        soft: c?.soft ?? false,
      }));

      await axios.post(`/constraintPlacement/multiple`, { data });

      return data;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  },
);

/**
 * Fetches flagging data (constraint violations) for a set of users/resources.
 * Handles aborting previous requests, manages loading state, and updates the store with results.
 * Optionally updates only a subset of users and can trigger the modal for newly broken constraints.
 */
export const fetchFlaggingData = ({
  ids = null,
  updateIds = null,
  showBroken = false,
}: {
  ids?: null | Array<any>;
  updateIds?: null | Array<any>;
  showBroken?: boolean;
} = {}) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    // Get relevant state values for the flagging request
    const state = getState();
    const currentUser = state.auth.currentUser;
    const sandboxMode = state.calendar.sandboxMode;
    const calendarVisibleResources = state.calendar.visibleResources;
    const customConstraints = state.flagging.customConstraints;
    const calendarStart = moment(state.calendar.calendar_start).format();
    const calendarEnd = moment(state.calendar.calendar_end).format();
    const timezone =
      state.settings?.settingValues?.timezone ??
      Intl.DateTimeFormat().resolvedOptions().timeZone;
    const storeSettingsValuesOverbooking =
      state.settings.settingValues?.overbooking;
    const isFlaggingEnabled = state.flagging.flaggingEnabled;
    const isOverbookingEnabled = storeSettingsValuesOverbooking;

    // If only overbooking is enabled, skip other constraints
    const onlyOverbooking = isOverbookingEnabled && !isFlaggingEnabled;

    // Permission check: only proceed if user has 'viewReport' permission
    if (!role_permissions(currentUser, 'viewReport')) {
      return {
        success: false,
      };
    }

    // Create a unique job ID and abort controller for this request
    const jobId = uuidv4();
    const abortController = new AbortController();

    // Determine which user/resource IDs to fetch for
    // If ids are provided, use them; otherwise, use visible resources from calendar
    const userIds = Array.isArray(ids)
      ? ids
      : calendarVisibleResources.reduce((acc, item) => {
          if (item.person) {
            acc.push(item.id);
          }
          return acc;
        }, [] as string[]);

    // If no user IDs are found, abort the request
    if (userIds?.length === 0) {
      return {
        success: false,
      };
    }

    // Build the job item for tracking this flagging request
    const jobItem: IFlaggingJob = {
      id: jobId,
      startDate: calendarStart,
      endDate: calendarEnd,
      branchId: state.calendar.current_branches[0]?.value || '',
      resourceIds: userIds.reduce(
        (acc, userId) => {
          acc[userId] = true;
          return acc;
        },
        {} as Record<string, boolean>,
      ),
      abortController,
    };

    // Find jobs that should be removed (different date, branch, or resources)
    const flaggingJobs = Object.values(state.flagging.flaggingJobs);

    // Remove jobs that have different date, branch, or exactly the same set of resources
    const toBeRemovedJobs = flaggingJobs.filter((job) => {
      // Check if job differs by start/end date or branch
      if (
        job.startDate !== jobItem.startDate ||
        job.endDate !== jobItem.endDate ||
        job.branchId !== jobItem.branchId
      ) {
        return true;
      }

      // Check if resource sets are exactly the same
      const jobResourceIds = Object.keys(job.resourceIds);
      const itemResourceIds = Object.keys(jobItem.resourceIds);

      if (
        jobResourceIds.length === itemResourceIds.length &&
        jobResourceIds.every((id) => jobItem.resourceIds[id])
      ) {
        return true;
      }

      return false;
    });

    // Abort and remove any jobs that are no longer relevant
    if (toBeRemovedJobs.length > 0) {
      toBeRemovedJobs.forEach((job) => {
        job.abortController?.abort();
      });
      dispatch(removeFlaggingJobs(toBeRemovedJobs.map((job) => job.id)));
    }

    // Build exclusion map for resources already being processed by other jobs
    const toBeExcluded: Record<string, Record<string, boolean>> = {};
    for (const fJob of flaggingJobs) {
      for (const userId of userIds) {
        if (fJob.resourceIds[userId]) {
          if (!toBeExcluded[fJob.id]) {
            toBeExcluded[fJob.id] = {} as Record<string, boolean>;
          }
          toBeExcluded[fJob.id][userId] = true;
        }
      }
    }

    // Merge exclusion map into store
    dispatch(mergeToBeExcluded(toBeExcluded));

    try {
      // Add this job to the store for tracking
      dispatch(addFlaggingJob(jobItem));

      // Format user IDs for the API request
      const formattedUserIds = userIds.join('|');

      // Prepare constraint type lists for the request
      let soft = [];
      let high = [];
      let disabled = [];
      let hard = [];
      if (!onlyOverbooking) {
        ({ soft, high, disabled, hard } =
          formatCustomConstraints(customConstraints));
      }

      // Make the request to fetch flagging data, supporting abort
      const response = await axios.post(
        '/users/constraint-gap/flags',
        {
          userIds: formattedUserIds,
          start: calendarStart,
          end: calendarEnd,
          sandboxMode,
          soft: soft.join('|'),
          highPriority: high.join('|'),
          disabled: disabled.join('|'),
          hard: hard.join('|'),
          timezone,
          onlyOverbooking: isOverbookingEnabled && !isFlaggingEnabled,
        },
        {
          signal: abortController.signal,
        },
      );

      // Get current flagging data from the store
      const flaggingDataConstraints =
        getState().flagging?.flaggingData?.constraints || [];

      // Get exclusion set for this job from the store
      const toBeExcludedSet =
        getState().flagging?.flaggingJobsToBeExcluded?.[jobId];

      // Filter out excluded user IDs from the response data
      let data: any[] = response?.data || [];
      if (toBeExcludedSet) {
        data = data.filter((item: any) => !toBeExcludedSet[item.userId]);
        if (data.length === 0) {
          // If all data is excluded, return success
          return {
            success: true,
          };
        }
      }

      // Format the flagging data for the store
      const formattedFlaggingData = formatFlagginData(data);
      let updatedFlaggingDataConstraints = [...formattedFlaggingData];

      // If updating only a subset of users, merge new data with existing data
      if (updateIds) {
        updatedFlaggingDataConstraints = [
          ...flaggingDataConstraints.filter(
            (c: any) => !updateIds.includes(c.userId),
          ),
          ...formattedFlaggingData,
        ];
      }

      // Update the store with new flagging data
      // Optionally show modal for newly broken constraints
      if (data.length || updateIds) {
        dispatch(
          setFlaggingData({ constraints: updatedFlaggingDataConstraints }),
        );

        if (showBroken) {
          dispatch(
            showBrokenFlaggingConstraints({
              oldFlaggingDataConstraints: flaggingDataConstraints,
              newFlaggingDataConstraints: formattedFlaggingData,
            }),
          );
        }
      } else {
        // If no data, clear the flagging data in the store
        dispatch(setFlaggingData({ constraints: [] }));
      }
      return {
        success: true,
      };
    } catch (error: any) {
      // If the request was aborted, return aborted status
      if (
        axios.isCancel(error) ||
        error?.name === 'CanceledError' ||
        error?.code === 'ERR_CANCELED' ||
        error?.message === 'canceled' ||
        error?.message === 'Request aborted' ||
        error?.name === 'AbortError'
      ) {
        // Request was aborted by user or system
        return {
          success: false as const,
          aborted: true as const,
        };
      }

      // Show error toast and return failure
      const errorMessage = selectErrorMessage(error);
      toast.error(`Fetching flags failed: ${errorMessage}`);
      return {
        success: false,
      };
    } finally {
      // Always remove the job from the store when finished
      dispatch(removeFlaggingJob(jobId));
    }
  };
};

/**
 * Updates the custom constraint placements in the store (local only, not persisted).
 * Accepts an array of constraint placement objects and updates their rank and branch.
 */
export const updateConstraintPlacements = (arr: any[]) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const currentBranchIds = getState().calendar.current_branches.map(
      (e) => e.value,
    );
    const currentBranchId = currentBranchIds[0];

    // Prepare updated constraint placements with rank and branch
    const data = arr.map((c, index) => ({
      id: c.id,
      constraintId: c.constraintId,
      rank: index + 1,
      branchId: currentBranchId,
      importance: c?.soft ? 'low' : 'high',
      flagging: c.flagging,
      optimizer: c.optimizer,
      solutionGenerator: c.solutionGenerator,
      content: c.content,
      constraintType: c.constraintType,
      soft: c?.soft ?? false,
    }));

    dispatch(setCustomConstraints(data));
  };
};

/**
 * Shows the flagging modal with filters set for users and constraint types that have newly broken constraints.
 * Compares old and new flagging data to determine which constraints are newly broken.
 */
export const showBrokenFlaggingConstraints = ({
  oldFlaggingDataConstraints,
  newFlaggingDataConstraints,
}: {
  oldFlaggingDataConstraints: any[];
  newFlaggingDataConstraints: any[];
}) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const storeSettingsValuesOverbooking =
      state.settings.settingValues?.overbooking;
    const storeSettingsValuesEmptyAvailability =
      state.settings.settingValues?.emptyAvailability;
    const storeSettingsValuesNotAvailableBusy =
      state.settings.settingValues?.notAvailableBusy;
    const isOverbookingEnabled = storeSettingsValuesOverbooking;
    const isEmptyAvailabilityEnabled = storeSettingsValuesEmptyAvailability;
    const isNotAvailableBusyEnabled = storeSettingsValuesNotAvailableBusy;

    // Build a map of user IDs present in the new data
    const userIdsMap = newFlaggingDataConstraints.reduce(
      (acc: Map<string, boolean>, item) => {
        acc.set(item.userId, true);
        return acc;
      },
      new Map<string, boolean>(),
    );

    // Build a map of broken constraints from the old data for comparison
    const brokenConstraintsMap = oldFlaggingDataConstraints.reduce(
      (acc: Map<string, boolean>, item) => {
        if (item.broken && userIdsMap.has(item.userId)) {
          acc.set(`${item.userId}__${item.constraintId}`, true);
        }
        return acc;
      },
      new Map<string, boolean>(),
    );

    // Find constraints that are newly broken in the new data
    const newlyBrokenFlaggingData = newFlaggingDataConstraints.filter(
      (item) => {
        if (!item.broken) {
          return false;
        }
        const isNewlyBroken = !brokenConstraintsMap.has(
          `${item.userId}__${item.constraintId}`,
        );

        switch (item.constraintType) {
          case 'overbooking':
            return isOverbookingEnabled && isNewlyBroken;
          case 'emptyAvailability':
            return isEmptyAvailabilityEnabled && isNewlyBroken;
          case 'notAvailableBusy':
            return isNotAvailableBusyEnabled && isNewlyBroken;
          default:
            return isNewlyBroken;
        }
      },
    );

    if (newlyBrokenFlaggingData.length === 0) {
      return;
    }

    // Build user filter list for the modal
    const users = (() => {
      const map = new Map<string, boolean>();
      return newlyBrokenFlaggingData.reduce((acc: any[], item) => {
        if (!map.has(item.userId)) {
          map.set(item.userId, true);
          acc.push({
            label: `${item.user.firstName} ${item.user.lastName}`,
            value: item.userId,
          });
        }
        return acc;
      }, [] as any[]);
    })();

    // Build constraint type filter list for the modal
    const constraintTypes = (() => {
      const map = new Map<string, boolean>();
      return newlyBrokenFlaggingData.reduce((acc: any[], item) => {
        if (!map.has(item.constraintType)) {
          map.set(item.constraintType, true);
          acc.push(item.constraintType);
        }
        return acc;
      }, [] as any[]);
    })();

    // Show the modal and set filters
    dispatch(showFlaggingModal());
    dispatch(setFlaggingFilterConstraintTypes(constraintTypes));
    dispatch(setFlaggingFilterUsers(users));
  };
};
