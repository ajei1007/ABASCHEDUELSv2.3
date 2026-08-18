
export interface EventsListState {
  rows: {
    [key: string]: any;
  }[];
  loading: boolean;
  count: number;
  modalOpen: boolean;
  idToDelete: null | string;
}

export enum EventsListActionTypes {
    EVENTS_LIST_FETCH_STARTED = "EVENTS_LIST_FETCH_STARTED",
      EVENTS_LIST_FETCH_SUCCESS = "EVENTS_LIST_FETCH_SUCCESS",
        EVENTS_LIST_FETCH_ERROR = "EVENTS_LIST_FETCH_ERROR",
          EVENTS_LIST_DELETE_STARTED = "EVENTS_LIST_DELETE_STARTED",
            EVENTS_LIST_DELETE_SUCCESS = "EVENTS_LIST_DELETE_SUCCESS",
              EVENTS_LIST_DELETE_ERROR = "EVENTS_LIST_DELETE_ERROR",
                EVENTS_LIST_OPEN_CONFIRM = "EVENTS_LIST_OPEN_CONFIRM",
                  EVENTS_LIST_CLOSE_CONFIRM = "EVENTS_LIST_CLOSE_CONFIRM",
}

interface EventsListFetchStarted {
  type: EventsListActionTypes.EVENTS_LIST_FETCH_STARTED;
}

interface EventsListFetchSuccess {
  type: EventsListActionTypes.EVENTS_LIST_FETCH_SUCCESS;
  payload?: {
    rows: {
      [key: string]: any;
    }[];
    count: number
  };
}

interface EventsListFetchError {
  type: EventsListActionTypes.EVENTS_LIST_FETCH_ERROR;
}

interface EventsListDeleteStarted {
  type: EventsListActionTypes.EVENTS_LIST_DELETE_STARTED;
}

interface EventsListDeleteSuccess {
  type: EventsListActionTypes.EVENTS_LIST_DELETE_SUCCESS;
}

interface EventsListDeleteError {
  type: EventsListActionTypes.EVENTS_LIST_DELETE_ERROR;
}

interface EventsListOpenConfirm {
  type: EventsListActionTypes.EVENTS_LIST_OPEN_CONFIRM;
  payload: {
    id: string
  };
}

interface EventsListCloseConfirm {
  type: EventsListActionTypes.EVENTS_LIST_CLOSE_CONFIRM;
}

export type EventsListAction =
   EventsListFetchStarted
  | EventsListFetchSuccess
  | EventsListFetchError
  | EventsListDeleteStarted
  | EventsListDeleteSuccess
  | EventsListDeleteError
  | EventsListOpenConfirm
  | EventsListCloseConfirm
