/* eslint-disable import/no-anonymous-default-export */
import {
  type DrivetimebranchFormState,
  type DrivetimebranchFormAction,
  DrivetimebranchFormActionTypes
} from "types/redux/drivetimebranch/drivetimebranchForm";

const initialData: DrivetimebranchFormState = {
  findLoading: false,
  saveLoading: false,
  record: null,
};

export default (state = initialData, action: DrivetimebranchFormAction): DrivetimebranchFormState => {
  switch (action.type) {
    case DrivetimebranchFormActionTypes.DRIVETIMEBRANCH_FORM_RESET:
      return {
        ...state,
      }
    case DrivetimebranchFormActionTypes.DRIVETIMEBRANCH_FORM_FIND_STARTED:
      return {
        ...state,
        record: null,
        findLoading: true,
      }
    case DrivetimebranchFormActionTypes.DRIVETIMEBRANCH_FORM_FIND_SUCCESS:
      return {
        ...state,
        record: action.payload,
        findLoading: false,
      }
    case DrivetimebranchFormActionTypes.DRIVETIMEBRANCH_FORM_FIND_ERROR:
      return {
        ...state,
        record: null,
        findLoading: false,
      }
    case DrivetimebranchFormActionTypes.DRIVETIMEBRANCH_FORM_CREATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case DrivetimebranchFormActionTypes.DRIVETIMEBRANCH_FORM_CREATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case DrivetimebranchFormActionTypes.DRIVETIMEBRANCH_FORM_CREATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    case DrivetimebranchFormActionTypes.DRIVETIMEBRANCH_FORM_UPDATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case DrivetimebranchFormActionTypes.DRIVETIMEBRANCH_FORM_UPDATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case DrivetimebranchFormActionTypes.DRIVETIMEBRANCH_FORM_UPDATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    default:
      return state;
  }
}
