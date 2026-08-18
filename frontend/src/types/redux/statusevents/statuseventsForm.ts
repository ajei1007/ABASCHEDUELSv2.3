export interface StatuseventsFormState {
  findLoading: boolean;
  saveLoading: boolean;
  record: null | any;
}

export enum StatuseventsFormActionTypes {
STATUSEVENTS_FORM_RESET = "STATUSEVENTS_FORM_RESET",
  STATUSEVENTS_FORM_FIND_STARTED = "STATUSEVENTS_FORM_FIND_STARTED",
    STATUSEVENTS_FORM_FIND_SUCCESS = "STATUSEVENTS_FORM_FIND_SUCCESS",
      STATUSEVENTS_FORM_FIND_ERROR = "STATUSEVENTS_FORM_FIND_ERROR",
        STATUSEVENTS_FORM_CREATE_STARTED = "STATUSEVENTS_FORM_CREATE_STARTED",
          STATUSEVENTS_FORM_CREATE_SUCCESS = "STATUSEVENTS_FORM_CREATE_SUCCESS",
            STATUSEVENTS_FORM_CREATE_ERROR = "STATUSEVENTS_FORM_CREATE_ERROR",
              STATUSEVENTS_FORM_UPDATE_STARTED = "STATUSEVENTS_FORM_UPDATE_STARTED",
                STATUSEVENTS_FORM_UPDATE_SUCCESS = "STATUSEVENTS_FORM_UPDATE_SUCCESS",
                  STATUSEVENTS_FORM_UPDATE_ERROR = "STATUSEVENTS_FORM_UPDATE_ERROR",
}

interface StatuseventsFormReset {
  type: StatuseventsFormActionTypes.STATUSEVENTS_FORM_RESET;
}

interface StatuseventsFormFindStarted {
  type: StatuseventsFormActionTypes.STATUSEVENTS_FORM_FIND_STARTED;
}

interface StatuseventsFormFindSuccess {
  type: StatuseventsFormActionTypes.STATUSEVENTS_FORM_FIND_SUCCESS;
  payload: any;
}

interface StatuseventsFormFindError {
  type: StatuseventsFormActionTypes.STATUSEVENTS_FORM_FIND_ERROR;
}

interface StatuseventsFormCreateStarted {
  type: StatuseventsFormActionTypes.STATUSEVENTS_FORM_CREATE_STARTED;
}

interface StatuseventsFormCreateSuccess {
  type: StatuseventsFormActionTypes.STATUSEVENTS_FORM_CREATE_SUCCESS;
}

interface StatuseventsFormCreateError {
  type: StatuseventsFormActionTypes.STATUSEVENTS_FORM_CREATE_ERROR;
}

interface StatuseventsFormUpdateStarted {
  type: StatuseventsFormActionTypes.STATUSEVENTS_FORM_UPDATE_STARTED;
}

interface StatuseventsFormUpdateSuccess {
  type: StatuseventsFormActionTypes.STATUSEVENTS_FORM_UPDATE_SUCCESS;
}

interface StatuseventsFormUpdateError {
  type: StatuseventsFormActionTypes.STATUSEVENTS_FORM_UPDATE_ERROR;
}

export type StatuseventsFormAction =
  StatuseventsFormReset
  | StatuseventsFormFindStarted
  | StatuseventsFormFindSuccess
  | StatuseventsFormFindError
  | StatuseventsFormCreateStarted
  | StatuseventsFormCreateSuccess
  | StatuseventsFormCreateError
  | StatuseventsFormUpdateStarted
  | StatuseventsFormUpdateSuccess
  | StatuseventsFormUpdateError
