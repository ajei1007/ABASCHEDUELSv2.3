
export interface PrioritiesListState {
  rows: {
    [key: string]: any;
  }[];
  loading: boolean;
  count: number;
  modalOpen: boolean;
  idToDelete: null | string;
}

export enum PrioritiesListActionTypes {
    PRIORITIES_LIST_FETCH_STARTED = "PRIORITIES_LIST_FETCH_STARTED",
      PRIORITIES_LIST_FETCH_SUCCESS = "PRIORITIES_LIST_FETCH_SUCCESS",
        PRIORITIES_LIST_FETCH_ERROR = "PRIORITIES_LIST_FETCH_ERROR",
          PRIORITIES_LIST_DELETE_STARTED = "PRIORITIES_LIST_DELETE_STARTED",
            PRIORITIES_LIST_DELETE_SUCCESS = "PRIORITIES_LIST_DELETE_SUCCESS",
              PRIORITIES_LIST_DELETE_ERROR = "PRIORITIES_LIST_DELETE_ERROR",
                PRIORITIES_LIST_OPEN_CONFIRM = "PRIORITIES_LIST_OPEN_CONFIRM",
                  PRIORITIES_LIST_CLOSE_CONFIRM = "PRIORITIES_LIST_CLOSE_CONFIRM",
}

interface PrioritiesListFetchStarted {
  type: PrioritiesListActionTypes.PRIORITIES_LIST_FETCH_STARTED;
}

interface PrioritiesListFetchSuccess {
  type: PrioritiesListActionTypes.PRIORITIES_LIST_FETCH_SUCCESS;
  payload?: {
    rows: {
      [key: string]: any;
    }[];
    count: number
  };
}

interface PrioritiesListFetchError {
  type: PrioritiesListActionTypes.PRIORITIES_LIST_FETCH_ERROR;
}

interface PrioritiesListDeleteStarted {
  type: PrioritiesListActionTypes.PRIORITIES_LIST_DELETE_STARTED;
}

interface PrioritiesListDeleteSuccess {
  type: PrioritiesListActionTypes.PRIORITIES_LIST_DELETE_SUCCESS;
}

interface PrioritiesListDeleteError {
  type: PrioritiesListActionTypes.PRIORITIES_LIST_DELETE_ERROR;
}

interface PrioritiesListOpenConfirm {
  type: PrioritiesListActionTypes.PRIORITIES_LIST_OPEN_CONFIRM;
  payload: {
    id: string
  };
}

interface PrioritiesListCloseConfirm {
  type: PrioritiesListActionTypes.PRIORITIES_LIST_CLOSE_CONFIRM;
}

export type PrioritiesListAction =
  PrioritiesListFetchStarted
  | PrioritiesListFetchSuccess
  | PrioritiesListFetchError
  | PrioritiesListDeleteStarted
  | PrioritiesListDeleteSuccess
  | PrioritiesListDeleteError
  | PrioritiesListOpenConfirm
  | PrioritiesListCloseConfirm
