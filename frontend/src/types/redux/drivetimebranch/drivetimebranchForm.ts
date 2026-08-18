export interface DrivetimebranchFormState {
  findLoading: boolean;
  saveLoading: boolean;
  record: null | any;
}
interface branchState{
  id: string,
  name: string,
  timezone: null | any,
  replyToEmail: null | any,
  drivetime: null | any,
  importHash: null | any,
  createdAt: Date | any,
  updatedAt: Date | any,
  deletedAt: null | any,
  branchTypeId: string,
  parentId: string,
  userId: null | any,
  createdById: string,
  updatedById: string
}
export interface drivetimebranchRecordState {
    id: string,
    time: null | any,
    importHash: null | any,
    createdAt: Date | any,
    updatedAt:  Date| any,
    deletedAt: null | any,
    branch1Id: string,
    branch2Id: string,
    createdById: string,
    updatedById: string,
    branch1: branchState,
    branch2: branchState
}

export enum DrivetimebranchFormActionTypes {
DRIVETIMEBRANCH_FORM_RESET = "DRIVETIMEBRANCH_FORM_RESET",
  DRIVETIMEBRANCH_FORM_FIND_STARTED = "DRIVETIMEBRANCH_FORM_FIND_STARTED",
    DRIVETIMEBRANCH_FORM_FIND_SUCCESS = "DRIVETIMEBRANCH_FORM_FIND_SUCCESS",
      DRIVETIMEBRANCH_FORM_FIND_ERROR = "DRIVETIMEBRANCH_FORM_FIND_ERROR",
        DRIVETIMEBRANCH_FORM_CREATE_STARTED = "DRIVETIMEBRANCH_FORM_CREATE_STARTED",
          DRIVETIMEBRANCH_FORM_CREATE_SUCCESS = "DRIVETIMEBRANCH_FORM_CREATE_SUCCESS",
            DRIVETIMEBRANCH_FORM_CREATE_ERROR = "DRIVETIMEBRANCH_FORM_CREATE_ERROR",
              DRIVETIMEBRANCH_FORM_UPDATE_STARTED = "DRIVETIMEBRANCH_FORM_UPDATE_STARTED",
                DRIVETIMEBRANCH_FORM_UPDATE_SUCCESS = "DRIVETIMEBRANCH_FORM_UPDATE_SUCCESS",
                  DRIVETIMEBRANCH_FORM_UPDATE_ERROR = "DRIVETIMEBRANCH_FORM_UPDATE_ERROR",
}

interface DrivetimebranchFormReset {
  type: DrivetimebranchFormActionTypes.DRIVETIMEBRANCH_FORM_RESET;
}

interface DrivetimebranchFormFindStarted {
  type: DrivetimebranchFormActionTypes.DRIVETIMEBRANCH_FORM_FIND_STARTED;
}

interface DrivetimebranchFormFindSuccess {
  type: DrivetimebranchFormActionTypes.DRIVETIMEBRANCH_FORM_FIND_SUCCESS;
  payload: drivetimebranchRecordState;
}

interface DrivetimebranchFormFindError {
  type: DrivetimebranchFormActionTypes.DRIVETIMEBRANCH_FORM_FIND_ERROR;
}

interface DrivetimebranchFormCreateStarted {
  type: DrivetimebranchFormActionTypes.DRIVETIMEBRANCH_FORM_CREATE_STARTED;
}

interface DrivetimebranchFormCreateSuccess {
  type: DrivetimebranchFormActionTypes.DRIVETIMEBRANCH_FORM_CREATE_SUCCESS;
}

interface DrivetimebranchFormCreateError {
  type: DrivetimebranchFormActionTypes.DRIVETIMEBRANCH_FORM_CREATE_ERROR;
}

interface DrivetimebranchFormUpdateStarted {
  type: DrivetimebranchFormActionTypes.DRIVETIMEBRANCH_FORM_UPDATE_STARTED;
}

interface DrivetimebranchFormUpdateSuccess {
  type: DrivetimebranchFormActionTypes.DRIVETIMEBRANCH_FORM_UPDATE_SUCCESS;
}

interface DrivetimebranchFormUpdateError {
  type: DrivetimebranchFormActionTypes.DRIVETIMEBRANCH_FORM_UPDATE_ERROR;
}

export type DrivetimebranchFormAction =
  DrivetimebranchFormReset
  | DrivetimebranchFormFindStarted
  | DrivetimebranchFormFindSuccess
  | DrivetimebranchFormFindError
  | DrivetimebranchFormCreateStarted
  | DrivetimebranchFormCreateSuccess
  | DrivetimebranchFormCreateError
  | DrivetimebranchFormUpdateStarted
  | DrivetimebranchFormUpdateSuccess
  | DrivetimebranchFormUpdateError
