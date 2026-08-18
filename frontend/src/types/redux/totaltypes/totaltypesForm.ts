export interface TotaltypesFormState {
  findLoading: boolean;
  saveLoading: boolean;
  record: null | any;
}

export enum TotaltypesFormActionTypes {
TOTALTYPES_FORM_RESET = "TOTALTYPES_FORM_RESET",
  TOTALTYPES_FORM_FIND_STARTED = "TOTALTYPES_FORM_FIND_STARTED",
    TOTALTYPES_FORM_FIND_SUCCESS = "TOTALTYPES_FORM_FIND_SUCCESS",
      TOTALTYPES_FORM_FIND_ERROR = "TOTALTYPES_FORM_FIND_ERROR",
        TOTALTYPES_FORM_CREATE_STARTED = "TOTALTYPES_FORM_CREATE_STARTED",
          TOTALTYPES_FORM_CREATE_SUCCESS = "TOTALTYPES_FORM_CREATE_SUCCESS",
            TOTALTYPES_FORM_CREATE_ERROR = "TOTALTYPES_FORM_CREATE_ERROR",
              TOTALTYPES_FORM_UPDATE_STARTED = "TOTALTYPES_FORM_UPDATE_STARTED",
                TOTALTYPES_FORM_UPDATE_SUCCESS = "TOTALTYPES_FORM_UPDATE_SUCCESS",
                  TOTALTYPES_FORM_UPDATE_ERROR = "TOTALTYPES_FORM_UPDATE_ERROR",
}

interface TotaltypesFormReset {
  type: TotaltypesFormActionTypes.TOTALTYPES_FORM_RESET;
}

interface TotaltypesFormFindStarted {
  type: TotaltypesFormActionTypes.TOTALTYPES_FORM_FIND_STARTED;
}

interface TotaltypesFormFindSuccess {
  type: TotaltypesFormActionTypes.TOTALTYPES_FORM_FIND_SUCCESS;
  payload: any;
}

interface TotaltypesFormFindError {
  type: TotaltypesFormActionTypes.TOTALTYPES_FORM_FIND_ERROR;
}

interface TotaltypesFormCreateStarted {
  type: TotaltypesFormActionTypes.TOTALTYPES_FORM_CREATE_STARTED;
}

interface TotaltypesFormCreateSuccess {
  type: TotaltypesFormActionTypes.TOTALTYPES_FORM_CREATE_SUCCESS;
}

interface TotaltypesFormCreateError {
  type: TotaltypesFormActionTypes.TOTALTYPES_FORM_CREATE_ERROR;
}

interface TotaltypesFormUpdateStarted {
  type: TotaltypesFormActionTypes.TOTALTYPES_FORM_UPDATE_STARTED;
}

interface TotaltypesFormUpdateSuccess {
  type: TotaltypesFormActionTypes.TOTALTYPES_FORM_UPDATE_SUCCESS;
}

interface TotaltypesFormUpdateError {
  type: TotaltypesFormActionTypes.TOTALTYPES_FORM_UPDATE_ERROR;
}

export type TotaltypesFormAction =
  TotaltypesFormReset
  | TotaltypesFormFindStarted
  | TotaltypesFormFindSuccess
  | TotaltypesFormFindError
  | TotaltypesFormCreateStarted
  | TotaltypesFormCreateSuccess
  | TotaltypesFormCreateError
  | TotaltypesFormUpdateStarted
  | TotaltypesFormUpdateSuccess
  | TotaltypesFormUpdateError
