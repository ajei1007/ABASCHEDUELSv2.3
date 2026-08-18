export interface CustomFormState {
  findLoading: boolean;
  saveLoading: boolean;
  record: null | any;
}

export enum CustomFormActionTypes {
  CUSTOM_FORM_RESET = 'CUSTOM_FORM_RESET',
  CUSTOM_FORM_FIND_STARTED = 'CUSTOM_FORM_FIND_STARTED',
  CUSTOM_FORM_FIND_SUCCESS = 'CUSTOM_FORM_FIND_SUCCESS',
  CUSTOM_FORM_FIND_ERROR = 'CUSTOM_FORM_FIND_ERROR',
  CUSTOM_FORM_CREATE_STARTED = 'CUSTOM_FORM_CREATE_STARTED',
  CUSTOM_FORM_CREATE_SUCCESS = 'CUSTOM_FORM_CREATE_SUCCESS',
  CUSTOM_FORM_CREATE_ERROR = 'CUSTOM_FORM_CREATE_ERROR',
  CUSTOM_FORM_UPDATE_STARTED = 'CUSTOM_FORM_UPDATE_STARTED',
  CUSTOM_FORM_UPDATE_SUCCESS = 'CUSTOM_FORM_UPDATE_SUCCESS',
  CUSTOM_FORM_UPDATE_ERROR = 'CUSTOM_FORM_UPDATE_ERROR',
}

interface CustomFormReset {
  type: CustomFormActionTypes.CUSTOM_FORM_RESET;
}

interface CustomFormFindStarted {
  type: CustomFormActionTypes.CUSTOM_FORM_FIND_STARTED;
}

interface CustomFormFindSuccess {
  type: CustomFormActionTypes.CUSTOM_FORM_FIND_SUCCESS;
  payload: any;
}

interface CustomFormFindError {
  type: CustomFormActionTypes.CUSTOM_FORM_FIND_ERROR;
}

interface CustomFormCreateStarted {
  type: CustomFormActionTypes.CUSTOM_FORM_CREATE_STARTED;
}

interface CustomFormCreateSuccess {
  type: CustomFormActionTypes.CUSTOM_FORM_CREATE_SUCCESS;
}

interface CustomFormCreateError {
  type: CustomFormActionTypes.CUSTOM_FORM_CREATE_ERROR;
}

interface CustomFormUpdateStarted {
  type: CustomFormActionTypes.CUSTOM_FORM_UPDATE_STARTED;
}

interface CustomFormUpdateSuccess {
  type: CustomFormActionTypes.CUSTOM_FORM_UPDATE_SUCCESS;
}

interface CustomFormUpdateError {
  type: CustomFormActionTypes.CUSTOM_FORM_UPDATE_ERROR;
}

export type CustomFormAction =
  | CustomFormReset
  | CustomFormFindStarted
  | CustomFormFindSuccess
  | CustomFormFindError
  | CustomFormCreateStarted
  | CustomFormCreateSuccess
  | CustomFormCreateError
  | CustomFormUpdateStarted
  | CustomFormUpdateSuccess
  | CustomFormUpdateError;
