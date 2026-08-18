export interface RequestsState {
  timeoffRequestData: any[];
  timeoffRequestLoading: boolean;
  timeoffRequestError: string | null;
  timeoffRequestFormLoading: boolean;
  timeoffRequestFormError: string | null;
}

export const DELETE_REQUEST_STARTED = 'DELETE_REQUEST_STARTED';
export const DELETE_REQUEST_SUCCESS = 'DELETE_REQUEST_SUCCESS';
export const DELETE_REQUEST_FAILURE = 'DELETE_REQUEST_FAILURE';

export const UPDATE_REQUEST_STARTED = 'UPDATE_REQUEST_STARTED';
export const UPDATE_REQUEST_SUCCESS = 'UPDATE_REQUEST_SUCCESS';
export const UPDATE_REQUEST_FAILURE = 'UPDATE_REQUEST_FAILURE';

export const CREATE_REQUEST_STARTED = 'CREATE_REQUEST_STARTED';
export const CREATE_REQUEST_SUCCESS = 'CREATE_REQUEST_SUCCESS';
export const CREATE_REQUEST_FAILURE = 'CREATE_REQUEST_FAILURE';

export const GET_AVAILABILITY_REQUESTS_STARTED =
  'GET_AVAILABILITY_REQUESTS_STARTED';
export const GET_AVAILABILITY_REQUESTS_SUCCESS =
  'GET_AVAILABILITY_REQUESTS_SUCCESS';
export const GET_AVAILABILITY_REQUESTS_FAILURE =
  'GET_AVAILABILITY_REQUESTS_FAILURE';

export const GET_TIMEOFF_REQUESTS_STARTED = 'GET_TIMEOFF_REQUESTS_STARTED';
export const GET_TIMEOFF_REQUESTS_SUCCESS = 'GET_TIMEOFF_REQUESTS_SUCCESS';
export const GET_TIMEOFF_REQUESTS_FAILURE = 'GET_TIMEOFF_REQUESTS_FAILURE';

export const SET_SELECTED_START_DATE = 'SET_SELECTED_START_DATE';
export const SET_SELECTED_END_DATE = 'SET_SELECTED_END_DATE';

export interface DeleteRequestStartedAction {
  type: typeof DELETE_REQUEST_STARTED;
}

export interface DeleteRequestSuccessAction {
  type: typeof DELETE_REQUEST_SUCCESS;
}

export interface DeleteRequestFailureAction {
  type: typeof DELETE_REQUEST_FAILURE;
  payload: string;
}

export interface UpdateRequestStartedAction {
  type: typeof UPDATE_REQUEST_STARTED;
}

export interface UpdateRequestSuccessAction {
  type: typeof UPDATE_REQUEST_SUCCESS;
}

export interface UpdateRequestFailureAction {
  type: typeof UPDATE_REQUEST_FAILURE;
  payload: string;
}

export interface CreateRequestStartedAction {
  type: typeof CREATE_REQUEST_STARTED;
}

export interface CreateRequestSuccessAction {
  type: typeof CREATE_REQUEST_SUCCESS;
  payload: any;
}

export interface CreateRequestFailureAction {
  type: typeof CREATE_REQUEST_FAILURE;
  payload: string;
}

export interface GetAvailabilityRequestsStartedAction {
  type: typeof GET_AVAILABILITY_REQUESTS_STARTED;
}

export interface GetAvailabilityRequestsSuccessAction {
  type: typeof GET_AVAILABILITY_REQUESTS_SUCCESS;
  payload: any;
}

export interface GetAvailabilityRequestsFailureAction {
  type: typeof GET_AVAILABILITY_REQUESTS_FAILURE;
  payload: string;
}

export interface GetTimeOffRequestsStartedAction {
  type: typeof GET_TIMEOFF_REQUESTS_STARTED;
}

export interface GetTimeOffRequestsSuccessAction {
  type: typeof GET_TIMEOFF_REQUESTS_SUCCESS;
  payload: any;
}

export interface GetTimeOffRequestsFailureAction {
  type: typeof GET_TIMEOFF_REQUESTS_FAILURE;
  payload: string;
}
export interface SetSelectedStartDate {
  type: typeof SET_SELECTED_START_DATE;
  payload: any;
}

export interface SetSelectedEndDate {
  type: typeof SET_SELECTED_END_DATE;
  payload: any;
}

export type RequestsActionTypes =
  | DeleteRequestStartedAction
  | DeleteRequestSuccessAction
  | DeleteRequestFailureAction
  | UpdateRequestStartedAction
  | UpdateRequestSuccessAction
  | UpdateRequestFailureAction
  | CreateRequestStartedAction
  | CreateRequestSuccessAction
  | CreateRequestFailureAction
  | GetAvailabilityRequestsStartedAction
  | GetAvailabilityRequestsSuccessAction
  | GetAvailabilityRequestsFailureAction
  | GetTimeOffRequestsStartedAction
  | GetTimeOffRequestsSuccessAction
  | GetTimeOffRequestsFailureAction
  | SetSelectedStartDate
  | SetSelectedEndDate;
