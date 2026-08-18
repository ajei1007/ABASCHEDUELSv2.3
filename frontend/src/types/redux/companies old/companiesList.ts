
export interface CompaniesListState {
  rows: {
    [key: string]: any;
  }[];
  loading: boolean;
  count: number;
  modalOpen: boolean;
  idToDelete: null | string;
}

export enum CompaniesListActionTypes {
    COMPANIES_LIST_FETCH_STARTED = "COMPANIES_LIST_FETCH_STARTED",
      COMPANIES_LIST_FETCH_SUCCESS = "COMPANIES_LIST_FETCH_SUCCESS",
        COMPANIES_LIST_FETCH_ERROR = "COMPANIES_LIST_FETCH_ERROR",
          COMPANIES_LIST_DELETE_STARTED = "COMPANIES_LIST_DELETE_STARTED",
            COMPANIES_LIST_DELETE_SUCCESS = "COMPANIES_LIST_DELETE_SUCCESS",
              COMPANIES_LIST_DELETE_ERROR = "COMPANIES_LIST_DELETE_ERROR",
                COMPANIES_LIST_OPEN_CONFIRM = "COMPANIES_LIST_OPEN_CONFIRM",
                  COMPANIES_LIST_CLOSE_CONFIRM = "COMPANIES_LIST_CLOSE_CONFIRM",
}
interface CompaniesListFetchStarted {
  type: CompaniesListActionTypes.COMPANIES_LIST_FETCH_STARTED;
}

interface CompaniesListFetchSuccess {
  type: CompaniesListActionTypes.COMPANIES_LIST_FETCH_SUCCESS;
  payload?: {
    rows: {
      [key: string]: any;
    }[];
    count: number
  };
}

interface CompaniesListFetchError {
  type: CompaniesListActionTypes.COMPANIES_LIST_FETCH_ERROR;
}

interface CompaniesListDeleteStarted {
  type: CompaniesListActionTypes.COMPANIES_LIST_DELETE_STARTED;
}

interface CompaniesListDeleteSuccess {
  type: CompaniesListActionTypes.COMPANIES_LIST_DELETE_SUCCESS;
}

interface CompaniesListDeleteError {
  type: CompaniesListActionTypes.COMPANIES_LIST_DELETE_ERROR;
}

interface CompaniesListOpenConfirm {
  type: CompaniesListActionTypes.COMPANIES_LIST_OPEN_CONFIRM;
  payload: {
    id: string
  };
}

interface CompaniesListCloseConfirm {
  type: CompaniesListActionTypes.COMPANIES_LIST_CLOSE_CONFIRM;
}

export type CompaniesListAction =
  CompaniesListFetchStarted
  | CompaniesListFetchSuccess
  | CompaniesListFetchError
  | CompaniesListDeleteStarted
  | CompaniesListDeleteSuccess
  | CompaniesListDeleteError
  | CompaniesListOpenConfirm
  | CompaniesListCloseConfirm
