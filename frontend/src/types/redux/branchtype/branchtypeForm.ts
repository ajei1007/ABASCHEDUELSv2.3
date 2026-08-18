export interface BranchtypeFormState {
  findLoading: boolean;
  saveLoading: boolean;
  record: null | any;
}

interface parentType {
  id?: string,
  name?: string,
  bol?: boolean,
  physical?: boolean,
  importHash?: null,
  createdAt?: Date | any,
  updatedAt?: Date| any,
  deletedAt?: string | number | null,
  parentId?: string | number | null,
  createdById?: string | number | null,
  updatedById?: string | number | null
}

export interface BranchtypeRecord {
    id?: string,
    name?: string,
    bol?: boolean,
    physical?: boolean,
    importHash?: null,
    createdAt?: Date | any,
    updatedAt?: Date | any,
    deletedAt?: null,
    parentId?: string,
    createdById?: string,
    updatedById?: string,
    parent?: parentType
}

export enum BranchtypeFormActionTypes {
BRANCHTYPE_FORM_RESET = "BRANCHTYPE_FORM_RESET",
  BRANCHTYPE_FORM_FIND_STARTED = "BRANCHTYPE_FORM_FIND_STARTED",
    BRANCHTYPE_FORM_FIND_SUCCESS = "BRANCHTYPE_FORM_FIND_SUCCESS",
      BRANCHTYPE_FORM_FIND_ERROR = "BRANCHTYPE_FORM_FIND_ERROR",
        BRANCHTYPE_FORM_CREATE_STARTED = "BRANCHTYPE_FORM_CREATE_STARTED",
          BRANCHTYPE_FORM_CREATE_SUCCESS = "BRANCHTYPE_FORM_CREATE_SUCCESS",
            BRANCHTYPE_FORM_CREATE_ERROR = "BRANCHTYPE_FORM_CREATE_ERROR",
              BRANCHTYPE_FORM_UPDATE_STARTED = "BRANCHTYPE_FORM_UPDATE_STARTED",
                BRANCHTYPE_FORM_UPDATE_SUCCESS = "BRANCHTYPE_FORM_UPDATE_SUCCESS",
                  BRANCHTYPE_FORM_UPDATE_ERROR = "BRANCHTYPE_FORM_UPDATE_ERROR",
}

interface BranchtypeFormReset {
  type: BranchtypeFormActionTypes.BRANCHTYPE_FORM_RESET;
}

interface BranchtypeFormFindStarted {
  type: BranchtypeFormActionTypes.BRANCHTYPE_FORM_FIND_STARTED;
}

interface BranchtypeFormFindSuccess {
  type: BranchtypeFormActionTypes.BRANCHTYPE_FORM_FIND_SUCCESS;
  payload: BranchtypeRecord;
}

interface BranchtypeFormFindError {
  type: BranchtypeFormActionTypes.BRANCHTYPE_FORM_FIND_ERROR;
}

interface BranchtypeFormCreateStarted {
  type: BranchtypeFormActionTypes.BRANCHTYPE_FORM_CREATE_STARTED;
}

interface BranchtypeFormCreateSuccess {
  type: BranchtypeFormActionTypes.BRANCHTYPE_FORM_CREATE_SUCCESS;
}

interface BranchtypeFormCreateError {
  type: BranchtypeFormActionTypes.BRANCHTYPE_FORM_CREATE_ERROR;
}

interface BranchtypeFormUpdateStarted {
  type: BranchtypeFormActionTypes.BRANCHTYPE_FORM_UPDATE_STARTED;
}

interface BranchtypeFormUpdateSuccess {
  type: BranchtypeFormActionTypes.BRANCHTYPE_FORM_UPDATE_SUCCESS;
}

interface BranchtypeFormUpdateError {
  type: BranchtypeFormActionTypes.BRANCHTYPE_FORM_UPDATE_ERROR;
}

export type BranchtypeFormAction =
  BranchtypeFormReset
  | BranchtypeFormFindStarted
  | BranchtypeFormFindSuccess
  | BranchtypeFormFindError
  | BranchtypeFormCreateStarted
  | BranchtypeFormCreateSuccess
  | BranchtypeFormCreateError
  | BranchtypeFormUpdateStarted
  | BranchtypeFormUpdateSuccess
  | BranchtypeFormUpdateError
