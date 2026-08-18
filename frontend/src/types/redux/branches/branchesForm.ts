export interface BranchesFormState {
  findLoading: boolean;
  saveLoading: boolean;
  record: null | any;
}
interface branchType {
  id?: string,
  name?: string,
  bol?: boolean,
  physical?: boolean,
  importHash?: boolean,
  createdAt?: Date | any,
  updatedAt?: Date | any,
  deletedAt?: null | number | string,
  parentId?: string | number | null,
  createdById?: string,
  updatedById?: string,
}
interface parentType {
  id?: string,
  name?: string,
  timezone?: null | string | number,
  replyToEmail?: null | string | number,
  drivetime?: null | string | number,
  importHash?: null,
  createdAt?: Date | any,
  updatedAt?: Date| any,
  deletedAt?: string | number | null,
  branchTypeId?: string | number | null,
  parentId?: string | number | null,
  userId?: string | number | null,
  createdById?: string | number | null,
  updatedById?: string | number | null
}
export interface BranchRecord {
    id: string,
    name?: string,
    timezone?: string | number | null,
    replyToEmail?: string | number | null,
    drivetime?: string | number | null,
    importHash?: string | number | null,
    createdAt?: Date | any,
    updatedAt?: Date | any,
    deletedAt?: string | number | null,
    branchTypeId?: string,
    parentId?: string,
    userId?: string | number | null,
    createdById?: string,
    updatedById?: string,
    branchType?: branchType,
    parent?: parentType,
    user?: null | any
}

export enum BranchesFormActionTypes {
BRANCHES_FORM_RESET = "BRANCHES_FORM_RESET",
  BRANCHES_FORM_FIND_STARTED = "BRANCHES_FORM_FIND_STARTED",
    BRANCHES_FORM_FIND_SUCCESS = "BRANCHES_FORM_FIND_SUCCESS",
      BRANCHES_FORM_FIND_ERROR = "BRANCHES_FORM_FIND_ERROR",
        BRANCHES_FORM_CREATE_STARTED = "BRANCHES_FORM_CREATE_STARTED",
          BRANCHES_FORM_CREATE_SUCCESS = "BRANCHES_FORM_CREATE_SUCCESS",
            BRANCHES_FORM_CREATE_ERROR = "BRANCHES_FORM_CREATE_ERROR",
              BRANCHES_FORM_UPDATE_STARTED = "BRANCHES_FORM_UPDATE_STARTED",
                BRANCHES_FORM_UPDATE_SUCCESS = "BRANCHES_FORM_UPDATE_SUCCESS",
                  BRANCHES_FORM_UPDATE_ERROR = "BRANCHES_FORM_UPDATE_ERROR",
}

interface BranchesFormReset {
  type: BranchesFormActionTypes.BRANCHES_FORM_RESET;
}

interface BranchesFormFindStarted {
  type: BranchesFormActionTypes.BRANCHES_FORM_FIND_STARTED;
}

interface BranchesFormFindSuccess {
  type: BranchesFormActionTypes.BRANCHES_FORM_FIND_SUCCESS;
  payload: BranchRecord;
}

interface BranchesFormFindError {
  type: BranchesFormActionTypes.BRANCHES_FORM_FIND_ERROR;
}

interface BranchesFormCreateStarted {
  type: BranchesFormActionTypes.BRANCHES_FORM_CREATE_STARTED;
}

interface BranchesFormCreateSuccess {
  type: BranchesFormActionTypes.BRANCHES_FORM_CREATE_SUCCESS;
}

interface BranchesFormCreateError {
  type: BranchesFormActionTypes.BRANCHES_FORM_CREATE_ERROR;
}

interface BranchesFormUpdateStarted {
  type: BranchesFormActionTypes.BRANCHES_FORM_UPDATE_STARTED;
}

interface BranchesFormUpdateSuccess {
  type: BranchesFormActionTypes.BRANCHES_FORM_UPDATE_SUCCESS;
}

interface BranchesFormUpdateError {
  type: BranchesFormActionTypes.BRANCHES_FORM_UPDATE_ERROR;
}

export type BranchesFormAction =
  BranchesFormReset
  | BranchesFormFindStarted
  | BranchesFormFindSuccess
  | BranchesFormFindError
  | BranchesFormCreateStarted
  | BranchesFormCreateSuccess
  | BranchesFormCreateError
  | BranchesFormUpdateStarted
  | BranchesFormUpdateSuccess
  | BranchesFormUpdateError
