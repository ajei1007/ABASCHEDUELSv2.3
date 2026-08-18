
export interface DrivetimebranchListState {
  rows: {
    [key: string]: any;
  }[];
  loading: boolean;
  count: number;
  modalOpen: boolean;
  idToDelete: null | string;
}

export enum DrivetimebranchListActionTypes {
    DRIVETIMEBRANCH_LIST_FETCH_STARTED = "DRIVETIMEBRANCH_LIST_FETCH_STARTED",
      DRIVETIMEBRANCH_LIST_FETCH_SUCCESS = "DRIVETIMEBRANCH_LIST_FETCH_SUCCESS",
        DRIVETIMEBRANCH_LIST_FETCH_ERROR = "DRIVETIMEBRANCH_LIST_FETCH_ERROR",
          DRIVETIMEBRANCH_LIST_DELETE_STARTED = "DRIVETIMEBRANCH_LIST_DELETE_STARTED",
            DRIVETIMEBRANCH_LIST_DELETE_SUCCESS = "DRIVETIMEBRANCH_LIST_DELETE_SUCCESS",
              DRIVETIMEBRANCH_LIST_DELETE_ERROR = "DRIVETIMEBRANCH_LIST_DELETE_ERROR",
                DRIVETIMEBRANCH_LIST_OPEN_CONFIRM = "DRIVETIMEBRANCH_LIST_OPEN_CONFIRM",
                  DRIVETIMEBRANCH_LIST_CLOSE_CONFIRM = "DRIVETIMEBRANCH_LIST_CLOSE_CONFIRM",
}

interface DrivetimebranchListFetchStarted {
  type: DrivetimebranchListActionTypes.DRIVETIMEBRANCH_LIST_FETCH_STARTED;
}

interface DrivetimebranchListFetchSuccess {
  type: DrivetimebranchListActionTypes.DRIVETIMEBRANCH_LIST_FETCH_SUCCESS;
  payload?: {
    rows: {
      [key: string]: any;
    }[];
    count: number
  };
}

interface DrivetimebranchListFetchError {
  type: DrivetimebranchListActionTypes.DRIVETIMEBRANCH_LIST_FETCH_ERROR;
}

interface DrivetimebranchListDeleteStarted {
  type: DrivetimebranchListActionTypes.DRIVETIMEBRANCH_LIST_DELETE_STARTED;
}

interface DrivetimebranchListDeleteSuccess {
  type: DrivetimebranchListActionTypes.DRIVETIMEBRANCH_LIST_DELETE_SUCCESS;
}

interface DrivetimebranchListDeleteError {
  type: DrivetimebranchListActionTypes.DRIVETIMEBRANCH_LIST_DELETE_ERROR;
}

interface DrivetimebranchListOpenConfirm {
  type: DrivetimebranchListActionTypes.DRIVETIMEBRANCH_LIST_OPEN_CONFIRM;
  payload: {
    id: string
  };
}

interface DrivetimebranchListCloseConfirm {
  type: DrivetimebranchListActionTypes.DRIVETIMEBRANCH_LIST_CLOSE_CONFIRM;
}

export type DrivetimebranchListAction =
  DrivetimebranchListFetchStarted
  | DrivetimebranchListFetchSuccess
  | DrivetimebranchListFetchError
  | DrivetimebranchListDeleteStarted
  | DrivetimebranchListDeleteSuccess
  | DrivetimebranchListDeleteError
  | DrivetimebranchListOpenConfirm
  | DrivetimebranchListCloseConfirm
