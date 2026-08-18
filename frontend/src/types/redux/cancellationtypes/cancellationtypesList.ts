
export interface CancellationtypesListState {
  rows: {
    [key: string]: CancellationRowState;
  }[];
  loading: boolean;
  count: number;
  modalOpen: boolean;
  idToDelete: null | string;
}
export interface CancellationRowState {
  id?: string,
  name?: string,
  importHash?: null,
  createdAt?: Date | any,
  updatedAt?: Date | any,
  deletedAt?: null,
  createdById?: string,
  updatedById?: string,
  createdBy? : null | any
}

export enum CancellationtypesListActionTypes {
    CANCELLATIONTYPES_LIST_FETCH_STARTED = "CANCELLATIONTYPES_LIST_FETCH_STARTED",
      CANCELLATIONTYPES_LIST_FETCH_SUCCESS = "CANCELLATIONTYPES_LIST_FETCH_SUCCESS",
        CANCELLATIONTYPES_LIST_FETCH_ERROR = "CANCELLATIONTYPES_LIST_FETCH_ERROR",
          CANCELLATIONTYPES_LIST_DELETE_STARTED = "CANCELLATIONTYPES_LIST_DELETE_STARTED",
            CANCELLATIONTYPES_LIST_DELETE_SUCCESS = "CANCELLATIONTYPES_LIST_DELETE_SUCCESS",
              CANCELLATIONTYPES_LIST_DELETE_ERROR = "CANCELLATIONTYPES_LIST_DELETE_ERROR",
                CANCELLATIONTYPES_LIST_OPEN_CONFIRM = "CANCELLATIONTYPES_LIST_OPEN_CONFIRM",
                  CANCELLATIONTYPES_LIST_CLOSE_CONFIRM = "CANCELLATIONTYPES_LIST_CLOSE_CONFIRM",
}

interface CancellationtypesListFetchStarted {
  type: CancellationtypesListActionTypes.CANCELLATIONTYPES_LIST_FETCH_STARTED;
}

interface CancellationtypesListFetchSuccess {
  type: CancellationtypesListActionTypes.CANCELLATIONTYPES_LIST_FETCH_SUCCESS;
  payload?: {
    rows: {
      [key: string]: CancellationRowState;
    }[];
    count: number
  };
}

interface CancellationtypesListFetchError {
  type: CancellationtypesListActionTypes.CANCELLATIONTYPES_LIST_FETCH_ERROR;
}

interface CancellationtypesListDeleteStarted {
  type: CancellationtypesListActionTypes.CANCELLATIONTYPES_LIST_DELETE_STARTED;
}

interface CancellationtypesListDeleteSuccess {
  type: CancellationtypesListActionTypes.CANCELLATIONTYPES_LIST_DELETE_SUCCESS;
}

interface CancellationtypesListDeleteError {
  type: CancellationtypesListActionTypes.CANCELLATIONTYPES_LIST_DELETE_ERROR;
}

interface CancellationtypesListOpenConfirm {
  type: CancellationtypesListActionTypes.CANCELLATIONTYPES_LIST_OPEN_CONFIRM;
  payload: {
    id: string
  };
}

interface CancellationtypesListCloseConfirm {
  type: CancellationtypesListActionTypes.CANCELLATIONTYPES_LIST_CLOSE_CONFIRM;
}

export type CancellationtypesListAction =
  CancellationtypesListFetchStarted
  | CancellationtypesListFetchSuccess
  | CancellationtypesListFetchError
  | CancellationtypesListDeleteStarted
  | CancellationtypesListDeleteSuccess
  | CancellationtypesListDeleteError
  | CancellationtypesListOpenConfirm
  | CancellationtypesListCloseConfirm
