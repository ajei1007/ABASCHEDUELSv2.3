/* eslint-disable import/no-anonymous-default-export */
import {
  type TotaltypesFormState,
  type TotaltypesFormAction,
  TotaltypesFormActionTypes
} from "types/redux/totaltypes/totaltypesForm";

const initialData: TotaltypesFormState = {
  findLoading: false,
  saveLoading: false,
  record: null,
};

export default (state = initialData, action: TotaltypesFormAction): TotaltypesFormState => {
  switch (action.type) {
    case TotaltypesFormActionTypes.TOTALTYPES_FORM_RESET:
      return {
        ...state,
      }
    case TotaltypesFormActionTypes.TOTALTYPES_FORM_FIND_STARTED:
      return {
        ...state,
        record: null,
        findLoading: true,
      }
    case TotaltypesFormActionTypes.TOTALTYPES_FORM_FIND_SUCCESS:
      return {
        ...state,
        record: action.payload,
        findLoading: false,
      }
    case TotaltypesFormActionTypes.TOTALTYPES_FORM_FIND_ERROR:
      return {
        ...state,
        record: null,
        findLoading: false,
      }
    case TotaltypesFormActionTypes.TOTALTYPES_FORM_CREATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case TotaltypesFormActionTypes.TOTALTYPES_FORM_CREATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case TotaltypesFormActionTypes.TOTALTYPES_FORM_CREATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    case TotaltypesFormActionTypes.TOTALTYPES_FORM_UPDATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case TotaltypesFormActionTypes.TOTALTYPES_FORM_UPDATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case TotaltypesFormActionTypes.TOTALTYPES_FORM_UPDATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    default:
      return state;
  }
}
