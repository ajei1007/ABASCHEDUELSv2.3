
export interface EventpairListState {
  rows: {
    [key: string]: any;
  }[];
  loading: boolean;
  count: number;
  modalOpen: boolean;
  idToDelete: null | string;
}

export enum EventpairListActionTypes {
    EVENTPAIR_LIST_FETCH_STARTED = "EVENTPAIR_LIST_FETCH_STARTED",
      EVENTPAIR_LIST_FETCH_SUCCESS = "EVENTPAIR_LIST_FETCH_SUCCESS",
        EVENTPAIR_LIST_FETCH_ERROR = "EVENTPAIR_LIST_FETCH_ERROR",
          EVENTPAIR_LIST_DELETE_STARTED = "EVENTPAIR_LIST_DELETE_STARTED",
            EVENTPAIR_LIST_DELETE_SUCCESS = "EVENTPAIR_LIST_DELETE_SUCCESS",
              EVENTPAIR_LIST_DELETE_ERROR = "EVENTPAIR_LIST_DELETE_ERROR",
                EVENTPAIR_LIST_OPEN_CONFIRM = "EVENTPAIR_LIST_OPEN_CONFIRM",
                  EVENTPAIR_LIST_CLOSE_CONFIRM = "EVENTPAIR_LIST_CLOSE_CONFIRM",
}

interface EventpairListFetchStarted {
  type: EventpairListActionTypes.EVENTPAIR_LIST_FETCH_STARTED;
}

interface EventpairListFetchSuccess {
  type: EventpairListActionTypes.EVENTPAIR_LIST_FETCH_SUCCESS;
  payload?: {
    rows: {
      [key: string]: any;
    }[];
    count: number
  };
}

interface EventpairListFetchError {
  type: EventpairListActionTypes.EVENTPAIR_LIST_FETCH_ERROR;
}

interface EventpairListDeleteStarted {
  type: EventpairListActionTypes.EVENTPAIR_LIST_DELETE_STARTED;
}

interface EventpairListDeleteSuccess {
  type: EventpairListActionTypes.EVENTPAIR_LIST_DELETE_SUCCESS;
}

interface EventpairListDeleteError {
  type: EventpairListActionTypes.EVENTPAIR_LIST_DELETE_ERROR;
}

interface EventpairListOpenConfirm {
  type: EventpairListActionTypes.EVENTPAIR_LIST_OPEN_CONFIRM;
  payload: {
    id: string
  };
}

interface EventpairListCloseConfirm {
  type: EventpairListActionTypes.EVENTPAIR_LIST_CLOSE_CONFIRM;
}

export type EventpairListAction =
  EventpairListFetchStarted
  | EventpairListFetchSuccess
  | EventpairListFetchError
  | EventpairListDeleteStarted
  | EventpairListDeleteSuccess
  | EventpairListDeleteError
  | EventpairListOpenConfirm
  | EventpairListCloseConfirm
