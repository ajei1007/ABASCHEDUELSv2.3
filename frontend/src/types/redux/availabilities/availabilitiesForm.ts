export interface AvailabilitiesFormState {
  findLoading: boolean;
  saveLoading: boolean;
  record: null | any;
}

export enum AvailabilitiesFormActionTypes {
AVAILABILITIES_FORM_RESET = "AVAILABILITIES_FORM_RESET",
  AVAILABILITIES_FORM_FIND_STARTED = "AVAILABILITIES_FORM_FIND_STARTED",
    AVAILABILITIES_FORM_FIND_SUCCESS = "AVAILABILITIES_FORM_FIND_SUCCESS",
      AVAILABILITIES_FORM_FIND_ERROR = "AVAILABILITIES_FORM_FIND_ERROR",
        AVAILABILITIES_FORM_CREATE_STARTED = "AVAILABILITIES_FORM_CREATE_STARTED",
          AVAILABILITIES_FORM_CREATE_SUCCESS = "AVAILABILITIES_FORM_CREATE_SUCCESS",
            AVAILABILITIES_FORM_CREATE_ERROR = "AVAILABILITIES_FORM_CREATE_ERROR",
              AVAILABILITIES_FORM_UPDATE_STARTED = "AVAILABILITIES_FORM_UPDATE_STARTED",
                AVAILABILITIES_FORM_UPDATE_SUCCESS = "AVAILABILITIES_FORM_UPDATE_SUCCESS",
                  AVAILABILITIES_FORM_UPDATE_ERROR = "AVAILABILITIES_FORM_UPDATE_ERROR",
}

interface AvailabilitiesFormReset {
  type: AvailabilitiesFormActionTypes.AVAILABILITIES_FORM_RESET;
}

interface AvailabilitiesFormFindStarted {
  type: AvailabilitiesFormActionTypes.AVAILABILITIES_FORM_FIND_STARTED;
}

interface AvailabilitiesFormFindSuccess {
  type: AvailabilitiesFormActionTypes.AVAILABILITIES_FORM_FIND_SUCCESS;
  payload: any;
}

interface AvailabilitiesFormFindError {
  type: AvailabilitiesFormActionTypes.AVAILABILITIES_FORM_FIND_ERROR;
}

interface AvailabilitiesFormCreateStarted {
  type: AvailabilitiesFormActionTypes.AVAILABILITIES_FORM_CREATE_STARTED;
}

interface AvailabilitiesFormCreateSuccess {
  type: AvailabilitiesFormActionTypes.AVAILABILITIES_FORM_CREATE_SUCCESS;
}

interface AvailabilitiesFormCreateError {
  type: AvailabilitiesFormActionTypes.AVAILABILITIES_FORM_CREATE_ERROR;
}

interface AvailabilitiesFormUpdateStarted {
  type: AvailabilitiesFormActionTypes.AVAILABILITIES_FORM_UPDATE_STARTED;
}

interface AvailabilitiesFormUpdateSuccess {
  type: AvailabilitiesFormActionTypes.AVAILABILITIES_FORM_UPDATE_SUCCESS;
}

interface AvailabilitiesFormUpdateError {
  type: AvailabilitiesFormActionTypes.AVAILABILITIES_FORM_UPDATE_ERROR;
}

export type AvailabilitiesFormAction =
  AvailabilitiesFormReset
  | AvailabilitiesFormFindStarted
  | AvailabilitiesFormFindSuccess
  | AvailabilitiesFormFindError
  | AvailabilitiesFormCreateStarted
  | AvailabilitiesFormCreateSuccess
  | AvailabilitiesFormCreateError
  | AvailabilitiesFormUpdateStarted
  | AvailabilitiesFormUpdateSuccess
  | AvailabilitiesFormUpdateError
