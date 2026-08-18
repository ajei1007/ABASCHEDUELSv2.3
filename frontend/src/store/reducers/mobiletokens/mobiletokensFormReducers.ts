/* eslint-disable import/no-anonymous-default-export */
import {
  type MobiletokensFormState,
  type MobiletokensFormAction,
  MobiletokensFormActionTypes
} from "types/redux/mobiletokens/mobiletokensForm";

const initialData: MobiletokensFormState = {
  findLoading: false,
  saveLoading: false,
  record: null,
};

export default (state = initialData, action: MobiletokensFormAction): MobiletokensFormState => {
  switch (action.type) {
    case MobiletokensFormActionTypes.MOBILETOKENS_FORM_RESET:
      return {
        ...state,
      }
    case MobiletokensFormActionTypes.MOBILETOKENS_FORM_FIND_STARTED:
      return {
        ...state,
        record: null,
        findLoading: true,
      }
    case MobiletokensFormActionTypes.MOBILETOKENS_FORM_FIND_SUCCESS:
      return {
        ...state,
        record: action.payload,
        findLoading: false,
      }
    case MobiletokensFormActionTypes.MOBILETOKENS_FORM_FIND_ERROR:
      return {
        ...state,
        record: null,
        findLoading: false,
      }
    case MobiletokensFormActionTypes.MOBILETOKENS_FORM_CREATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case MobiletokensFormActionTypes.MOBILETOKENS_FORM_CREATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case MobiletokensFormActionTypes.MOBILETOKENS_FORM_CREATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    case MobiletokensFormActionTypes.MOBILETOKENS_FORM_UPDATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case MobiletokensFormActionTypes.MOBILETOKENS_FORM_UPDATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case MobiletokensFormActionTypes.MOBILETOKENS_FORM_UPDATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    default:
      return state;
  }
}
