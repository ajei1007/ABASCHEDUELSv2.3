
export interface RolesListState {
  rows: {
    [key: string]: any;
  }[];
  loading: boolean;
  count: number;
  modalOpen: boolean;
  idToDelete: null | string;
}

export enum RolesListActionTypes {
    ROLES_LIST_FETCH_STARTED = "ROLES_LIST_FETCH_STARTED",
      ROLES_LIST_FETCH_SUCCESS = "ROLES_LIST_FETCH_SUCCESS",
        ROLES_LIST_FETCH_ERROR = "ROLES_LIST_FETCH_ERROR",
          ROLES_LIST_DELETE_STARTED = "ROLES_LIST_DELETE_STARTED",
            ROLES_LIST_DELETE_SUCCESS = "ROLES_LIST_DELETE_SUCCESS",
              ROLES_LIST_DELETE_ERROR = "ROLES_LIST_DELETE_ERROR",
                ROLES_LIST_OPEN_CONFIRM = "ROLES_LIST_OPEN_CONFIRM",
                  ROLES_LIST_CLOSE_CONFIRM = "ROLES_LIST_CLOSE_CONFIRM",
}

interface RolesListFetchStarted {
  type: RolesListActionTypes.ROLES_LIST_FETCH_STARTED;
}

interface RolesListFetchSuccess {
  type: RolesListActionTypes.ROLES_LIST_FETCH_SUCCESS;
  payload?: {
    rows: {
      [key: string]: any;
    }[];
    count: number
  };
}

interface RolesListFetchError {
  type: RolesListActionTypes.ROLES_LIST_FETCH_ERROR;
}

interface RolesListDeleteStarted {
  type: RolesListActionTypes.ROLES_LIST_DELETE_STARTED;
}

interface RolesListDeleteSuccess {
  type: RolesListActionTypes.ROLES_LIST_DELETE_SUCCESS;
}

interface RolesListDeleteError {
  type: RolesListActionTypes.ROLES_LIST_DELETE_ERROR;
}

interface RolesListOpenConfirm {
  type: RolesListActionTypes.ROLES_LIST_OPEN_CONFIRM;
  payload: {
    id: string
  };
}

interface RolesListCloseConfirm {
  type: RolesListActionTypes.ROLES_LIST_CLOSE_CONFIRM;
}

export type RolesListAction =
   RolesListFetchStarted
  | RolesListFetchSuccess
  | RolesListFetchError
  | RolesListDeleteStarted
  | RolesListDeleteSuccess
  | RolesListDeleteError
  | RolesListOpenConfirm
  | RolesListCloseConfirm
