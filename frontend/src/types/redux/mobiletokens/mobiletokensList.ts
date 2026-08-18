
export interface MobiletokensListState {
  rows: {
    [key: string]: any;
  }[];
  loading: boolean;
  count: number;
  modalOpen: boolean;
  idToDelete: null | string;
}

export enum MobiletokensListActionTypes {
    MOBILETOKENS_LIST_FETCH_STARTED = "MOBILETOKENS_LIST_FETCH_STARTED",
      MOBILETOKENS_LIST_FETCH_SUCCESS = "MOBILETOKENS_LIST_FETCH_SUCCESS",
        MOBILETOKENS_LIST_FETCH_ERROR = "MOBILETOKENS_LIST_FETCH_ERROR",
          MOBILETOKENS_LIST_DELETE_STARTED = "MOBILETOKENS_LIST_DELETE_STARTED",
            MOBILETOKENS_LIST_DELETE_SUCCESS = "MOBILETOKENS_LIST_DELETE_SUCCESS",
              MOBILETOKENS_LIST_DELETE_ERROR = "MOBILETOKENS_LIST_DELETE_ERROR",
                MOBILETOKENS_LIST_OPEN_CONFIRM = "MOBILETOKENS_LIST_OPEN_CONFIRM",
                  MOBILETOKENS_LIST_CLOSE_CONFIRM = "MOBILETOKENS_LIST_CLOSE_CONFIRM",
}

interface MobiletokensListFetchStarted {
  type: MobiletokensListActionTypes.MOBILETOKENS_LIST_FETCH_STARTED;
}

interface MobiletokensListFetchSuccess {
  type: MobiletokensListActionTypes.MOBILETOKENS_LIST_FETCH_SUCCESS;
  payload?: {
    rows: {
      [key: string]: any;
    }[];
    count: number
  };
}

interface MobiletokensListFetchError {
  type: MobiletokensListActionTypes.MOBILETOKENS_LIST_FETCH_ERROR;
}

interface MobiletokensListDeleteStarted {
  type: MobiletokensListActionTypes.MOBILETOKENS_LIST_DELETE_STARTED;
}

interface MobiletokensListDeleteSuccess {
  type: MobiletokensListActionTypes.MOBILETOKENS_LIST_DELETE_SUCCESS;
}

interface MobiletokensListDeleteError {
  type: MobiletokensListActionTypes.MOBILETOKENS_LIST_DELETE_ERROR;
}

interface MobiletokensListOpenConfirm {
  type: MobiletokensListActionTypes.MOBILETOKENS_LIST_OPEN_CONFIRM;
  payload: {
    id: string
  };
}

interface MobiletokensListCloseConfirm {
  type: MobiletokensListActionTypes.MOBILETOKENS_LIST_CLOSE_CONFIRM;
}

export type MobiletokensListAction =
  MobiletokensListFetchStarted
  | MobiletokensListFetchSuccess
  | MobiletokensListFetchError
  | MobiletokensListDeleteStarted
  | MobiletokensListDeleteSuccess
  | MobiletokensListDeleteError
  | MobiletokensListOpenConfirm
  | MobiletokensListCloseConfirm
