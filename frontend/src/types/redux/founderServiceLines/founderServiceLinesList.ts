
export interface FounderServiceLinesListState {
  rows: {
    [key: string]: founderServiceLinesListRows;
  }[];
  loading: boolean;
  count: number;
  modalOpen: boolean;
  idToDelete: null | string;
}
export interface founderServiceLinesListRows {
    id: string,
    name?: string,
    importHash?: null,
    createdAt?: Date | any,
    updatedAt?: Date | any,
    deletedAt?: null,
    createdById?: string,
    updatedById?: string
}

export enum FounderServiceLinesListActionTypes {
    FOUNDER_SERVICE_LINES_LIST_FETCH_STARTED = "FOUNDER_SERVICE_LINES_LIST_FETCH_STARTED",
      FOUNDER_SERVICE_LINES_LIST_FETCH_SUCCESS = "FOUNDER_SERVICE_LINES_LIST_FETCH_SUCCESS",
        FOUNDER_SERVICE_LINES_LIST_FETCH_ERROR = "FOUNDER_SERVICE_LINES_LIST_FETCH_ERROR",
          FOUNDER_SERVICE_LINES_LIST_DELETE_STARTED = "FOUNDER_SERVICE_LINES_LIST_DELETE_STARTED",
            FOUNDER_SERVICE_LINES_LIST_DELETE_SUCCESS = "FOUNDER_SERVICE_LINES_LIST_DELETE_SUCCESS",
              FOUNDER_SERVICE_LINES_LIST_DELETE_ERROR = "FOUNDER_SERVICE_LINES_LIST_DELETE_ERROR",
                FOUNDER_SERVICE_LINES_LIST_OPEN_CONFIRM = "FOUNDER_SERVICE_LINES_LIST_OPEN_CONFIRM",
                  FOUNDER_SERVICE_LINES_LIST_CLOSE_CONFIRM = "FOUNDER_SERVICE_LINES_LIST_CLOSE_CONFIRM",
}

interface FounderServiceLinesListFetchStarted {
  type: FounderServiceLinesListActionTypes.FOUNDER_SERVICE_LINES_LIST_FETCH_STARTED;
}

interface FounderServiceLinesListFetchSuccess {
  type: FounderServiceLinesListActionTypes.FOUNDER_SERVICE_LINES_LIST_FETCH_SUCCESS;
  payload?: {
    rows: {
      [key: string]: founderServiceLinesListRows;
    }[];
    count: number
  };
}

interface FounderServiceLinesListFetchError {
  type: FounderServiceLinesListActionTypes.FOUNDER_SERVICE_LINES_LIST_FETCH_ERROR;
}

interface FounderServiceLinesListDeleteStarted {
  type: FounderServiceLinesListActionTypes.FOUNDER_SERVICE_LINES_LIST_DELETE_STARTED;
}

interface FounderServiceLinesListDeleteSuccess {
  type: FounderServiceLinesListActionTypes.FOUNDER_SERVICE_LINES_LIST_DELETE_SUCCESS;
}

interface FounderServiceLinesListDeleteError {
  type: FounderServiceLinesListActionTypes.FOUNDER_SERVICE_LINES_LIST_DELETE_ERROR;
}

interface FounderServiceLinesListOpenConfirm {
  type: FounderServiceLinesListActionTypes.FOUNDER_SERVICE_LINES_LIST_OPEN_CONFIRM;
  payload: {
    id: string
  };
}

interface FounderServiceLinesListCloseConfirm {
  type: FounderServiceLinesListActionTypes.FOUNDER_SERVICE_LINES_LIST_CLOSE_CONFIRM;
}

export type FounderServiceLinesListAction =
  | FounderServiceLinesListFetchStarted
  | FounderServiceLinesListFetchSuccess
  | FounderServiceLinesListFetchError
  | FounderServiceLinesListDeleteStarted
  | FounderServiceLinesListDeleteSuccess
  | FounderServiceLinesListDeleteError
  | FounderServiceLinesListOpenConfirm
  | FounderServiceLinesListCloseConfirm
