export interface SubgroupgroupsFormState {
  findLoading: boolean;
  saveLoading: boolean;
  record: null | any;
}

export enum SubgroupgroupsFormActionTypes {
SUBGROUPGROUPS_FORM_RESET = "SUBGROUPGROUPS_FORM_RESET",
  SUBGROUPGROUPS_FORM_FIND_STARTED = "SUBGROUPGROUPS_FORM_FIND_STARTED",
    SUBGROUPGROUPS_FORM_FIND_SUCCESS = "SUBGROUPGROUPS_FORM_FIND_SUCCESS",
      SUBGROUPGROUPS_FORM_FIND_ERROR = "SUBGROUPGROUPS_FORM_FIND_ERROR",
        SUBGROUPGROUPS_FORM_CREATE_STARTED = "SUBGROUPGROUPS_FORM_CREATE_STARTED",
          SUBGROUPGROUPS_FORM_CREATE_SUCCESS = "SUBGROUPGROUPS_FORM_CREATE_SUCCESS",
            SUBGROUPGROUPS_FORM_CREATE_ERROR = "SUBGROUPGROUPS_FORM_CREATE_ERROR",
              SUBGROUPGROUPS_FORM_UPDATE_STARTED = "SUBGROUPGROUPS_FORM_UPDATE_STARTED",
                SUBGROUPGROUPS_FORM_UPDATE_SUCCESS = "SUBGROUPGROUPS_FORM_UPDATE_SUCCESS",
                  SUBGROUPGROUPS_FORM_UPDATE_ERROR = "SUBGROUPGROUPS_FORM_UPDATE_ERROR",
}

interface SubgroupgroupsFormReset {
  type: SubgroupgroupsFormActionTypes.SUBGROUPGROUPS_FORM_RESET;
}

interface SubgroupgroupsFormFindStarted {
  type: SubgroupgroupsFormActionTypes.SUBGROUPGROUPS_FORM_FIND_STARTED;
}

interface SubgroupgroupsFormFindSuccess {
  type: SubgroupgroupsFormActionTypes.SUBGROUPGROUPS_FORM_FIND_SUCCESS;
  payload: any;
}

interface SubgroupgroupsFormFindError {
  type: SubgroupgroupsFormActionTypes.SUBGROUPGROUPS_FORM_FIND_ERROR;
}

interface SubgroupgroupsFormCreateStarted {
  type: SubgroupgroupsFormActionTypes.SUBGROUPGROUPS_FORM_CREATE_STARTED;
}

interface SubgroupgroupsFormCreateSuccess {
  type: SubgroupgroupsFormActionTypes.SUBGROUPGROUPS_FORM_CREATE_SUCCESS;
}

interface SubgroupgroupsFormCreateError {
  type: SubgroupgroupsFormActionTypes.SUBGROUPGROUPS_FORM_CREATE_ERROR;
}

interface SubgroupgroupsFormUpdateStarted {
  type: SubgroupgroupsFormActionTypes.SUBGROUPGROUPS_FORM_UPDATE_STARTED;
}

interface SubgroupgroupsFormUpdateSuccess {
  type: SubgroupgroupsFormActionTypes.SUBGROUPGROUPS_FORM_UPDATE_SUCCESS;
}

interface SubgroupgroupsFormUpdateError {
  type: SubgroupgroupsFormActionTypes.SUBGROUPGROUPS_FORM_UPDATE_ERROR;
}

export type SubgroupgroupsFormAction =
  SubgroupgroupsFormReset
  | SubgroupgroupsFormFindStarted
  | SubgroupgroupsFormFindSuccess
  | SubgroupgroupsFormFindError
  | SubgroupgroupsFormCreateStarted
  | SubgroupgroupsFormCreateSuccess
  | SubgroupgroupsFormCreateError
  | SubgroupgroupsFormUpdateStarted
  | SubgroupgroupsFormUpdateSuccess
  | SubgroupgroupsFormUpdateError
