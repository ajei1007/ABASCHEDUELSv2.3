export interface UsersFormState {
  findLoading: boolean;
  saveLoading: boolean;
  record: null | any;
}

export enum UsersFormActionTypes {
USERS_FORM_RESET = "USERS_FORM_RESET",
  USERS_FORM_FIND_STARTED = "USERS_FORM_FIND_STARTED",
    USERS_FORM_FIND_SUCCESS = "USERS_FORM_FIND_SUCCESS",
      USERS_FORM_FIND_ERROR = "USERS_FORM_FIND_ERROR",
        USERS_FORM_CREATE_STARTED = "USERS_FORM_CREATE_STARTED",
          USERS_FORM_CREATE_SUCCESS = "USERS_FORM_CREATE_SUCCESS",
            USERS_FORM_CREATE_ERROR = "USERS_FORM_CREATE_ERROR",
              USERS_FORM_UPDATE_STARTED = "USERS_FORM_UPDATE_STARTED",
                USERS_FORM_UPDATE_SUCCESS = "USERS_FORM_UPDATE_SUCCESS",
                  USERS_FORM_UPDATE_ERROR = "USERS_FORM_UPDATE_ERROR",
}

interface UsersFormReset {
  type: UsersFormActionTypes.USERS_FORM_RESET;
}

interface UsersFormFindStarted {
  type: UsersFormActionTypes.USERS_FORM_FIND_STARTED;
}

interface UsersFormFindSuccess {
  type: UsersFormActionTypes.USERS_FORM_FIND_SUCCESS;
  payload: any;
}

interface UsersFormFindError {
  type: UsersFormActionTypes.USERS_FORM_FIND_ERROR;
}

interface UsersFormCreateStarted {
  type: UsersFormActionTypes.USERS_FORM_CREATE_STARTED;
}

interface UsersFormCreateSuccess {
  type: UsersFormActionTypes.USERS_FORM_CREATE_SUCCESS;
}

interface UsersFormCreateError {
  type: UsersFormActionTypes.USERS_FORM_CREATE_ERROR;
}

interface UsersFormUpdateStarted {
  type: UsersFormActionTypes.USERS_FORM_UPDATE_STARTED;
}

interface UsersFormUpdateSuccess {
  type: UsersFormActionTypes.USERS_FORM_UPDATE_SUCCESS;
}

interface UsersFormUpdateError {
  type: UsersFormActionTypes.USERS_FORM_UPDATE_ERROR;
}

export type UsersFormAction =
  UsersFormReset
  | UsersFormFindStarted
  | UsersFormFindSuccess
  | UsersFormFindError
  | UsersFormCreateStarted
  | UsersFormCreateSuccess
  | UsersFormCreateError
  | UsersFormUpdateStarted
  | UsersFormUpdateSuccess
  | UsersFormUpdateError
