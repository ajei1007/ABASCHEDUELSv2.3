import type { IOptimizerJobItem } from 'types';
export interface OptimizerState {
  optimizerValues: any;
  optimizerModal: boolean;
  optimizerResultsModal: boolean;
  optimizerResultsEmptyModal: boolean;
  optimizerResultsDisabledConstraintsModal: boolean;
  optimizerResults: Array<any>;
  optimizerResultsSelectedIdsMap: Record<string, boolean>;
  optimizerJobs: IOptimizerJobItem[];
}

export enum OptimizerActionTypes {
  OPTIMIZER_VALUES = 'OPTIMIZER_VALUES',
  SET_OPTIMIZER_MODAL = 'SET_OPTIMIZER_MODAL',
  SET_OPTIMIZER_RESULTS_MODAL = 'SET_OPTIMIZER_RESULTS_MODAL',
  SET_OPTIMIZER_RESULTS_EMPTY_MODAL = 'SET_OPTIMIZER_RESULTS_EMPTY_MODAL',
  SET_OPTIMIZER_RESULTS_DISABLED_CONSTRAINTS_MODAL = 'SET_OPTIMIZER_RESULTS_DISABLED_CONSTRAINTS_MODAL',
  SET_OPTIMIZER_RESULTS = 'SET_OPTIMIZER_RESULTS',
  SET_OPTIMIZER_RESULTS_SELECTED_IDS_MAP = 'SET_OPTIMIZER_RESULTS_SELECTED_IDS_MAP',
  SET_ACTIVITY_ROLE_ITEMS = 'SET_ACTIVITY_ROLE_ITEMS',
  SET_SOLUTION_GENERATOR_RESOURCES = 'SET_SOLUTION_GENERATOR_RESOURCES',
  RESET_OPTIMIZER_RESULTS = 'RESET_OPTIMIZER_RESULTS',
  ADD_OPTIMIZER_JOB = 'ADD_OPTIMIZER_JOB',
  UPDATE_OPTIMIZER_JOB = 'UPDATE_OPTIMIZER_JOB',
  REMOVE_OPTIMIZER_JOB = 'REMOVE_OPTIMIZER_JOB',
  RESET_OPTIMIZER_JOBS = 'RESET_OPTIMIZER_JOBS',
}

interface optimizerValuesAction {
  type: typeof OptimizerActionTypes.OPTIMIZER_VALUES;
  optimizerValues: any;
}

interface setOptimizerModalAction {
  type: typeof OptimizerActionTypes.SET_OPTIMIZER_MODAL;
  optimizerModal: boolean;
}

interface setOptimizerResultModalAction {
  type: typeof OptimizerActionTypes.SET_OPTIMIZER_RESULTS_MODAL;
  optimizerResultsModal: boolean;
}

interface setOptimizerResultEmptyModalAction {
  type: typeof OptimizerActionTypes.SET_OPTIMIZER_RESULTS_EMPTY_MODAL;
  optimizerResultsEmptyModal: boolean;
}
interface setOptimizerResultDisabledConstraintsModalAction {
  type: typeof OptimizerActionTypes.SET_OPTIMIZER_RESULTS_DISABLED_CONSTRAINTS_MODAL;
  optimizerResultsDisabledConstraintsModal: boolean;
}
interface setOptimizerResultAction {
  type: typeof OptimizerActionTypes.SET_OPTIMIZER_RESULTS;
  optimizerResults: Array<any>;
}

interface setOptimizerResultAction {
  type: typeof OptimizerActionTypes.SET_OPTIMIZER_RESULTS;
  optimizerResults: Array<any>;
}

interface setOptimizerResultSelectedIdsMapAction {
  type: typeof OptimizerActionTypes.SET_OPTIMIZER_RESULTS_SELECTED_IDS_MAP;
  selectedIdsMap: Record<string, boolean>;
}

interface setActivityRoleItemsAction {
  type: typeof OptimizerActionTypes.SET_ACTIVITY_ROLE_ITEMS;
  activityRoleItems: any;
}

interface resetOptimizerResultsAction {
  type: typeof OptimizerActionTypes.RESET_OPTIMIZER_RESULTS;
}

interface addOptimizerJobAction {
  type: typeof OptimizerActionTypes.ADD_OPTIMIZER_JOB;
  optimizerJob: IOptimizerJobItem;
}

interface updateOptimizerJobAction {
  type: typeof OptimizerActionTypes.UPDATE_OPTIMIZER_JOB;
  optimizerJob: IOptimizerJobItem;
}

interface removeOptimizerJobAction {
  type: typeof OptimizerActionTypes.REMOVE_OPTIMIZER_JOB;
  optimizerJobId: string;
}

interface resetOptimizerJobsAction {
  type: typeof OptimizerActionTypes.RESET_OPTIMIZER_JOBS;
}

export type OptimizerAction =
  | optimizerValuesAction
  | setOptimizerModalAction
  | setOptimizerResultModalAction
  | setOptimizerResultEmptyModalAction
  | setOptimizerResultDisabledConstraintsModalAction
  | setOptimizerResultAction
  | setOptimizerResultSelectedIdsMapAction
  | setActivityRoleItemsAction
  | resetOptimizerResultsAction
  | addOptimizerJobAction
  | updateOptimizerJobAction
  | removeOptimizerJobAction
  | resetOptimizerJobsAction;
