/* eslint-disable import/no-anonymous-default-export */
import {
  type CancellationtypesFormState,
  type CancellationtypesFormAction,
  CancellationtypesFormActionTypes
} from "types/redux/cancellationtypes/cancellationtypesForm";

const initialData: CancellationtypesFormState = {
  findLoading: false,
  saveLoading: false,
  record: null,
};

export default (state = initialData, action: CancellationtypesFormAction): CancellationtypesFormState => {
  switch (action.type) {
    case CancellationtypesFormActionTypes.CANCELLATIONTYPES_FORM_RESET:
      return {
        ...state,
      }
    case CancellationtypesFormActionTypes.CANCELLATIONTYPES_FORM_FIND_STARTED:
      return {
        ...state,
        record: null,
        findLoading: true,
      }
    case CancellationtypesFormActionTypes.CANCELLATIONTYPES_FORM_FIND_SUCCESS:
      return {
        ...state,
        record: action.payload,
        findLoading: false,
      }
    case CancellationtypesFormActionTypes.CANCELLATIONTYPES_FORM_FIND_ERROR:
      return {
        ...state,
        record: null,
        findLoading: false,
      }
    case CancellationtypesFormActionTypes.CANCELLATIONTYPES_FORM_CREATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case CancellationtypesFormActionTypes.CANCELLATIONTYPES_FORM_CREATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case CancellationtypesFormActionTypes.CANCELLATIONTYPES_FORM_CREATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    case CancellationtypesFormActionTypes.CANCELLATIONTYPES_FORM_UPDATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case CancellationtypesFormActionTypes.CANCELLATIONTYPES_FORM_UPDATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case CancellationtypesFormActionTypes.CANCELLATIONTYPES_FORM_UPDATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    default:
      return state;
  }
}
