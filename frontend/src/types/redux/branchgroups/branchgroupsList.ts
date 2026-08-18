
export interface BranchgroupsListState {
  rows: {
    [key: string]: any;
  }[];
  loading: boolean;
  count: number;
  modalOpen: boolean;
  idToDelete: null | string;
}

export enum BranchgroupsListActionTypes {
  BRANCHGROUPS_LIST_FILTERED = "BRANCHGROUPS_LIST_FILTERED",
    BRANCHGROUPS_LIST_FETCH_STARTED = "BRANCHGROUPS_LIST_FETCH_STARTED",
      BRANCHGROUPS_LIST_FETCH_SUCCESS = "BRANCHGROUPS_LIST_FETCH_SUCCESS",
        BRANCHGROUPS_LIST_FETCH_ERROR = "BRANCHGROUPS_LIST_FETCH_ERROR",
          BRANCHGROUPS_LIST_DELETE_STARTED = "BRANCHGROUPS_LIST_DELETE_STARTED",
            BRANCHGROUPS_LIST_DELETE_SUCCESS = "BRANCHGROUPS_LIST_DELETE_SUCCESS",
              BRANCHGROUPS_LIST_DELETE_ERROR = "BRANCHGROUPS_LIST_DELETE_ERROR",
                BRANCHGROUPS_LIST_OPEN_CONFIRM = "BRANCHGROUPS_LIST_OPEN_CONFIRM",
                  BRANCHGROUPS_LIST_CLOSE_CONFIRM = "BRANCHGROUPS_LIST_CLOSE_CONFIRM",
}

interface BranchgroupsListFiltered {
  type: BranchgroupsListActionTypes.BRANCHGROUPS_LIST_FILTERED;
  payload?: {
    rows: {
      [key: string]: any;
    }[];
    count: number
  };
}

interface BranchgroupsListFetchStarted {
  type: BranchgroupsListActionTypes.BRANCHGROUPS_LIST_FETCH_STARTED;
}

interface BranchgroupsListFetchSuccess {
  type: BranchgroupsListActionTypes.BRANCHGROUPS_LIST_FETCH_SUCCESS;
  payload?: {
    rows: {
      [key: string]: any;
    }[];
    count: number
  };
}

interface BranchgroupsListFetchError {
  type: BranchgroupsListActionTypes.BRANCHGROUPS_LIST_FETCH_ERROR;
}

interface BranchgroupsListDeleteStarted {
  type: BranchgroupsListActionTypes.BRANCHGROUPS_LIST_DELETE_STARTED;
}

interface BranchgroupsListDeleteSuccess {
  type: BranchgroupsListActionTypes.BRANCHGROUPS_LIST_DELETE_SUCCESS;
}

interface BranchgroupsListDeleteError {
  type: BranchgroupsListActionTypes.BRANCHGROUPS_LIST_DELETE_ERROR;
}

interface BranchgroupsListOpenConfirm {
  type: BranchgroupsListActionTypes.BRANCHGROUPS_LIST_OPEN_CONFIRM;
  payload: {
    id: string
  };
}

interface BranchgroupsListCloseConfirm {
  type: BranchgroupsListActionTypes.BRANCHGROUPS_LIST_CLOSE_CONFIRM;
}

export type BranchgroupsListAction =
  BranchgroupsListFiltered
  | BranchgroupsListFetchStarted
  | BranchgroupsListFetchSuccess
  | BranchgroupsListFetchError
  | BranchgroupsListDeleteStarted
  | BranchgroupsListDeleteSuccess
  | BranchgroupsListDeleteError
  | BranchgroupsListOpenConfirm
  | BranchgroupsListCloseConfirm
