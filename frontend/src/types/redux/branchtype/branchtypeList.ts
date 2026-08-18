export interface BranchtypeListState {
  rows: {
    [key: string]: branchtypeRowState;
  }[];
  loading: boolean;
  count: number;
  modalOpen: boolean;
  idToDelete: null | string;
}

export interface createdByInterface {
  id?: string;
  firstName?: string;
}
export interface branchtypeInterface {
  id?: string;
  name?: string;
  bol?: boolean;
  physical?: boolean;
  importHash?: null;
  createdAt?: Date | any;
  updatedAt?: Date | any;
  deletedAt?: null;
  parentId?: null;
  createdById?: string;
  updatedById?: string;
}

export interface branchtypeRowState {
  id?: string;
  name?: string;
  bol?: boolean;
  physical?: boolean;
  importHash?: null;
  createdAt?: Date | any;
  updatedAt?: Date | any;
  deletedAt?: null;
  parentId?: string;
  createdById?: string;
  updatedById?: string;
  parent?: branchtypeInterface;
  createdBy?: createdByInterface;
}

export enum BranchtypeListActionTypes {
  BRANCHTYPE_LIST_FETCH_STARTED = 'BRANCHTYPE_LIST_FETCH_STARTED',
  BRANCHTYPE_LIST_FETCH_SUCCESS = 'BRANCHTYPE_LIST_FETCH_SUCCESS',
  BRANCHTYPE_LIST_FETCH_ERROR = 'BRANCHTYPE_LIST_FETCH_ERROR',
  BRANCHTYPE_LIST_DELETE_STARTED = 'BRANCHTYPE_LIST_DELETE_STARTED',
  BRANCHTYPE_LIST_DELETE_SUCCESS = 'BRANCHTYPE_LIST_DELETE_SUCCESS',
  BRANCHTYPE_LIST_DELETE_ERROR = 'BRANCHTYPE_LIST_DELETE_ERROR',
  BRANCHTYPE_LIST_OPEN_CONFIRM = 'BRANCHTYPE_LIST_OPEN_CONFIRM',
  BRANCHTYPE_LIST_CLOSE_CONFIRM = 'BRANCHTYPE_LIST_CLOSE_CONFIRM',
}

interface BranchtypeListFetchStarted {
  type: BranchtypeListActionTypes.BRANCHTYPE_LIST_FETCH_STARTED;
}

interface BranchtypeListFetchSuccess {
  type: BranchtypeListActionTypes.BRANCHTYPE_LIST_FETCH_SUCCESS;
  payload?: {
    rows: {
      [key: string]: branchtypeRowState;
    }[];
    count: number;
  };
}

interface BranchtypeListFetchError {
  type: BranchtypeListActionTypes.BRANCHTYPE_LIST_FETCH_ERROR;
}

interface BranchtypeListDeleteStarted {
  type: BranchtypeListActionTypes.BRANCHTYPE_LIST_DELETE_STARTED;
}

interface BranchtypeListDeleteSuccess {
  type: BranchtypeListActionTypes.BRANCHTYPE_LIST_DELETE_SUCCESS;
}

interface BranchtypeListDeleteError {
  type: BranchtypeListActionTypes.BRANCHTYPE_LIST_DELETE_ERROR;
}

interface BranchtypeListOpenConfirm {
  type: BranchtypeListActionTypes.BRANCHTYPE_LIST_OPEN_CONFIRM;
  payload: {
    id: string;
  };
}

interface BranchtypeListCloseConfirm {
  type: BranchtypeListActionTypes.BRANCHTYPE_LIST_CLOSE_CONFIRM;
}

export type BranchtypeListAction =
  | BranchtypeListFetchStarted
  | BranchtypeListFetchSuccess
  | BranchtypeListFetchError
  | BranchtypeListDeleteStarted
  | BranchtypeListDeleteSuccess
  | BranchtypeListDeleteError
  | BranchtypeListOpenConfirm
  | BranchtypeListCloseConfirm;
