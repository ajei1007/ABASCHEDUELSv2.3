export interface RequestsState {
  cancellationsRequestData: any[];
  confirmationsRequestData: any[];
  confirmationsRequestDataCount: number;
  confirmationsRequestDataLoading: boolean;
  availabilitiesRequestData: any[];
  timeoffRequestData: any[];
  lateRequestData: any[];
  selectedStartDate: Date | null;
  selectedEndDate: Date | null;
}

export enum RequestsActionTypes {
  SET_CANCELLATIONS_REQUEST_DATA = 'SET_CANCELLATIONS_REQUEST_DATA',
  SET_CONFIRMATIONS_REQUEST_DATA = 'SET_CONFIRMATIONS_REQUEST_DATA',
  SET_AVAILABILITIES_REQUEST_DATA = 'SET_AVAILABILITIES_REQUEST_DATA',
  SET_TIMEOFF_REQUEST_DATA = 'SET_TIMEOFF_REQUEST_DATA',
  SET_LATE_REQUEST_DATA = 'SET_LATE_REQUEST_DATA',
  SET_SELECTED_START_DATE = 'SET_SELECTED_START_DATE',
  SET_SELECTED_END_DATE = 'SET_SELECTED_END_DATE',
}

interface SetCancellationsRequestDataAction {
  type: typeof RequestsActionTypes.SET_CANCELLATIONS_REQUEST_DATA;
  cancellationsRequestData: any[];
}

interface SetConfirmationRequestDataAction {
  type: typeof RequestsActionTypes.SET_CONFIRMATIONS_REQUEST_DATA;
  confirmationsRequestData: any[];
  confirmationsRequestDataCount: number;
  confirmationsRequestDataLoading: boolean;
}

interface SetAvailabilityRequestDataAction {
  type: typeof RequestsActionTypes.SET_AVAILABILITIES_REQUEST_DATA;
  availabilitiesRequestData: any[];
}

interface SetTimeoffRequestDataAction {
  type: typeof RequestsActionTypes.SET_TIMEOFF_REQUEST_DATA;
  timeoffRequestData: any[];
}

interface SetLateRequestDataAction {
  type: typeof RequestsActionTypes.SET_LATE_REQUEST_DATA;
  lateRequestData: any[];
}

export interface SetSelectedStartDate {
  type: typeof RequestsActionTypes.SET_SELECTED_START_DATE;
  payload: any;
}

export interface SetSelectedEndDate {
  type: typeof RequestsActionTypes.SET_SELECTED_END_DATE;
  payload: any;
}

export type RequestsAction =
  | SetCancellationsRequestDataAction
  | SetConfirmationRequestDataAction
  | SetAvailabilityRequestDataAction
  | SetTimeoffRequestDataAction
  | SetLateRequestDataAction
  | SetSelectedStartDate
  | SetSelectedEndDate;
