
export interface SubgroupgroupsListState {
  rows: {
    [key: string]: any;
  }[];
  loading: boolean;
  count: number;
  modalOpen: boolean;
  idToDelete: null | string;
}

export enum SubgroupgroupsListActionTypes {
    SUBGROUPGROUPS_LIST_FETCH_STARTED = "SUBGROUPGROUPS_LIST_FETCH_STARTED",
      SUBGROUPGROUPS_LIST_FETCH_SUCCESS = "SUBGROUPGROUPS_LIST_FETCH_SUCCESS",
        SUBGROUPGROUPS_LIST_FETCH_ERROR = "SUBGROUPGROUPS_LIST_FETCH_ERROR",
          SUBGROUPGROUPS_LIST_DELETE_STARTED = "SUBGROUPGROUPS_LIST_DELETE_STARTED",
            SUBGROUPGROUPS_LIST_DELETE_SUCCESS = "SUBGROUPGROUPS_LIST_DELETE_SUCCESS",
              SUBGROUPGROUPS_LIST_DELETE_ERROR = "SUBGROUPGROUPS_LIST_DELETE_ERROR",
                SUBGROUPGROUPS_LIST_OPEN_CONFIRM = "SUBGROUPGROUPS_LIST_OPEN_CONFIRM",
                  SUBGROUPGROUPS_LIST_CLOSE_CONFIRM = "SUBGROUPGROUPS_LIST_CLOSE_CONFIRM",
}

interface SubgroupgroupsListFetchStarted {
  type: SubgroupgroupsListActionTypes.SUBGROUPGROUPS_LIST_FETCH_STARTED;
}

interface SubgroupgroupsListFetchSuccess {
  type: SubgroupgroupsListActionTypes.SUBGROUPGROUPS_LIST_FETCH_SUCCESS;
  payload?: {
    rows: {
      [key: string]: any;
    }[];
    count: number
  };
}

interface SubgroupgroupsListFetchError {
  type: SubgroupgroupsListActionTypes.SUBGROUPGROUPS_LIST_FETCH_ERROR;
}

interface SubgroupgroupsListDeleteStarted {
  type: SubgroupgroupsListActionTypes.SUBGROUPGROUPS_LIST_DELETE_STARTED;
}

interface SubgroupgroupsListDeleteSuccess {
  type: SubgroupgroupsListActionTypes.SUBGROUPGROUPS_LIST_DELETE_SUCCESS;
}

interface SubgroupgroupsListDeleteError {
  type: SubgroupgroupsListActionTypes.SUBGROUPGROUPS_LIST_DELETE_ERROR;
}

interface SubgroupgroupsListOpenConfirm {
  type: SubgroupgroupsListActionTypes.SUBGROUPGROUPS_LIST_OPEN_CONFIRM;
  payload: {
    id: string
  };
}

interface SubgroupgroupsListCloseConfirm {
  type: SubgroupgroupsListActionTypes.SUBGROUPGROUPS_LIST_CLOSE_CONFIRM;
}

export type SubgroupgroupsListAction =
  SubgroupgroupsListFetchStarted
  | SubgroupgroupsListFetchSuccess
  | SubgroupgroupsListFetchError
  | SubgroupgroupsListDeleteStarted
  | SubgroupgroupsListDeleteSuccess
  | SubgroupgroupsListDeleteError
  | SubgroupgroupsListOpenConfirm
  | SubgroupgroupsListCloseConfirm
