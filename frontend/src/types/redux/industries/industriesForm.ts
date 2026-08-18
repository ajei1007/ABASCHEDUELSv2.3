export interface IndustriesFormState {
  findLoading: boolean;
  saveLoading: boolean;
  record: null | any;
}

export enum IndustriesFormActionTypes {
INDUSTRIES_FORM_RESET = "INDUSTRIES_FORM_RESET",
  INDUSTRIES_FORM_FIND_STARTED = "INDUSTRIES_FORM_FIND_STARTED",
    INDUSTRIES_FORM_FIND_SUCCESS = "INDUSTRIES_FORM_FIND_SUCCESS",
      INDUSTRIES_FORM_FIND_ERROR = "INDUSTRIES_FORM_FIND_ERROR",
        INDUSTRIES_FORM_CREATE_STARTED = "INDUSTRIES_FORM_CREATE_STARTED",
          INDUSTRIES_FORM_CREATE_SUCCESS = "INDUSTRIES_FORM_CREATE_SUCCESS",
            INDUSTRIES_FORM_CREATE_ERROR = "INDUSTRIES_FORM_CREATE_ERROR",
              INDUSTRIES_FORM_UPDATE_STARTED = "INDUSTRIES_FORM_UPDATE_STARTED",
                INDUSTRIES_FORM_UPDATE_SUCCESS = "INDUSTRIES_FORM_UPDATE_SUCCESS",
                  INDUSTRIES_FORM_UPDATE_ERROR = "INDUSTRIES_FORM_UPDATE_ERROR",
}

interface IndustriesFormReset {
  type: IndustriesFormActionTypes.INDUSTRIES_FORM_RESET;
}

interface IndustriesFormFindStarted {
  type: IndustriesFormActionTypes.INDUSTRIES_FORM_FIND_STARTED;
}

interface IndustriesFormFindSuccess {
  type: IndustriesFormActionTypes.INDUSTRIES_FORM_FIND_SUCCESS;
  payload: any;
}

interface IndustriesFormFindError {
  type: IndustriesFormActionTypes.INDUSTRIES_FORM_FIND_ERROR;
}

interface IndustriesFormCreateStarted {
  type: IndustriesFormActionTypes.INDUSTRIES_FORM_CREATE_STARTED;
}

interface IndustriesFormCreateSuccess {
  type: IndustriesFormActionTypes.INDUSTRIES_FORM_CREATE_SUCCESS;
}

interface IndustriesFormCreateError {
  type: IndustriesFormActionTypes.INDUSTRIES_FORM_CREATE_ERROR;
}

interface IndustriesFormUpdateStarted {
  type: IndustriesFormActionTypes.INDUSTRIES_FORM_UPDATE_STARTED;
}

interface IndustriesFormUpdateSuccess {
  type: IndustriesFormActionTypes.INDUSTRIES_FORM_UPDATE_SUCCESS;
}

interface IndustriesFormUpdateError {
  type: IndustriesFormActionTypes.INDUSTRIES_FORM_UPDATE_ERROR;
}

export type IndustriesFormAction =
  IndustriesFormReset
  | IndustriesFormFindStarted
  | IndustriesFormFindSuccess
  | IndustriesFormFindError
  | IndustriesFormCreateStarted
  | IndustriesFormCreateSuccess
  | IndustriesFormCreateError
  | IndustriesFormUpdateStarted
  | IndustriesFormUpdateSuccess
  | IndustriesFormUpdateError
