
export interface StatuseventsListState {
  rows: {
    [key: string]: any;
  }[];
  loading: boolean;
  count: number;
  modalOpen: boolean;
  idToDelete: null | string;
}

export enum StatuseventsListActionTypes {
    STATUSEVENTS_LIST_FETCH_STARTED = "STATUSEVENTS_LIST_FETCH_STARTED",
      STATUSEVENTS_LIST_FETCH_SUCCESS = "STATUSEVENTS_LIST_FETCH_SUCCESS",
        STATUSEVENTS_LIST_FETCH_ERROR = "STATUSEVENTS_LIST_FETCH_ERROR",
          STATUSEVENTS_LIST_DELETE_STARTED = "STATUSEVENTS_LIST_DELETE_STARTED",
            STATUSEVENTS_LIST_DELETE_SUCCESS = "STATUSEVENTS_LIST_DELETE_SUCCESS",
              STATUSEVENTS_LIST_DELETE_ERROR = "STATUSEVENTS_LIST_DELETE_ERROR",
                STATUSEVENTS_LIST_OPEN_CONFIRM = "STATUSEVENTS_LIST_OPEN_CONFIRM",
                  STATUSEVENTS_LIST_CLOSE_CONFIRM = "STATUSEVENTS_LIST_CLOSE_CONFIRM",
}

interface StatuseventsListFetchStarted {
  type: StatuseventsListActionTypes.STATUSEVENTS_LIST_FETCH_STARTED;
}

interface StatuseventsListFetchSuccess {
  type: StatuseventsListActionTypes.STATUSEVENTS_LIST_FETCH_SUCCESS;
  payload?: {
    rows: {
      [key: string]: any;
    }[];
    count: number
  };
}

interface StatuseventsListFetchError {
  type: StatuseventsListActionTypes.STATUSEVENTS_LIST_FETCH_ERROR;
}

interface StatuseventsListDeleteStarted {
  type: StatuseventsListActionTypes.STATUSEVENTS_LIST_DELETE_STARTED;
}

interface StatuseventsListDeleteSuccess {
  type: StatuseventsListActionTypes.STATUSEVENTS_LIST_DELETE_SUCCESS;
}

interface StatuseventsListDeleteError {
  type: StatuseventsListActionTypes.STATUSEVENTS_LIST_DELETE_ERROR;
}

interface StatuseventsListOpenConfirm {
  type: StatuseventsListActionTypes.STATUSEVENTS_LIST_OPEN_CONFIRM;
  payload: {
    id: string
  };
}

interface StatuseventsListCloseConfirm {
  type: StatuseventsListActionTypes.STATUSEVENTS_LIST_CLOSE_CONFIRM;
}

export type StatuseventsListAction =
  StatuseventsListFetchStarted
  | StatuseventsListFetchSuccess
  | StatuseventsListFetchError
  | StatuseventsListDeleteStarted
  | StatuseventsListDeleteSuccess
  | StatuseventsListDeleteError
  | StatuseventsListOpenConfirm
  | StatuseventsListCloseConfirm
