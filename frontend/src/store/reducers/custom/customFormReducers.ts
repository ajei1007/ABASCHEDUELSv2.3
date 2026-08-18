import {
  type CustomFormState,
  type CustomFormAction,
  CustomFormActionTypes
} from "types/redux/custom/customForm";

const initialData: CustomFormState = {
  findLoading: false,
  saveLoading: false,
  record: null,
};

export default function customFormReducers (state = initialData, action: CustomFormAction): CustomFormState {
  switch (action.type) {
    case CustomFormActionTypes.CUSTOM_FORM_RESET:
      return {
        ...state,
      }
    case CustomFormActionTypes.CUSTOM_FORM_FIND_STARTED:
      return {
        ...state,
        record: null,
        findLoading: true,
      }
    case CustomFormActionTypes.CUSTOM_FORM_FIND_SUCCESS:
      return {
        ...state,
        record: action.payload,
        findLoading: false,
      }
    case CustomFormActionTypes.CUSTOM_FORM_FIND_ERROR:
      return {
        ...state,
        record: null,
        findLoading: false,
      }
    case CustomFormActionTypes.CUSTOM_FORM_CREATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case CustomFormActionTypes.CUSTOM_FORM_CREATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case CustomFormActionTypes.CUSTOM_FORM_CREATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    case CustomFormActionTypes.CUSTOM_FORM_UPDATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case CustomFormActionTypes.CUSTOM_FORM_UPDATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case CustomFormActionTypes.CUSTOM_FORM_UPDATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    default:
      return state;
  }
}
