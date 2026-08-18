export interface TimeoffFormState {
  findLoading: boolean;
  saveLoading: boolean;
  record: null | any;
}

export enum TimeoffFormActionTypes {
TIMEOFF_FORM_RESET = "TIMEOFF_FORM_RESET",
  TIMEOFF_FORM_FIND_STARTED = "TIMEOFF_FORM_FIND_STARTED",
    TIMEOFF_FORM_FIND_SUCCESS = "TIMEOFF_FORM_FIND_SUCCESS",
      TIMEOFF_FORM_FIND_ERROR = "TIMEOFF_FORM_FIND_ERROR",
        TIMEOFF_FORM_CREATE_STARTED = "TIMEOFF_FORM_CREATE_STARTED",
          TIMEOFF_FORM_CREATE_SUCCESS = "TIMEOFF_FORM_CREATE_SUCCESS",
            TIMEOFF_FORM_CREATE_ERROR = "TIMEOFF_FORM_CREATE_ERROR",
              TIMEOFF_FORM_UPDATE_STARTED = "TIMEOFF_FORM_UPDATE_STARTED",
                TIMEOFF_FORM_UPDATE_SUCCESS = "TIMEOFF_FORM_UPDATE_SUCCESS",
                  TIMEOFF_FORM_UPDATE_ERROR = "TIMEOFF_FORM_UPDATE_ERROR",
}

interface TimeoffFormReset {
  type: TimeoffFormActionTypes.TIMEOFF_FORM_RESET;
}

interface TimeoffFormFindStarted {
  type: TimeoffFormActionTypes.TIMEOFF_FORM_FIND_STARTED;
}

interface TimeoffFormFindSuccess {
  type: TimeoffFormActionTypes.TIMEOFF_FORM_FIND_SUCCESS;
  payload: any;
}

interface TimeoffFormFindError {
  type: TimeoffFormActionTypes.TIMEOFF_FORM_FIND_ERROR;
}

interface TimeoffFormCreateStarted {
  type: TimeoffFormActionTypes.TIMEOFF_FORM_CREATE_STARTED;
}

interface TimeoffFormCreateSuccess {
  type: TimeoffFormActionTypes.TIMEOFF_FORM_CREATE_SUCCESS;
}

interface TimeoffFormCreateError {
  type: TimeoffFormActionTypes.TIMEOFF_FORM_CREATE_ERROR;
}

interface TimeoffFormUpdateStarted {
  type: TimeoffFormActionTypes.TIMEOFF_FORM_UPDATE_STARTED;
}

interface TimeoffFormUpdateSuccess {
  type: TimeoffFormActionTypes.TIMEOFF_FORM_UPDATE_SUCCESS;
}

interface TimeoffFormUpdateError {
  type: TimeoffFormActionTypes.TIMEOFF_FORM_UPDATE_ERROR;
}

export type TimeoffFormAction =
  TimeoffFormReset
  | TimeoffFormFindStarted
  | TimeoffFormFindSuccess
  | TimeoffFormFindError
  | TimeoffFormCreateStarted
  | TimeoffFormCreateSuccess
  | TimeoffFormCreateError
  | TimeoffFormUpdateStarted
  | TimeoffFormUpdateSuccess
  | TimeoffFormUpdateError
