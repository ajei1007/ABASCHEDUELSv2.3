
export interface GroupingsListState {
  rows: {
    [key: string]: any;
  }[];
  loading: boolean;
  count: number;
  modalOpen: boolean;
  idToDelete: null | string;
}

export enum GroupingsListActionTypes {
    GROUPINGS_LIST_FETCH_STARTED = "GROUPINGS_LIST_FETCH_STARTED",
      GROUPINGS_LIST_FETCH_SUCCESS = "GROUPINGS_LIST_FETCH_SUCCESS",
        GROUPINGS_LIST_FETCH_ERROR = "GROUPINGS_LIST_FETCH_ERROR",
          GROUPINGS_LIST_DELETE_STARTED = "GROUPINGS_LIST_DELETE_STARTED",
            GROUPINGS_LIST_DELETE_SUCCESS = "GROUPINGS_LIST_DELETE_SUCCESS",
              GROUPINGS_LIST_DELETE_ERROR = "GROUPINGS_LIST_DELETE_ERROR",
                GROUPINGS_LIST_OPEN_CONFIRM = "GROUPINGS_LIST_OPEN_CONFIRM",
                  GROUPINGS_LIST_CLOSE_CONFIRM = "GROUPINGS_LIST_CLOSE_CONFIRM",
}

interface GroupingsListFetchStarted {
  type: GroupingsListActionTypes.GROUPINGS_LIST_FETCH_STARTED;
}

interface GroupingsListFetchSuccess {
  type: GroupingsListActionTypes.GROUPINGS_LIST_FETCH_SUCCESS;
  payload?: {
    rows: {
      [key: string]: any;
    }[];
    count: number
  };
}

interface GroupingsListFetchError {
  type: GroupingsListActionTypes.GROUPINGS_LIST_FETCH_ERROR;
}

interface GroupingsListDeleteStarted {
  type: GroupingsListActionTypes.GROUPINGS_LIST_DELETE_STARTED;
}

interface GroupingsListDeleteSuccess {
  type: GroupingsListActionTypes.GROUPINGS_LIST_DELETE_SUCCESS;
}

interface GroupingsListDeleteError {
  type: GroupingsListActionTypes.GROUPINGS_LIST_DELETE_ERROR;
}

interface GroupingsListOpenConfirm {
  type: GroupingsListActionTypes.GROUPINGS_LIST_OPEN_CONFIRM;
  payload: {
    id: string
  };
}

interface GroupingsListCloseConfirm {
  type: GroupingsListActionTypes.GROUPINGS_LIST_CLOSE_CONFIRM;
}

export type GroupingsListAction =
  GroupingsListFetchStarted
  | GroupingsListFetchSuccess
  | GroupingsListFetchError
  | GroupingsListDeleteStarted
  | GroupingsListDeleteSuccess
  | GroupingsListDeleteError
  | GroupingsListOpenConfirm
  | GroupingsListCloseConfirm
