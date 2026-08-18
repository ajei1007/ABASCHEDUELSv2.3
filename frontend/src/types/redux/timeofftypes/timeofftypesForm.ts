export interface TimeofftypesFormState {
  findLoading: boolean;
  saveLoading: boolean;
  record: null | any;
}

export enum TimeofftypesFormActionTypes {
TIMEOFFTYPES_FORM_RESET = "TIMEOFFTYPES_FORM_RESET",
  TIMEOFFTYPES_FORM_FIND_STARTED = "TIMEOFFTYPES_FORM_FIND_STARTED",
    TIMEOFFTYPES_FORM_FIND_SUCCESS = "TIMEOFFTYPES_FORM_FIND_SUCCESS",
      TIMEOFFTYPES_FORM_FIND_ERROR = "TIMEOFFTYPES_FORM_FIND_ERROR",
        TIMEOFFTYPES_FORM_CREATE_STARTED = "TIMEOFFTYPES_FORM_CREATE_STARTED",
          TIMEOFFTYPES_FORM_CREATE_SUCCESS = "TIMEOFFTYPES_FORM_CREATE_SUCCESS",
            TIMEOFFTYPES_FORM_CREATE_ERROR = "TIMEOFFTYPES_FORM_CREATE_ERROR",
              TIMEOFFTYPES_FORM_UPDATE_STARTED = "TIMEOFFTYPES_FORM_UPDATE_STARTED",
                TIMEOFFTYPES_FORM_UPDATE_SUCCESS = "TIMEOFFTYPES_FORM_UPDATE_SUCCESS",
                  TIMEOFFTYPES_FORM_UPDATE_ERROR = "TIMEOFFTYPES_FORM_UPDATE_ERROR",
}

interface TimeofftypesFormReset {
  type: TimeofftypesFormActionTypes.TIMEOFFTYPES_FORM_RESET;
}

interface TimeofftypesFormFindStarted {
  type: TimeofftypesFormActionTypes.TIMEOFFTYPES_FORM_FIND_STARTED;
}

interface TimeofftypesFormFindSuccess {
  type: TimeofftypesFormActionTypes.TIMEOFFTYPES_FORM_FIND_SUCCESS;
  payload: any;
}

interface TimeofftypesFormFindError {
  type: TimeofftypesFormActionTypes.TIMEOFFTYPES_FORM_FIND_ERROR;
}

interface TimeofftypesFormCreateStarted {
  type: TimeofftypesFormActionTypes.TIMEOFFTYPES_FORM_CREATE_STARTED;
}

interface TimeofftypesFormCreateSuccess {
  type: TimeofftypesFormActionTypes.TIMEOFFTYPES_FORM_CREATE_SUCCESS;
}

interface TimeofftypesFormCreateError {
  type: TimeofftypesFormActionTypes.TIMEOFFTYPES_FORM_CREATE_ERROR;
}

interface TimeofftypesFormUpdateStarted {
  type: TimeofftypesFormActionTypes.TIMEOFFTYPES_FORM_UPDATE_STARTED;
}

interface TimeofftypesFormUpdateSuccess {
  type: TimeofftypesFormActionTypes.TIMEOFFTYPES_FORM_UPDATE_SUCCESS;
}

interface TimeofftypesFormUpdateError {
  type: TimeofftypesFormActionTypes.TIMEOFFTYPES_FORM_UPDATE_ERROR;
}

export type TimeofftypesFormAction =
  TimeofftypesFormReset
  | TimeofftypesFormFindStarted
  | TimeofftypesFormFindSuccess
  | TimeofftypesFormFindError
  | TimeofftypesFormCreateStarted
  | TimeofftypesFormCreateSuccess
  | TimeofftypesFormCreateError
  | TimeofftypesFormUpdateStarted
  | TimeofftypesFormUpdateSuccess
  | TimeofftypesFormUpdateError
