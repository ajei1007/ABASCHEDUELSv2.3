
export interface SubgroupsListState {
  rows: {
    [key: string]: any;
  }[];
  loading: boolean;
  count: number;
  modalOpen: boolean;
  idToDelete: null | string;
}

export enum SubgroupsListActionTypes {
  SUBGROUPS_LIST_FILTERED = "SUBGROUPS_LIST_FILTERED",
    SUBGROUPS_LIST_FETCH_STARTED = "SUBGROUPS_LIST_FETCH_STARTED",
      SUBGROUPS_LIST_FETCH_SUCCESS = "SUBGROUPS_LIST_FETCH_SUCCESS",
        SUBGROUPS_LIST_FETCH_ERROR = "SUBGROUPS_LIST_FETCH_ERROR",
          SUBGROUPS_LIST_DELETE_STARTED = "SUBGROUPS_LIST_DELETE_STARTED",
            SUBGROUPS_LIST_DELETE_SUCCESS = "SUBGROUPS_LIST_DELETE_SUCCESS",
              SUBGROUPS_LIST_DELETE_ERROR = "SUBGROUPS_LIST_DELETE_ERROR",
                SUBGROUPS_LIST_OPEN_CONFIRM = "SUBGROUPS_LIST_OPEN_CONFIRM",
                  SUBGROUPS_LIST_CLOSE_CONFIRM = "SUBGROUPS_LIST_CLOSE_CONFIRM",
}

interface SubgroupsListFiltered {
  type: SubgroupsListActionTypes.SUBGROUPS_LIST_FILTERED;
  payload?: {
    rows: {
      [key: string]: any;
    }[];
    count: number
  };
}

interface SubgroupsListFetchStarted {
  type: SubgroupsListActionTypes.SUBGROUPS_LIST_FETCH_STARTED;
}

interface SubgroupsListFetchSuccess {
  type: SubgroupsListActionTypes.SUBGROUPS_LIST_FETCH_SUCCESS;
  payload?: {
    rows: {
      [key: string]: any;
    }[];
    count: number
  };
}

interface SubgroupsListFetchError {
  type: SubgroupsListActionTypes.SUBGROUPS_LIST_FETCH_ERROR;
}

interface SubgroupsListDeleteStarted {
  type: SubgroupsListActionTypes.SUBGROUPS_LIST_DELETE_STARTED;
}

interface SubgroupsListDeleteSuccess {
  type: SubgroupsListActionTypes.SUBGROUPS_LIST_DELETE_SUCCESS;
}

interface SubgroupsListDeleteError {
  type: SubgroupsListActionTypes.SUBGROUPS_LIST_DELETE_ERROR;
}

interface SubgroupsListOpenConfirm {
  type: SubgroupsListActionTypes.SUBGROUPS_LIST_OPEN_CONFIRM;
  payload: {
    id: string
  };
}

interface SubgroupsListCloseConfirm {
  type: SubgroupsListActionTypes.SUBGROUPS_LIST_CLOSE_CONFIRM;
}

export type SubgroupsListAction =
  SubgroupsListFiltered
  | SubgroupsListFetchStarted
  | SubgroupsListFetchSuccess
  | SubgroupsListFetchError
  | SubgroupsListDeleteStarted
  | SubgroupsListDeleteSuccess
  | SubgroupsListDeleteError
  | SubgroupsListOpenConfirm
  | SubgroupsListCloseConfirm
