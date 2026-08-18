/* eslint-disable import/no-anonymous-default-export */
import {
  type IndustriesFormState,
  type IndustriesFormAction,
  IndustriesFormActionTypes
} from "types/redux/industries/industriesForm";

const initialData: IndustriesFormState = {
  findLoading: false,
  saveLoading: false,
  record: null,
};

export default (state = initialData, action: IndustriesFormAction): IndustriesFormState => {
  switch (action.type) {
    case IndustriesFormActionTypes.INDUSTRIES_FORM_RESET:
      return {
        ...state,
      }
    case IndustriesFormActionTypes.INDUSTRIES_FORM_FIND_STARTED:
      return {
        ...state,
        record: null,
        findLoading: true,
      }
    case IndustriesFormActionTypes.INDUSTRIES_FORM_FIND_SUCCESS:
      return {
        ...state,
        record: action.payload,
        findLoading: false,
      }
    case IndustriesFormActionTypes.INDUSTRIES_FORM_FIND_ERROR:
      return {
        ...state,
        record: null,
        findLoading: false,
      }
    case IndustriesFormActionTypes.INDUSTRIES_FORM_CREATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case IndustriesFormActionTypes.INDUSTRIES_FORM_CREATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case IndustriesFormActionTypes.INDUSTRIES_FORM_CREATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    case IndustriesFormActionTypes.INDUSTRIES_FORM_UPDATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case IndustriesFormActionTypes.INDUSTRIES_FORM_UPDATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case IndustriesFormActionTypes.INDUSTRIES_FORM_UPDATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    default:
      return state;
  }
}