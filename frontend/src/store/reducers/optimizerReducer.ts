import {
  breakDurationOptions,
  breakQuantityOptions,
  oneBreakHoursOptions,
  twoBreakHoursOptions,
} from 'pages/calendar/constants';
import {
  type OptimizerAction,
  OptimizerActionTypes,
  type OptimizerState,
} from 'types/redux/optimizer';

const initialState: OptimizerState = {
  optimizerModal: false,
  optimizerResultsModal: false,
  optimizerResultsEmptyModal: false,
  optimizerResultsDisabledConstraintsModal: false,
  optimizerResults: [],
  optimizerResultsSelectedIdsMap: {},
  optimizerValues: {
    breakDuration: breakDurationOptions[0],
    breakQuantity: breakQuantityOptions[0],
    oneBreakHours: oneBreakHoursOptions[0],
    twoBreakHours: twoBreakHoursOptions[0],
    // percentignore: null,
    is_events: false,
    is_delete: false,
    is_overlap_constraint: false,
    is_minSession_constraint: false,
    allOrNothingBlocks: false,
    maxEmployeeHoursPerDay: 0,
    maxClientHoursPerDay: 0,
    maxGapEmployeeSchedule: 0,
    maxGapClientSchedule: 0,
    clientsMaxAppointmentsPerDay: 0,
    employeesMaxAppointmentsPerDay: 0,
    part1: false,
    reshuffle: false,
    nogapsequationrole: '',
    activityRoleItems: {
      roles: [],
      activities: [],
    },
    slotduration: 15,
    max_time_in_seconds: null,
  },
  optimizerJobs: [],
};

export default function optimizerReducer(
  state = initialState,
  action: OptimizerAction,
): OptimizerState {
  switch (action.type) {
    case OptimizerActionTypes.OPTIMIZER_VALUES:
      return {
        ...state,
        optimizerValues: {
          ...state.optimizerValues,
          ...action.optimizerValues,
        },
      };
    case OptimizerActionTypes.SET_OPTIMIZER_MODAL:
      return {
        ...state,
        optimizerModal: action.optimizerModal,
      };
    case OptimizerActionTypes.SET_OPTIMIZER_RESULTS_MODAL:
      return {
        ...state,
        optimizerResultsModal: action.optimizerResultsModal,
      };
    case OptimizerActionTypes.SET_OPTIMIZER_RESULTS_EMPTY_MODAL:
      return {
        ...state,
        optimizerResultsEmptyModal: action.optimizerResultsEmptyModal,
      };
    case OptimizerActionTypes.SET_OPTIMIZER_RESULTS_DISABLED_CONSTRAINTS_MODAL:
      return {
        ...state,
        optimizerResultsDisabledConstraintsModal:
          action.optimizerResultsDisabledConstraintsModal,
      };
    case OptimizerActionTypes.SET_OPTIMIZER_RESULTS:
      return {
        ...state,
        optimizerResults: action.optimizerResults,
        optimizerResultsSelectedIdsMap: action.optimizerResults.reduce(
          (acc, item) => {
            item.creatingEvents.forEach((event: any) => {
              acc[event.id] = true;
            });
            item.updatingEvents.forEach((event: any) => {
              acc[event.id] = true;
            });
            item.deletingEvents.forEach((event: any) => {
              acc[event.id] = true;
            });
            return acc;
          },
          {} as Record<string, boolean>,
        ),
      };
    case OptimizerActionTypes.SET_OPTIMIZER_RESULTS_SELECTED_IDS_MAP:
      return {
        ...state,
        optimizerResultsSelectedIdsMap: action.selectedIdsMap,
      };
    case OptimizerActionTypes.SET_ACTIVITY_ROLE_ITEMS:
      return {
        ...state,
        optimizerValues: {
          ...state.optimizerValues,
          activityRoleItems: {
            ...state.optimizerValues.activityRoleItems,
            ...action.activityRoleItems,
          },
        },
      };
    case OptimizerActionTypes.RESET_OPTIMIZER_RESULTS:
      return {
        ...state,
        optimizerResults: [],
        optimizerResultsSelectedIdsMap: {},
      };
    case OptimizerActionTypes.ADD_OPTIMIZER_JOB:
      return {
        ...state,
        optimizerJobs: [...state.optimizerJobs, action.optimizerJob],
      };
    case OptimizerActionTypes.UPDATE_OPTIMIZER_JOB:
      return {
        ...state,
        optimizerJobs: state.optimizerJobs.map((job) =>
          job.id === action.optimizerJob.id ? action.optimizerJob : job,
        ),
      };
    case OptimizerActionTypes.REMOVE_OPTIMIZER_JOB:
      return {
        ...state,
        optimizerJobs: state.optimizerJobs.filter(
          (job) => job.id !== action.optimizerJobId,
        ),
      };
    case OptimizerActionTypes.RESET_OPTIMIZER_JOBS:
      return {
        ...state,
        optimizerJobs: [],
      };
    default:
      return state;
  }
}
