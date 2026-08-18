export interface PrioritiesFormState {
  findLoading: boolean;
  saveLoading: boolean;
  record: null | any;
}

export enum PrioritiesFormActionTypes {
PRIORITIES_FORM_RESET = "PRIORITIES_FORM_RESET",
  PRIORITIES_FORM_FIND_STARTED = "PRIORITIES_FORM_FIND_STARTED",
    PRIORITIES_FORM_FIND_SUCCESS = "PRIORITIES_FORM_FIND_SUCCESS",
      PRIORITIES_FORM_FIND_ERROR = "PRIORITIES_FORM_FIND_ERROR",
        PRIORITIES_FORM_CREATE_STARTED = "PRIORITIES_FORM_CREATE_STARTED",
          PRIORITIES_FORM_CREATE_SUCCESS = "PRIORITIES_FORM_CREATE_SUCCESS",
            PRIORITIES_FORM_CREATE_ERROR = "PRIORITIES_FORM_CREATE_ERROR",
              PRIORITIES_FORM_UPDATE_STARTED = "PRIORITIES_FORM_UPDATE_STARTED",
                PRIORITIES_FORM_UPDATE_SUCCESS = "PRIORITIES_FORM_UPDATE_SUCCESS",
                  PRIORITIES_FORM_UPDATE_ERROR = "PRIORITIES_FORM_UPDATE_ERROR",
}

interface PrioritiesFormReset {
  type: PrioritiesFormActionTypes.PRIORITIES_FORM_RESET;
}

interface PrioritiesFormFindStarted {
  type: PrioritiesFormActionTypes.PRIORITIES_FORM_FIND_STARTED;
}

interface PrioritiesFormFindSuccess {
  type: PrioritiesFormActionTypes.PRIORITIES_FORM_FIND_SUCCESS;
  payload: any;
}

interface PrioritiesFormFindError {
  type: PrioritiesFormActionTypes.PRIORITIES_FORM_FIND_ERROR;
}

interface PrioritiesFormCreateStarted {
  type: PrioritiesFormActionTypes.PRIORITIES_FORM_CREATE_STARTED;
}

interface PrioritiesFormCreateSuccess {
  type: PrioritiesFormActionTypes.PRIORITIES_FORM_CREATE_SUCCESS;
}

interface PrioritiesFormCreateError {
  type: PrioritiesFormActionTypes.PRIORITIES_FORM_CREATE_ERROR;
}

interface PrioritiesFormUpdateStarted {
  type: PrioritiesFormActionTypes.PRIORITIES_FORM_UPDATE_STARTED;
}

interface PrioritiesFormUpdateSuccess {
  type: PrioritiesFormActionTypes.PRIORITIES_FORM_UPDATE_SUCCESS;
}

interface PrioritiesFormUpdateError {
  type: PrioritiesFormActionTypes.PRIORITIES_FORM_UPDATE_ERROR;
}

export type PrioritiesFormAction =
  PrioritiesFormReset
  | PrioritiesFormFindStarted
  | PrioritiesFormFindSuccess
  | PrioritiesFormFindError
  | PrioritiesFormCreateStarted
  | PrioritiesFormCreateSuccess
  | PrioritiesFormCreateError
  | PrioritiesFormUpdateStarted
  | PrioritiesFormUpdateSuccess
  | PrioritiesFormUpdateError
