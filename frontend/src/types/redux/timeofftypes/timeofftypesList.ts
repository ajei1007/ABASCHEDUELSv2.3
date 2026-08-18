
export interface TimeofftypesListState {
  rows: {
    [key: string]: any;
  }[];
  loading: boolean;
  count: number;
  modalOpen: boolean;
  idToDelete: null | string;
}

export enum TimeofftypesListActionTypes {
    TIMEOFFTYPES_LIST_FETCH_STARTED = "TIMEOFFTYPES_LIST_FETCH_STARTED",
      TIMEOFFTYPES_LIST_FETCH_SUCCESS = "TIMEOFFTYPES_LIST_FETCH_SUCCESS",
        TIMEOFFTYPES_LIST_FETCH_ERROR = "TIMEOFFTYPES_LIST_FETCH_ERROR",
          TIMEOFFTYPES_LIST_DELETE_STARTED = "TIMEOFFTYPES_LIST_DELETE_STARTED",
            TIMEOFFTYPES_LIST_DELETE_SUCCESS = "TIMEOFFTYPES_LIST_DELETE_SUCCESS",
              TIMEOFFTYPES_LIST_DELETE_ERROR = "TIMEOFFTYPES_LIST_DELETE_ERROR",
                TIMEOFFTYPES_LIST_OPEN_CONFIRM = "TIMEOFFTYPES_LIST_OPEN_CONFIRM",
                  TIMEOFFTYPES_LIST_CLOSE_CONFIRM = "TIMEOFFTYPES_LIST_CLOSE_CONFIRM",
}

interface TimeofftypesListFetchStarted {
  type: TimeofftypesListActionTypes.TIMEOFFTYPES_LIST_FETCH_STARTED;
}

interface TimeofftypesListFetchSuccess {
  type: TimeofftypesListActionTypes.TIMEOFFTYPES_LIST_FETCH_SUCCESS;
  payload?: {
    rows: {
      [key: string]: any;
    }[];
    count: number
  };
}

interface TimeofftypesListFetchError {
  type: TimeofftypesListActionTypes.TIMEOFFTYPES_LIST_FETCH_ERROR;
}

interface TimeofftypesListDeleteStarted {
  type: TimeofftypesListActionTypes.TIMEOFFTYPES_LIST_DELETE_STARTED;
}

interface TimeofftypesListDeleteSuccess {
  type: TimeofftypesListActionTypes.TIMEOFFTYPES_LIST_DELETE_SUCCESS;
}

interface TimeofftypesListDeleteError {
  type: TimeofftypesListActionTypes.TIMEOFFTYPES_LIST_DELETE_ERROR;
}

interface TimeofftypesListOpenConfirm {
  type: TimeofftypesListActionTypes.TIMEOFFTYPES_LIST_OPEN_CONFIRM;
  payload: {
    id: string
  };
}

interface TimeofftypesListCloseConfirm {
  type: TimeofftypesListActionTypes.TIMEOFFTYPES_LIST_CLOSE_CONFIRM;
}

export type TimeofftypesListAction =
  TimeofftypesListFetchStarted
  | TimeofftypesListFetchSuccess
  | TimeofftypesListFetchError
  | TimeofftypesListDeleteStarted
  | TimeofftypesListDeleteSuccess
  | TimeofftypesListDeleteError
  | TimeofftypesListOpenConfirm
  | TimeofftypesListCloseConfirm
