
export interface TotaltypesListState {
  rows: {
    [key: string]: any;
  }[];
  loading: boolean;
  count: number;
  modalOpen: boolean;
  idToDelete: null | string;
}

export enum TotaltypesListActionTypes {
    TOTALTYPES_LIST_FETCH_STARTED = "TOTALTYPES_LIST_FETCH_STARTED",
      TOTALTYPES_LIST_FETCH_SUCCESS = "TOTALTYPES_LIST_FETCH_SUCCESS",
        TOTALTYPES_LIST_FETCH_ERROR = "TOTALTYPES_LIST_FETCH_ERROR",
          TOTALTYPES_LIST_DELETE_STARTED = "TOTALTYPES_LIST_DELETE_STARTED",
            TOTALTYPES_LIST_DELETE_SUCCESS = "TOTALTYPES_LIST_DELETE_SUCCESS",
              TOTALTYPES_LIST_DELETE_ERROR = "TOTALTYPES_LIST_DELETE_ERROR",
                TOTALTYPES_LIST_OPEN_CONFIRM = "TOTALTYPES_LIST_OPEN_CONFIRM",
                  TOTALTYPES_LIST_CLOSE_CONFIRM = "TOTALTYPES_LIST_CLOSE_CONFIRM",
}

interface TotaltypesListFetchStarted {
  type: TotaltypesListActionTypes.TOTALTYPES_LIST_FETCH_STARTED;
}

interface TotaltypesListFetchSuccess {
  type: TotaltypesListActionTypes.TOTALTYPES_LIST_FETCH_SUCCESS;
  payload?: {
    rows: {
      [key: string]: any;
    }[];
    count: number
  };
}

interface TotaltypesListFetchError {
  type: TotaltypesListActionTypes.TOTALTYPES_LIST_FETCH_ERROR;
}

interface TotaltypesListDeleteStarted {
  type: TotaltypesListActionTypes.TOTALTYPES_LIST_DELETE_STARTED;
}

interface TotaltypesListDeleteSuccess {
  type: TotaltypesListActionTypes.TOTALTYPES_LIST_DELETE_SUCCESS;
}

interface TotaltypesListDeleteError {
  type: TotaltypesListActionTypes.TOTALTYPES_LIST_DELETE_ERROR;
}

interface TotaltypesListOpenConfirm {
  type: TotaltypesListActionTypes.TOTALTYPES_LIST_OPEN_CONFIRM;
  payload: {
    id: string
  };
}

interface TotaltypesListCloseConfirm {
  type: TotaltypesListActionTypes.TOTALTYPES_LIST_CLOSE_CONFIRM;
}

export type TotaltypesListAction =
   TotaltypesListFetchStarted
  | TotaltypesListFetchSuccess
  | TotaltypesListFetchError
  | TotaltypesListDeleteStarted
  | TotaltypesListDeleteSuccess
  | TotaltypesListDeleteError
  | TotaltypesListOpenConfirm
  | TotaltypesListCloseConfirm
