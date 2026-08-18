export interface CompaniesFormState {
  findLoading: boolean;
  saveLoading: boolean;
  record: null | any;
}

export enum CompaniesFormActionTypes {
COMPANIES_FORM_RESET = "COMPANIES_FORM_RESET",
  COMPANIES_FORM_FIND_STARTED = "COMPANIES_FORM_FIND_STARTED",
    COMPANIES_FORM_FIND_SUCCESS = "COMPANIES_FORM_FIND_SUCCESS",
      COMPANIES_FORM_FIND_ERROR = "COMPANIES_FORM_FIND_ERROR",
        COMPANIES_FORM_CREATE_STARTED = "COMPANIES_FORM_CREATE_STARTED",
          COMPANIES_FORM_CREATE_SUCCESS = "COMPANIES_FORM_CREATE_SUCCESS",
            COMPANIES_FORM_CREATE_ERROR = "COMPANIES_FORM_CREATE_ERROR",
              COMPANIES_FORM_UPDATE_STARTED = "COMPANIES_FORM_UPDATE_STARTED",
                COMPANIES_FORM_UPDATE_SUCCESS = "COMPANIES_FORM_UPDATE_SUCCESS",
                  COMPANIES_FORM_UPDATE_ERROR = "COMPANIES_FORM_UPDATE_ERROR",
}

interface CompaniesFormReset {
  type: CompaniesFormActionTypes.COMPANIES_FORM_RESET;
}

interface CompaniesFormFindStarted {
  type: CompaniesFormActionTypes.COMPANIES_FORM_FIND_STARTED;
}

interface CompaniesFormFindSuccess {
  type: CompaniesFormActionTypes.COMPANIES_FORM_FIND_SUCCESS;
  payload: any;
}

interface CompaniesFormFindError {
  type: CompaniesFormActionTypes.COMPANIES_FORM_FIND_ERROR;
}

interface CompaniesFormCreateStarted {
  type: CompaniesFormActionTypes.COMPANIES_FORM_CREATE_STARTED;
}

interface CompaniesFormCreateSuccess {
  type: CompaniesFormActionTypes.COMPANIES_FORM_CREATE_SUCCESS;
}

interface CompaniesFormCreateError {
  type: CompaniesFormActionTypes.COMPANIES_FORM_CREATE_ERROR;
}

interface CompaniesFormUpdateStarted {
  type: CompaniesFormActionTypes.COMPANIES_FORM_UPDATE_STARTED;
}

interface CompaniesFormUpdateSuccess {
  type: CompaniesFormActionTypes.COMPANIES_FORM_UPDATE_SUCCESS;
}

interface CompaniesFormUpdateError {
  type: CompaniesFormActionTypes.COMPANIES_FORM_UPDATE_ERROR;
}

export type CompaniesFormAction =
  CompaniesFormReset
  | CompaniesFormFindStarted
  | CompaniesFormFindSuccess
  | CompaniesFormFindError
  | CompaniesFormCreateStarted
  | CompaniesFormCreateSuccess
  | CompaniesFormCreateError
  | CompaniesFormUpdateStarted
  | CompaniesFormUpdateSuccess
  | CompaniesFormUpdateError
