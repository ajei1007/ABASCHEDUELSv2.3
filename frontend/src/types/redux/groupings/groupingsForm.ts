export interface GroupingsFormState {
  findLoading: boolean;
  saveLoading: boolean;
  record: null | any;
}

export enum GroupingsFormActionTypes {
GROUPINGS_FORM_RESET = "GROUPINGS_FORM_RESET",
  GROUPINGS_FORM_FIND_STARTED = "GROUPINGS_FORM_FIND_STARTED",
    GROUPINGS_FORM_FIND_SUCCESS = "GROUPINGS_FORM_FIND_SUCCESS",
      GROUPINGS_FORM_FIND_ERROR = "GROUPINGS_FORM_FIND_ERROR",
        GROUPINGS_FORM_CREATE_STARTED = "GROUPINGS_FORM_CREATE_STARTED",
          GROUPINGS_FORM_CREATE_SUCCESS = "GROUPINGS_FORM_CREATE_SUCCESS",
            GROUPINGS_FORM_CREATE_ERROR = "GROUPINGS_FORM_CREATE_ERROR",
              GROUPINGS_FORM_UPDATE_STARTED = "GROUPINGS_FORM_UPDATE_STARTED",
                GROUPINGS_FORM_UPDATE_SUCCESS = "GROUPINGS_FORM_UPDATE_SUCCESS",
                  GROUPINGS_FORM_UPDATE_ERROR = "GROUPINGS_FORM_UPDATE_ERROR",
}

interface GroupingsFormReset {
  type: GroupingsFormActionTypes.GROUPINGS_FORM_RESET;
}

interface GroupingsFormFindStarted {
  type: GroupingsFormActionTypes.GROUPINGS_FORM_FIND_STARTED;
}

interface GroupingsFormFindSuccess {
  type: GroupingsFormActionTypes.GROUPINGS_FORM_FIND_SUCCESS;
  payload: any;
}

interface GroupingsFormFindError {
  type: GroupingsFormActionTypes.GROUPINGS_FORM_FIND_ERROR;
}

interface GroupingsFormCreateStarted {
  type: GroupingsFormActionTypes.GROUPINGS_FORM_CREATE_STARTED;
}

interface GroupingsFormCreateSuccess {
  type: GroupingsFormActionTypes.GROUPINGS_FORM_CREATE_SUCCESS;
}

interface GroupingsFormCreateError {
  type: GroupingsFormActionTypes.GROUPINGS_FORM_CREATE_ERROR;
}

interface GroupingsFormUpdateStarted {
  type: GroupingsFormActionTypes.GROUPINGS_FORM_UPDATE_STARTED;
}

interface GroupingsFormUpdateSuccess {
  type: GroupingsFormActionTypes.GROUPINGS_FORM_UPDATE_SUCCESS;
}

interface GroupingsFormUpdateError {
  type: GroupingsFormActionTypes.GROUPINGS_FORM_UPDATE_ERROR;
}

export type GroupingsFormAction =
  GroupingsFormReset
  | GroupingsFormFindStarted
  | GroupingsFormFindSuccess
  | GroupingsFormFindError
  | GroupingsFormCreateStarted
  | GroupingsFormCreateSuccess
  | GroupingsFormCreateError
  | GroupingsFormUpdateStarted
  | GroupingsFormUpdateSuccess
  | GroupingsFormUpdateError
