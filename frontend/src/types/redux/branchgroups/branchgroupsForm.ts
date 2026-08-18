export interface BranchgroupsFormState {
  findLoading: boolean;
  saveLoading: boolean;
  record: null | any;
}

export enum BranchgroupsFormActionTypes {
BRANCHGROUPS_FORM_RESET = "BRANCHGROUPS_FORM_RESET",
  BRANCHGROUPS_FORM_FIND_STARTED = "BRANCHGROUPS_FORM_FIND_STARTED",
    BRANCHGROUPS_FORM_FIND_SUCCESS = "BRANCHGROUPS_FORM_FIND_SUCCESS",
      BRANCHGROUPS_FORM_FIND_ERROR = "BRANCHGROUPS_FORM_FIND_ERROR",
        BRANCHGROUPS_FORM_CREATE_STARTED = "BRANCHGROUPS_FORM_CREATE_STARTED",
          BRANCHGROUPS_FORM_CREATE_SUCCESS = "BRANCHGROUPS_FORM_CREATE_SUCCESS",
            BRANCHGROUPS_FORM_CREATE_ERROR = "BRANCHGROUPS_FORM_CREATE_ERROR",
              BRANCHGROUPS_FORM_UPDATE_STARTED = "BRANCHGROUPS_FORM_UPDATE_STARTED",
                BRANCHGROUPS_FORM_UPDATE_SUCCESS = "BRANCHGROUPS_FORM_UPDATE_SUCCESS",
                  BRANCHGROUPS_FORM_UPDATE_ERROR = "BRANCHGROUPS_FORM_UPDATE_ERROR",
}

interface BranchgroupsFormReset {
  type: BranchgroupsFormActionTypes.BRANCHGROUPS_FORM_RESET;
}

interface BranchgroupsFormFindStarted {
  type: BranchgroupsFormActionTypes.BRANCHGROUPS_FORM_FIND_STARTED;
}

interface BranchgroupsFormFindSuccess {
  type: BranchgroupsFormActionTypes.BRANCHGROUPS_FORM_FIND_SUCCESS;
  payload: any;
}

interface BranchgroupsFormFindError {
  type: BranchgroupsFormActionTypes.BRANCHGROUPS_FORM_FIND_ERROR;
}

interface BranchgroupsFormCreateStarted {
  type: BranchgroupsFormActionTypes.BRANCHGROUPS_FORM_CREATE_STARTED;
}

interface BranchgroupsFormCreateSuccess {
  type: BranchgroupsFormActionTypes.BRANCHGROUPS_FORM_CREATE_SUCCESS;
}

interface BranchgroupsFormCreateError {
  type: BranchgroupsFormActionTypes.BRANCHGROUPS_FORM_CREATE_ERROR;
}

interface BranchgroupsFormUpdateStarted {
  type: BranchgroupsFormActionTypes.BRANCHGROUPS_FORM_UPDATE_STARTED;
}

interface BranchgroupsFormUpdateSuccess {
  type: BranchgroupsFormActionTypes.BRANCHGROUPS_FORM_UPDATE_SUCCESS;
}

interface BranchgroupsFormUpdateError {
  type: BranchgroupsFormActionTypes.BRANCHGROUPS_FORM_UPDATE_ERROR;
}

export type BranchgroupsFormAction =
  BranchgroupsFormReset
  | BranchgroupsFormFindStarted
  | BranchgroupsFormFindSuccess
  | BranchgroupsFormFindError
  | BranchgroupsFormCreateStarted
  | BranchgroupsFormCreateSuccess
  | BranchgroupsFormCreateError
  | BranchgroupsFormUpdateStarted
  | BranchgroupsFormUpdateSuccess
  | BranchgroupsFormUpdateError
