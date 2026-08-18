export interface CompaniesFormState {
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

export enum CompaniesFormActionTypes {
COMPANIES_FORM_RESET = "COMPANIES_FORM_RESET",
  COMPANIES_FORM_FIND_STARTED = "COMPANIES_FORM_FIND_STARTED",
    COMPANIES_FORM_FIND_SUCCESS = "COMPANIES_FORM_FIND_SUCCESS",
      COMPANIES_FORM_FIND_ERROR = "COMPANIES_FORM_FIND_ERROR",
        COMPANIES_FORM_CREATE_STARTED = "COMPANIES_FORM_CREATE_STARTED",
          COMPANIES_FORM_CREATE_SUCCESS = "COMPANIES_FORM_CREATE_SUCCESS",
            COMPANIES_FORM_CREATE_ERROR = "COMPANIES_FORM_CREATE_ERROR",
              COMPANIES_FORM_UPDATE_STARTED = "COMPANIES_FORM_UPDATE_STARTED",
                COMPANIES_FORM_UPDATE_SUCCESS = "COMPANIES_FORM_UPDATE_SUCCESS",
                  COMPANIES_FORM_UPDATE_ERROR = "COMPANIES_FORM_UPDATE_ERROR",
}

interface CompaniesFormReset {
  type: CompaniesFormActionTypes.COMPANIES_FORM_RESET;
}

interface CompaniesFormFindStarted {
  type: CompaniesFormActionTypes.COMPANIES_FORM_FIND_STARTED;
}

interface CompaniesFormFindSuccess {
  type: CompaniesFormActionTypes.COMPANIES_FORM_FIND_SUCCESS;
  payload: BranchRecord;
}

interface CompaniesFormFindError {
  type: CompaniesFormActionTypes.COMPANIES_FORM_FIND_ERROR;
}

interface CompaniesFormCreateStarted {
  type: CompaniesFormActionTypes.COMPANIES_FORM_CREATE_STARTED;
}

interface CompaniesFormCreateSuccess {
  type: CompaniesFormActionTypes.COMPANIES_FORM_CREATE_SUCCESS;
}

interface CompaniesFormCreateError {
  type: CompaniesFormActionTypes.COMPANIES_FORM_CREATE_ERROR;
}

interface CompaniesFormUpdateStarted {
  type: CompaniesFormActionTypes.COMPANIES_FORM_UPDATE_STARTED;
}

interface CompaniesFormUpdateSuccess {
  type: CompaniesFormActionTypes.COMPANIES_FORM_UPDATE_SUCCESS;
}

interface CompaniesFormUpdateError {
  type: CompaniesFormActionTypes.COMPANIES_FORM_UPDATE_ERROR;
}

export type CompaniesFormAction =
  CompaniesFormReset
  | CompaniesFormFindStarted
  | CompaniesFormFindSuccess
  | CompaniesFormFindError
  | CompaniesFormCreateStarted
  | CompaniesFormCreateSuccess
  | CompaniesFormCreateError
  | CompaniesFormUpdateStarted
  | CompaniesFormUpdateSuccess
  | CompaniesFormUpdateError
