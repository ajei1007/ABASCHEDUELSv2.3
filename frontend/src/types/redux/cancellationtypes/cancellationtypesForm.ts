export interface CancellationtypesFormState {
  findLoading: boolean;
  saveLoading: boolean;
  record: null | any;
}
export interface CancellationRecord {
  id?: string,
  name?: string,
  importHash?: null,
  createdAt?: Date | any,
  updatedAt?: Date | any,
  deletedAt?: null,
  createdById?: string,
  updatedById?: string,
}

export enum CancellationtypesFormActionTypes {
CANCELLATIONTYPES_FORM_RESET = "CANCELLATIONTYPES_FORM_RESET",
  CANCELLATIONTYPES_FORM_FIND_STARTED = "CANCELLATIONTYPES_FORM_FIND_STARTED",
    CANCELLATIONTYPES_FORM_FIND_SUCCESS = "CANCELLATIONTYPES_FORM_FIND_SUCCESS",
      CANCELLATIONTYPES_FORM_FIND_ERROR = "CANCELLATIONTYPES_FORM_FIND_ERROR",
        CANCELLATIONTYPES_FORM_CREATE_STARTED = "CANCELLATIONTYPES_FORM_CREATE_STARTED",
          CANCELLATIONTYPES_FORM_CREATE_SUCCESS = "CANCELLATIONTYPES_FORM_CREATE_SUCCESS",
            CANCELLATIONTYPES_FORM_CREATE_ERROR = "CANCELLATIONTYPES_FORM_CREATE_ERROR",
              CANCELLATIONTYPES_FORM_UPDATE_STARTED = "CANCELLATIONTYPES_FORM_UPDATE_STARTED",
                CANCELLATIONTYPES_FORM_UPDATE_SUCCESS = "CANCELLATIONTYPES_FORM_UPDATE_SUCCESS",
                  CANCELLATIONTYPES_FORM_UPDATE_ERROR = "CANCELLATIONTYPES_FORM_UPDATE_ERROR",
}

interface CancellationtypesFormReset {
  type: CancellationtypesFormActionTypes.CANCELLATIONTYPES_FORM_RESET;
}

interface CancellationtypesFormFindStarted {
  type: CancellationtypesFormActionTypes.CANCELLATIONTYPES_FORM_FIND_STARTED;
}

interface CancellationtypesFormFindSuccess {
  type: CancellationtypesFormActionTypes.CANCELLATIONTYPES_FORM_FIND_SUCCESS;
  payload: CancellationRecord;
}

interface CancellationtypesFormFindError {
  type: CancellationtypesFormActionTypes.CANCELLATIONTYPES_FORM_FIND_ERROR;
}

interface CancellationtypesFormCreateStarted {
  type: CancellationtypesFormActionTypes.CANCELLATIONTYPES_FORM_CREATE_STARTED;
}

interface CancellationtypesFormCreateSuccess {
  type: CancellationtypesFormActionTypes.CANCELLATIONTYPES_FORM_CREATE_SUCCESS;
}

interface CancellationtypesFormCreateError {
  type: CancellationtypesFormActionTypes.CANCELLATIONTYPES_FORM_CREATE_ERROR;
}

interface CancellationtypesFormUpdateStarted {
  type: CancellationtypesFormActionTypes.CANCELLATIONTYPES_FORM_UPDATE_STARTED;
}

interface CancellationtypesFormUpdateSuccess {
  type: CancellationtypesFormActionTypes.CANCELLATIONTYPES_FORM_UPDATE_SUCCESS;
}

interface CancellationtypesFormUpdateError {
  type: CancellationtypesFormActionTypes.CANCELLATIONTYPES_FORM_UPDATE_ERROR;
}

export type CancellationtypesFormAction =
  CancellationtypesFormReset
  | CancellationtypesFormFindStarted
  | CancellationtypesFormFindSuccess
  | CancellationtypesFormFindError
  | CancellationtypesFormCreateStarted
  | CancellationtypesFormCreateSuccess
  | CancellationtypesFormCreateError
  | CancellationtypesFormUpdateStarted
  | CancellationtypesFormUpdateSuccess
  | CancellationtypesFormUpdateError
