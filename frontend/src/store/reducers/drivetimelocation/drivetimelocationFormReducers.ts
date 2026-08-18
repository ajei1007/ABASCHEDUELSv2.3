/* eslint-disable import/no-anonymous-default-export */
import {
  type DrivetimelocationFormState,
  type DrivetimelocationFormAction,
  DrivetimelocationFormActionTypes
} from "types/redux/drivetimelocation/drivetimelocationForm";

const initialData: DrivetimelocationFormState = {
  findLoading: false,
  saveLoading: false,
  record: null,
};

export default (state = initialData, action: DrivetimelocationFormAction): DrivetimelocationFormState => {
  switch (action.type) {
    case DrivetimelocationFormActionTypes.DRIVETIMELOCATION_FORM_RESET:
      return {
        ...state,
      }
    case DrivetimelocationFormActionTypes.DRIVETIMELOCATION_FORM_FIND_STARTED:
      return {
        ...state,
        record: null,
        findLoading: true,
      }
    case DrivetimelocationFormActionTypes.DRIVETIMELOCATION_FORM_FIND_SUCCESS:
      return {
        ...state,
        record: action.payload,
        findLoading: false,
      }
    case DrivetimelocationFormActionTypes.DRIVETIMELOCATION_FORM_FIND_ERROR:
      return {
        ...state,
        record: null,
        findLoading: false,
      }
    case DrivetimelocationFormActionTypes.DRIVETIMELOCATION_FORM_CREATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case DrivetimelocationFormActionTypes.DRIVETIMELOCATION_FORM_CREATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case DrivetimelocationFormActionTypes.DRIVETIMELOCATION_FORM_CREATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    case DrivetimelocationFormActionTypes.DRIVETIMELOCATION_FORM_UPDATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case DrivetimelocationFormActionTypes.DRIVETIMELOCATION_FORM_UPDATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case DrivetimelocationFormActionTypes.DRIVETIMELOCATION_FORM_UPDATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    default:
      return state;
  }
}
