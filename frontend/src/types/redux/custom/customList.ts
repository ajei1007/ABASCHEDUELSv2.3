export interface CustomListState {
  rows: {
    [key: string]: any;
  }[];
  loading: boolean;
  count: number;
  modalOpen: boolean;
  idToDelete: null | string;
}

export enum CustomListActionTypes {
  CUSTOM_LIST_FILTERED = 'CUSTOM_LIST_FILTERED',
  CUSTOM_LIST_FETCH_STARTED = 'CUSTOM_LIST_FETCH_STARTED',
  CUSTOM_LIST_FETCH_SUCCESS = 'CUSTOM_LIST_FETCH_SUCCESS',
  CUSTOM_LIST_FETCH_ERROR = 'CUSTOM_LIST_FETCH_ERROR',
  CUSTOM_LIST_DELETE_STARTED = 'CUSTOM_LIST_DELETE_STARTED',
  CUSTOM_LIST_DELETE_SUCCESS = 'CUSTOM_LIST_DELETE_SUCCESS',
  CUSTOM_LIST_DELETE_ERROR = 'CUSTOM_LIST_DELETE_ERROR',
  CUSTOM_LIST_OPEN_CONFIRM = 'CUSTOM_LIST_OPEN_CONFIRM',
  CUSTOM_LIST_CLOSE_CONFIRM = 'CUSTOM_LIST_CLOSE_CONFIRM',
}

interface CustomListFiltered {
  type: CustomListActionTypes.CUSTOM_LIST_FILTERED;
  payload?: {
    rows: {
      [key: string]: any;
    }[];
    count: number;
  };
}

interface CustomListFetchStarted {
  type: CustomListActionTypes.CUSTOM_LIST_FETCH_STARTED;
}

interface CustomListFetchSuccess {
  type: CustomListActionTypes.CUSTOM_LIST_FETCH_SUCCESS;
  payload?: {
    rows: {
      [key: string]: any;
    }[];
    count: number;
  };
}

interface CustomListFetchError {
  type: CustomListActionTypes.CUSTOM_LIST_FETCH_ERROR;
}

interface CustomListDeleteStarted {
  type: CustomListActionTypes.CUSTOM_LIST_DELETE_STARTED;
}

interface CustomListDeleteSuccess {
  type: CustomListActionTypes.CUSTOM_LIST_DELETE_SUCCESS;
}

interface CustomListDeleteError {
  type: CustomListActionTypes.CUSTOM_LIST_DELETE_ERROR;
}

interface CustomListOpenConfirm {
  type: CustomListActionTypes.CUSTOM_LIST_OPEN_CONFIRM;
  payload: {
    id: string;
  };
}

interface CustomListCloseConfirm {
  type: CustomListActionTypes.CUSTOM_LIST_CLOSE_CONFIRM;
}

export type CustomListAction =
  | CustomListFiltered
  | CustomListFetchStarted
  | CustomListFetchSuccess
  | CustomListFetchError
  | CustomListDeleteStarted
  | CustomListDeleteSuccess
  | CustomListDeleteError
  | CustomListOpenConfirm
  | CustomListCloseConfirm;
