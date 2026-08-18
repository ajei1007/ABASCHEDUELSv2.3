export interface SubgroupsFormState {
  findLoading: boolean;
  saveLoading: boolean;
  record: null | any;
}

export enum SubgroupsFormActionTypes {
SUBGROUPS_FORM_RESET = "SUBGROUPS_FORM_RESET",
  SUBGROUPS_FORM_FIND_STARTED = "SUBGROUPS_FORM_FIND_STARTED",
    SUBGROUPS_FORM_FIND_SUCCESS = "SUBGROUPS_FORM_FIND_SUCCESS",
      SUBGROUPS_FORM_FIND_ERROR = "SUBGROUPS_FORM_FIND_ERROR",
        SUBGROUPS_FORM_CREATE_STARTED = "SUBGROUPS_FORM_CREATE_STARTED",
          SUBGROUPS_FORM_CREATE_SUCCESS = "SUBGROUPS_FORM_CREATE_SUCCESS",
            SUBGROUPS_FORM_CREATE_ERROR = "SUBGROUPS_FORM_CREATE_ERROR",
              SUBGROUPS_FORM_UPDATE_STARTED = "SUBGROUPS_FORM_UPDATE_STARTED",
                SUBGROUPS_FORM_UPDATE_SUCCESS = "SUBGROUPS_FORM_UPDATE_SUCCESS",
                  SUBGROUPS_FORM_UPDATE_ERROR = "SUBGROUPS_FORM_UPDATE_ERROR",
}

interface SubgroupsFormReset {
  type: SubgroupsFormActionTypes.SUBGROUPS_FORM_RESET;
}

interface SubgroupsFormFindStarted {
  type: SubgroupsFormActionTypes.SUBGROUPS_FORM_FIND_STARTED;
}

interface SubgroupsFormFindSuccess {
  type: SubgroupsFormActionTypes.SUBGROUPS_FORM_FIND_SUCCESS;
  payload: any;
}

interface SubgroupsFormFindError {
  type: SubgroupsFormActionTypes.SUBGROUPS_FORM_FIND_ERROR;
}

interface SubgroupsFormCreateStarted {
  type: SubgroupsFormActionTypes.SUBGROUPS_FORM_CREATE_STARTED;
}

interface SubgroupsFormCreateSuccess {
  type: SubgroupsFormActionTypes.SUBGROUPS_FORM_CREATE_SUCCESS;
}

interface SubgroupsFormCreateError {
  type: SubgroupsFormActionTypes.SUBGROUPS_FORM_CREATE_ERROR;
}

interface SubgroupsFormUpdateStarted {
  type: SubgroupsFormActionTypes.SUBGROUPS_FORM_UPDATE_STARTED;
}

interface SubgroupsFormUpdateSuccess {
  type: SubgroupsFormActionTypes.SUBGROUPS_FORM_UPDATE_SUCCESS;
}

interface SubgroupsFormUpdateError {
  type: SubgroupsFormActionTypes.SUBGROUPS_FORM_UPDATE_ERROR;
}

export type SubgroupsFormAction =
  SubgroupsFormReset
  | SubgroupsFormFindStarted
  | SubgroupsFormFindSuccess
  | SubgroupsFormFindError
  | SubgroupsFormCreateStarted
  | SubgroupsFormCreateSuccess
  | SubgroupsFormCreateError
  | SubgroupsFormUpdateStarted
  | SubgroupsFormUpdateSuccess
  | SubgroupsFormUpdateError
