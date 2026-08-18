/* eslint-disable import/no-anonymous-default-export */
import {
  type BranchtypeFormState,
  type BranchtypeFormAction,
  BranchtypeFormActionTypes
} from "types/redux/branchtype/branchtypeForm";

const initialData: BranchtypeFormState = {
  findLoading: false,
  saveLoading: false,
  record: null,
};

export default (state = initialData, action: BranchtypeFormAction): BranchtypeFormState => {
  switch (action.type) {
    case BranchtypeFormActionTypes.BRANCHTYPE_FORM_RESET:
      return {
        ...state,
      }
    case BranchtypeFormActionTypes.BRANCHTYPE_FORM_FIND_STARTED:
      return {
        ...state,
        record: null,
        findLoading: true,
      }
    case BranchtypeFormActionTypes.BRANCHTYPE_FORM_FIND_SUCCESS:
      return {
        ...state,
        record: action.payload,
        findLoading: false,
      }
    case BranchtypeFormActionTypes.BRANCHTYPE_FORM_FIND_ERROR:
      return {
        ...state,
        record: null,
        findLoading: false,
      }
    case BranchtypeFormActionTypes.BRANCHTYPE_FORM_CREATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case BranchtypeFormActionTypes.BRANCHTYPE_FORM_CREATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case BranchtypeFormActionTypes.BRANCHTYPE_FORM_CREATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    case BranchtypeFormActionTypes.BRANCHTYPE_FORM_UPDATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case BranchtypeFormActionTypes.BRANCHTYPE_FORM_UPDATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case BranchtypeFormActionTypes.BRANCHTYPE_FORM_UPDATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    default:
      return state;
  }
}
