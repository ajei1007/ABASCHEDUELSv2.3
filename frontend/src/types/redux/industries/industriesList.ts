
export interface IndustriesListState {
  rows: {
    [key: string]: any;
  }[];
  loading: boolean;
  count: number;
  modalOpen: boolean;
  idToDelete: null | string;
}

export enum IndustriesListActionTypes {
    INDUSTRIES_LIST_FETCH_STARTED = "INDUSTRIES_LIST_FETCH_STARTED",
      INDUSTRIES_LIST_FETCH_SUCCESS = "INDUSTRIES_LIST_FETCH_SUCCESS",
        INDUSTRIES_LIST_FETCH_ERROR = "INDUSTRIES_LIST_FETCH_ERROR",
          INDUSTRIES_LIST_DELETE_STARTED = "INDUSTRIES_LIST_DELETE_STARTED",
            INDUSTRIES_LIST_DELETE_SUCCESS = "INDUSTRIES_LIST_DELETE_SUCCESS",
              INDUSTRIES_LIST_DELETE_ERROR = "INDUSTRIES_LIST_DELETE_ERROR",
                INDUSTRIES_LIST_OPEN_CONFIRM = "INDUSTRIES_LIST_OPEN_CONFIRM",
                  INDUSTRIES_LIST_CLOSE_CONFIRM = "INDUSTRIES_LIST_CLOSE_CONFIRM",
}

interface IndustriesListFetchStarted {
  type: IndustriesListActionTypes.INDUSTRIES_LIST_FETCH_STARTED;
}

interface IndustriesListFetchSuccess {
  type: IndustriesListActionTypes.INDUSTRIES_LIST_FETCH_SUCCESS;
  payload?: {
    rows: {
      [key: string]: any;
    }[];
    count: number
  };
}

interface IndustriesListFetchError {
  type: IndustriesListActionTypes.INDUSTRIES_LIST_FETCH_ERROR;
}

interface IndustriesListDeleteStarted {
  type: IndustriesListActionTypes.INDUSTRIES_LIST_DELETE_STARTED;
}

interface IndustriesListDeleteSuccess {
  type: IndustriesListActionTypes.INDUSTRIES_LIST_DELETE_SUCCESS;
}

interface IndustriesListDeleteError {
  type: IndustriesListActionTypes.INDUSTRIES_LIST_DELETE_ERROR;
}

interface IndustriesListOpenConfirm {
  type: IndustriesListActionTypes.INDUSTRIES_LIST_OPEN_CONFIRM;
  payload: {
    id: string
  };
}

interface IndustriesListCloseConfirm {
  type: IndustriesListActionTypes.INDUSTRIES_LIST_CLOSE_CONFIRM;
}

export type IndustriesListAction =
  IndustriesListFetchStarted
  | IndustriesListFetchSuccess
  | IndustriesListFetchError
  | IndustriesListDeleteStarted
  | IndustriesListDeleteSuccess
  | IndustriesListDeleteError
  | IndustriesListOpenConfirm
  | IndustriesListCloseConfirm
