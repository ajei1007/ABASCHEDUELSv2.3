export interface RolesFormState {
  findLoading: boolean;
  saveLoading: boolean;
  record: null | any;
}

export enum RolesFormActionTypes {
ROLES_FORM_RESET = "ROLES_FORM_RESET",
  ROLES_FORM_FIND_STARTED = "ROLES_FORM_FIND_STARTED",
    ROLES_FORM_FIND_SUCCESS = "ROLES_FORM_FIND_SUCCESS",
      ROLES_FORM_FIND_ERROR = "ROLES_FORM_FIND_ERROR",
        ROLES_FORM_CREATE_STARTED = "ROLES_FORM_CREATE_STARTED",
          ROLES_FORM_CREATE_SUCCESS = "ROLES_FORM_CREATE_SUCCESS",
            ROLES_FORM_CREATE_ERROR = "ROLES_FORM_CREATE_ERROR",
              ROLES_FORM_UPDATE_STARTED = "ROLES_FORM_UPDATE_STARTED",
                ROLES_FORM_UPDATE_SUCCESS = "ROLES_FORM_UPDATE_SUCCESS",
                  ROLES_FORM_UPDATE_ERROR = "ROLES_FORM_UPDATE_ERROR",
}

interface RolesFormReset {
  type: RolesFormActionTypes.ROLES_FORM_RESET;
}

interface RolesFormFindStarted {
  type: RolesFormActionTypes.ROLES_FORM_FIND_STARTED;
}

interface RolesFormFindSuccess {
  type: RolesFormActionTypes.ROLES_FORM_FIND_SUCCESS;
  payload: any;
}

interface RolesFormFindError {
  type: RolesFormActionTypes.ROLES_FORM_FIND_ERROR;
}

interface RolesFormCreateStarted {
  type: RolesFormActionTypes.ROLES_FORM_CREATE_STARTED;
}

interface RolesFormCreateSuccess {
  type: RolesFormActionTypes.ROLES_FORM_CREATE_SUCCESS;
}

interface RolesFormCreateError {
  type: RolesFormActionTypes.ROLES_FORM_CREATE_ERROR;
}

interface RolesFormUpdateStarted {
  type: RolesFormActionTypes.ROLES_FORM_UPDATE_STARTED;
}

interface RolesFormUpdateSuccess {
  type: RolesFormActionTypes.ROLES_FORM_UPDATE_SUCCESS;
}

interface RolesFormUpdateError {
  type: RolesFormActionTypes.ROLES_FORM_UPDATE_ERROR;
}

export type RolesFormAction =
  RolesFormReset
  | RolesFormFindStarted
  | RolesFormFindSuccess
  | RolesFormFindError
  | RolesFormCreateStarted
  | RolesFormCreateSuccess
  | RolesFormCreateError
  | RolesFormUpdateStarted
  | RolesFormUpdateSuccess
  | RolesFormUpdateError
