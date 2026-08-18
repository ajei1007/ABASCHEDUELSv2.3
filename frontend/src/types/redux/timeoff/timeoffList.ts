
export interface TimeoffListState {
  rows: {
    [key: string]: any;
  }[];
  loading: boolean;
  count: number;
  modalOpen: boolean;
  idToDelete: null | string;
}

export enum TimeoffListActionTypes {
    TIMEOFF_LIST_FETCH_STARTED = "TIMEOFF_LIST_FETCH_STARTED",
      TIMEOFF_LIST_FETCH_SUCCESS = "TIMEOFF_LIST_FETCH_SUCCESS",
        TIMEOFF_LIST_FETCH_ERROR = "TIMEOFF_LIST_FETCH_ERROR",
          TIMEOFF_LIST_DELETE_STARTED = "TIMEOFF_LIST_DELETE_STARTED",
            TIMEOFF_LIST_DELETE_SUCCESS = "TIMEOFF_LIST_DELETE_SUCCESS",
              TIMEOFF_LIST_DELETE_ERROR = "TIMEOFF_LIST_DELETE_ERROR",
                TIMEOFF_LIST_OPEN_CONFIRM = "TIMEOFF_LIST_OPEN_CONFIRM",
                  TIMEOFF_LIST_CLOSE_CONFIRM = "TIMEOFF_LIST_CLOSE_CONFIRM",
}

interface TimeoffListFetchStarted {
  type: TimeoffListActionTypes.TIMEOFF_LIST_FETCH_STARTED;
}

interface TimeoffListFetchSuccess {
  type: TimeoffListActionTypes.TIMEOFF_LIST_FETCH_SUCCESS;
  payload?: {
    rows: {
      [key: string]: any;
    }[];
    count: number
  };
}

interface TimeoffListFetchError {
  type: TimeoffListActionTypes.TIMEOFF_LIST_FETCH_ERROR;
}

interface TimeoffListDeleteStarted {
  type: TimeoffListActionTypes.TIMEOFF_LIST_DELETE_STARTED;
}

interface TimeoffListDeleteSuccess {
  type: TimeoffListActionTypes.TIMEOFF_LIST_DELETE_SUCCESS;
}

interface TimeoffListDeleteError {
  type: TimeoffListActionTypes.TIMEOFF_LIST_DELETE_ERROR;
}

interface TimeoffListOpenConfirm {
  type: TimeoffListActionTypes.TIMEOFF_LIST_OPEN_CONFIRM;
  payload: {
    id: string
  };
}

interface TimeoffListCloseConfirm {
  type: TimeoffListActionTypes.TIMEOFF_LIST_CLOSE_CONFIRM;
}

export type TimeoffListAction =
   TimeoffListFetchStarted
  | TimeoffListFetchSuccess
  | TimeoffListFetchError
  | TimeoffListDeleteStarted
  | TimeoffListDeleteSuccess
  | TimeoffListDeleteError
  | TimeoffListOpenConfirm
  | TimeoffListCloseConfirm
