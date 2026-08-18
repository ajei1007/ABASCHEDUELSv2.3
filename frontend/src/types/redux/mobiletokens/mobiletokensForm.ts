export interface MobiletokensFormState {
  findLoading: boolean;
  saveLoading: boolean;
  record: null | any;
}

export enum MobiletokensFormActionTypes {
MOBILETOKENS_FORM_RESET = "MOBILETOKENS_FORM_RESET",
  MOBILETOKENS_FORM_FIND_STARTED = "MOBILETOKENS_FORM_FIND_STARTED",
    MOBILETOKENS_FORM_FIND_SUCCESS = "MOBILETOKENS_FORM_FIND_SUCCESS",
      MOBILETOKENS_FORM_FIND_ERROR = "MOBILETOKENS_FORM_FIND_ERROR",
        MOBILETOKENS_FORM_CREATE_STARTED = "MOBILETOKENS_FORM_CREATE_STARTED",
          MOBILETOKENS_FORM_CREATE_SUCCESS = "MOBILETOKENS_FORM_CREATE_SUCCESS",
            MOBILETOKENS_FORM_CREATE_ERROR = "MOBILETOKENS_FORM_CREATE_ERROR",
              MOBILETOKENS_FORM_UPDATE_STARTED = "MOBILETOKENS_FORM_UPDATE_STARTED",
                MOBILETOKENS_FORM_UPDATE_SUCCESS = "MOBILETOKENS_FORM_UPDATE_SUCCESS",
                  MOBILETOKENS_FORM_UPDATE_ERROR = "MOBILETOKENS_FORM_UPDATE_ERROR",
}

interface MobiletokensFormReset {
  type: MobiletokensFormActionTypes.MOBILETOKENS_FORM_RESET;
}

interface MobiletokensFormFindStarted {
  type: MobiletokensFormActionTypes.MOBILETOKENS_FORM_FIND_STARTED;
}

interface MobiletokensFormFindSuccess {
  type: MobiletokensFormActionTypes.MOBILETOKENS_FORM_FIND_SUCCESS;
  payload: any;
}

interface MobiletokensFormFindError {
  type: MobiletokensFormActionTypes.MOBILETOKENS_FORM_FIND_ERROR;
}

interface MobiletokensFormCreateStarted {
  type: MobiletokensFormActionTypes.MOBILETOKENS_FORM_CREATE_STARTED;
}

interface MobiletokensFormCreateSuccess {
  type: MobiletokensFormActionTypes.MOBILETOKENS_FORM_CREATE_SUCCESS;
}

interface MobiletokensFormCreateError {
  type: MobiletokensFormActionTypes.MOBILETOKENS_FORM_CREATE_ERROR;
}

interface MobiletokensFormUpdateStarted {
  type: MobiletokensFormActionTypes.MOBILETOKENS_FORM_UPDATE_STARTED;
}

interface MobiletokensFormUpdateSuccess {
  type: MobiletokensFormActionTypes.MOBILETOKENS_FORM_UPDATE_SUCCESS;
}

interface MobiletokensFormUpdateError {
  type: MobiletokensFormActionTypes.MOBILETOKENS_FORM_UPDATE_ERROR;
}

export type MobiletokensFormAction =
  MobiletokensFormReset
  | MobiletokensFormFindStarted
  | MobiletokensFormFindSuccess
  | MobiletokensFormFindError
  | MobiletokensFormCreateStarted
  | MobiletokensFormCreateSuccess
  | MobiletokensFormCreateError
  | MobiletokensFormUpdateStarted
  | MobiletokensFormUpdateSuccess
  | MobiletokensFormUpdateError
