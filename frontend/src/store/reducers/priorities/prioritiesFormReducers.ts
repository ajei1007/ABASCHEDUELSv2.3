/* eslint-disable import/no-anonymous-default-export */
import {
  type PrioritiesFormState,
  type PrioritiesFormAction,
  PrioritiesFormActionTypes
} from "types/redux/priorities/prioritiesForm";

const initialData: PrioritiesFormState = {
  findLoading: false,
  saveLoading: false,
  record: null,
};

export default (state = initialData, action: PrioritiesFormAction): PrioritiesFormState => {
  switch (action.type) {
    case PrioritiesFormActionTypes.PRIORITIES_FORM_RESET:
      return {
        ...state,
      }
    case PrioritiesFormActionTypes.PRIORITIES_FORM_FIND_STARTED:
      return {
        ...state,
        record: null,
        findLoading: true,
      }
    case PrioritiesFormActionTypes.PRIORITIES_FORM_FIND_SUCCESS:
      return {
        ...state,
        record: action.payload,
        findLoading: false,
      }
    case PrioritiesFormActionTypes.PRIORITIES_FORM_FIND_ERROR:
      return {
        ...state,
        record: null,
        findLoading: false,
      }
    case PrioritiesFormActionTypes.PRIORITIES_FORM_CREATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case PrioritiesFormActionTypes.PRIORITIES_FORM_CREATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case PrioritiesFormActionTypes.PRIORITIES_FORM_CREATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    case PrioritiesFormActionTypes.PRIORITIES_FORM_UPDATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case PrioritiesFormActionTypes.PRIORITIES_FORM_UPDATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case PrioritiesFormActionTypes.PRIORITIES_FORM_UPDATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    default:
      return state;
  }
}
