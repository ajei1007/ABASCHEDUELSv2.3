export interface EventpairFormState {
  findLoading: boolean;
  saveLoading: boolean;
  record: null | any;
}

export enum EventpairFormActionTypes {
EVENTPAIR_FORM_RESET = "EVENTPAIR_FORM_RESET",
  EVENTPAIR_FORM_FIND_STARTED = "EVENTPAIR_FORM_FIND_STARTED",
    EVENTPAIR_FORM_FIND_SUCCESS = "EVENTPAIR_FORM_FIND_SUCCESS",
      EVENTPAIR_FORM_FIND_ERROR = "EVENTPAIR_FORM_FIND_ERROR",
        EVENTPAIR_FORM_CREATE_STARTED = "EVENTPAIR_FORM_CREATE_STARTED",
          EVENTPAIR_FORM_CREATE_SUCCESS = "EVENTPAIR_FORM_CREATE_SUCCESS",
            EVENTPAIR_FORM_CREATE_ERROR = "EVENTPAIR_FORM_CREATE_ERROR",
              EVENTPAIR_FORM_UPDATE_STARTED = "EVENTPAIR_FORM_UPDATE_STARTED",
                EVENTPAIR_FORM_UPDATE_SUCCESS = "EVENTPAIR_FORM_UPDATE_SUCCESS",
                  EVENTPAIR_FORM_UPDATE_ERROR = "EVENTPAIR_FORM_UPDATE_ERROR",
}

interface EventpairFormReset {
  type: EventpairFormActionTypes.EVENTPAIR_FORM_RESET;
}

interface EventpairFormFindStarted {
  type: EventpairFormActionTypes.EVENTPAIR_FORM_FIND_STARTED;
}

interface EventpairFormFindSuccess {
  type: EventpairFormActionTypes.EVENTPAIR_FORM_FIND_SUCCESS;
  payload: any;
}

interface EventpairFormFindError {
  type: EventpairFormActionTypes.EVENTPAIR_FORM_FIND_ERROR;
}

interface EventpairFormCreateStarted {
  type: EventpairFormActionTypes.EVENTPAIR_FORM_CREATE_STARTED;
}

interface EventpairFormCreateSuccess {
  type: EventpairFormActionTypes.EVENTPAIR_FORM_CREATE_SUCCESS;
}

interface EventpairFormCreateError {
  type: EventpairFormActionTypes.EVENTPAIR_FORM_CREATE_ERROR;
}

interface EventpairFormUpdateStarted {
  type: EventpairFormActionTypes.EVENTPAIR_FORM_UPDATE_STARTED;
}

interface EventpairFormUpdateSuccess {
  type: EventpairFormActionTypes.EVENTPAIR_FORM_UPDATE_SUCCESS;
}

interface EventpairFormUpdateError {
  type: EventpairFormActionTypes.EVENTPAIR_FORM_UPDATE_ERROR;
}

export type EventpairFormAction =
  EventpairFormReset
  | EventpairFormFindStarted
  | EventpairFormFindSuccess
  | EventpairFormFindError
  | EventpairFormCreateStarted
  | EventpairFormCreateSuccess
  | EventpairFormCreateError
  | EventpairFormUpdateStarted
  | EventpairFormUpdateSuccess
  | EventpairFormUpdateError
