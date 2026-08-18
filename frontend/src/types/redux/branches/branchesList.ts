export interface BranchesListState {
  rows: {
    [key: string]: rowListState;
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
export interface branchTypeInterface {
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
export interface rowListState {
  id?: string;
  name?: string;
  timezone?: null;
  replyToEmail?: null;
  drivetime?: null;
  importHash?: null;
  createdAt?: Date | any;
  updatedAt?: Date | any;
  deletedAt?: null;
  branchTypeId?: string;
  parentId?: null;
  userId?: null;
  createdById?: string;
  updatedById?: string;
  branchType?: branchTypeInterface;
  parent?: null;
  createdBy?: createdByInterface;
  user?: null;
  subordinateIds?: Array<any>;
}

export enum BranchesListActionTypes {
  BRANCHES_LIST_FETCH_STARTED = 'BRANCHES_LIST_FETCH_STARTED',
  BRANCHES_LIST_FETCH_SUCCESS = 'BRANCHES_LIST_FETCH_SUCCESS',
  BRANCHES_LIST_FETCH_ERROR = 'BRANCHES_LIST_FETCH_ERROR',
  BRANCHES_LIST_DELETE_STARTED = 'BRANCHES_LIST_DELETE_STARTED',
  BRANCHES_LIST_DELETE_SUCCESS = 'BRANCHES_LIST_DELETE_SUCCESS',
  BRANCHES_LIST_DELETE_ERROR = 'BRANCHES_LIST_DELETE_ERROR',
  BRANCHES_LIST_OPEN_CONFIRM = 'BRANCHES_LIST_OPEN_CONFIRM',
  BRANCHES_LIST_CLOSE_CONFIRM = 'BRANCHES_LIST_CLOSE_CONFIRM',
}

interface BranchesListFetchStarted {
  type: BranchesListActionTypes.BRANCHES_LIST_FETCH_STARTED;
}

interface BranchesListFetchSuccess {
  type: BranchesListActionTypes.BRANCHES_LIST_FETCH_SUCCESS;
  payload?: {
    rows: {
      [key: string]: rowListState;
    }[];
    count: number;
  };
}

interface BranchesListFetchError {
  type: BranchesListActionTypes.BRANCHES_LIST_FETCH_ERROR;
}

interface BranchesListDeleteStarted {
  type: BranchesListActionTypes.BRANCHES_LIST_DELETE_STARTED;
}

interface BranchesListDeleteSuccess {
  type: BranchesListActionTypes.BRANCHES_LIST_DELETE_SUCCESS;
}

interface BranchesListDeleteError {
  type: BranchesListActionTypes.BRANCHES_LIST_DELETE_ERROR;
}

interface BranchesListOpenConfirm {
  type: BranchesListActionTypes.BRANCHES_LIST_OPEN_CONFIRM;
  payload: {
    id: string;
  };
}

interface BranchesListCloseConfirm {
  type: BranchesListActionTypes.BRANCHES_LIST_CLOSE_CONFIRM;
}

export type BranchesListAction =
  | BranchesListFetchStarted
  | BranchesListFetchSuccess
  | BranchesListFetchError
  | BranchesListDeleteStarted
  | BranchesListDeleteSuccess
  | BranchesListDeleteError
  | BranchesListOpenConfirm
  | BranchesListCloseConfirm;
