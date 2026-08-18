
export interface AvailabilitiesListState {
  rows: {
    [key: string]: any;
  }[];
  loading: boolean;
  count: number;
  modalOpen: boolean;
  idToDelete: null | string;
}

export enum AvailabilitiesListActionTypes {
    AVAILABILITIES_LIST_FETCH_STARTED = "AVAILABILITIES_LIST_FETCH_STARTED",
      AVAILABILITIES_LIST_FETCH_SUCCESS = "AVAILABILITIES_LIST_FETCH_SUCCESS",
        AVAILABILITIES_LIST_FETCH_ERROR = "AVAILABILITIES_LIST_FETCH_ERROR",
          AVAILABILITIES_LIST_DELETE_STARTED = "AVAILABILITIES_LIST_DELETE_STARTED",
            AVAILABILITIES_LIST_DELETE_SUCCESS = "AVAILABILITIES_LIST_DELETE_SUCCESS",
              AVAILABILITIES_LIST_DELETE_ERROR = "AVAILABILITIES_LIST_DELETE_ERROR",
                AVAILABILITIES_LIST_OPEN_CONFIRM = "AVAILABILITIES_LIST_OPEN_CONFIRM",
                  AVAILABILITIES_LIST_CLOSE_CONFIRM = "AVAILABILITIES_LIST_CLOSE_CONFIRM",
}

interface AvailabilitiesListFetchStarted {
  type: AvailabilitiesListActionTypes.AVAILABILITIES_LIST_FETCH_STARTED;
}

interface AvailabilitiesListFetchSuccess {
  type: AvailabilitiesListActionTypes.AVAILABILITIES_LIST_FETCH_SUCCESS;
  payload?: {
    rows: {
      [key: string]: any;
    }[];
    count: number
  };
}

interface AvailabilitiesListFetchError {
  type: AvailabilitiesListActionTypes.AVAILABILITIES_LIST_FETCH_ERROR;
}

interface AvailabilitiesListDeleteStarted {
  type: AvailabilitiesListActionTypes.AVAILABILITIES_LIST_DELETE_STARTED;
}

interface AvailabilitiesListDeleteSuccess {
  type: AvailabilitiesListActionTypes.AVAILABILITIES_LIST_DELETE_SUCCESS;
}

interface AvailabilitiesListDeleteError {
  type: AvailabilitiesListActionTypes.AVAILABILITIES_LIST_DELETE_ERROR;
}

interface AvailabilitiesListOpenConfirm {
  type: AvailabilitiesListActionTypes.AVAILABILITIES_LIST_OPEN_CONFIRM;
  payload: {
    id: string
  };
}

interface AvailabilitiesListCloseConfirm {
  type: AvailabilitiesListActionTypes.AVAILABILITIES_LIST_CLOSE_CONFIRM;
}

export type AvailabilitiesListAction =
  AvailabilitiesListFetchStarted
  | AvailabilitiesListFetchSuccess
  | AvailabilitiesListFetchError
  | AvailabilitiesListDeleteStarted
  | AvailabilitiesListDeleteSuccess
  | AvailabilitiesListDeleteError
  | AvailabilitiesListOpenConfirm
  | AvailabilitiesListCloseConfirm
