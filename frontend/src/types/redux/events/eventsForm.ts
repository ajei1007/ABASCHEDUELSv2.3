export interface EventsFormState {
  findLoading: boolean;
  saveLoading: boolean;
  record: null | any;
}

export enum EventsFormActionTypes {
EVENTS_FORM_RESET = "EVENTS_FORM_RESET",
  EVENTS_FORM_FIND_STARTED = "EVENTS_FORM_FIND_STARTED",
    EVENTS_FORM_FIND_SUCCESS = "EVENTS_FORM_FIND_SUCCESS",
      EVENTS_FORM_FIND_ERROR = "EVENTS_FORM_FIND_ERROR",
        EVENTS_FORM_CREATE_STARTED = "EVENTS_FORM_CREATE_STARTED",
          EVENTS_FORM_CREATE_SUCCESS = "EVENTS_FORM_CREATE_SUCCESS",
            EVENTS_FORM_CREATE_ERROR = "EVENTS_FORM_CREATE_ERROR",
              EVENTS_FORM_UPDATE_STARTED = "EVENTS_FORM_UPDATE_STARTED",
                EVENTS_FORM_UPDATE_SUCCESS = "EVENTS_FORM_UPDATE_SUCCESS",
                  EVENTS_FORM_UPDATE_ERROR = "EVENTS_FORM_UPDATE_ERROR",
}

interface EventsFormReset {
  type: EventsFormActionTypes.EVENTS_FORM_RESET;
}

interface EventsFormFindStarted {
  type: EventsFormActionTypes.EVENTS_FORM_FIND_STARTED;
}

interface EventsFormFindSuccess {
  type: EventsFormActionTypes.EVENTS_FORM_FIND_SUCCESS;
  payload: any;
}

interface EventsFormFindError {
  type: EventsFormActionTypes.EVENTS_FORM_FIND_ERROR;
}

interface EventsFormCreateStarted {
  type: EventsFormActionTypes.EVENTS_FORM_CREATE_STARTED;
}

interface EventsFormCreateSuccess {
  type: EventsFormActionTypes.EVENTS_FORM_CREATE_SUCCESS;
}

interface EventsFormCreateError {
  type: EventsFormActionTypes.EVENTS_FORM_CREATE_ERROR;
}

interface EventsFormUpdateStarted {
  type: EventsFormActionTypes.EVENTS_FORM_UPDATE_STARTED;
}

interface EventsFormUpdateSuccess {
  type: EventsFormActionTypes.EVENTS_FORM_UPDATE_SUCCESS;
}

interface EventsFormUpdateError {
  type: EventsFormActionTypes.EVENTS_FORM_UPDATE_ERROR;
}

export type EventsFormAction =
  EventsFormReset
  | EventsFormFindStarted
  | EventsFormFindSuccess
  | EventsFormFindError
  | EventsFormCreateStarted
  | EventsFormCreateSuccess
  | EventsFormCreateError
  | EventsFormUpdateStarted
  | EventsFormUpdateSuccess
  | EventsFormUpdateError
