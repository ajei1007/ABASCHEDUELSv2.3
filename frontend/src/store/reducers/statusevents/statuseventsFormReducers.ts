/* eslint-disable import/no-anonymous-default-export */
import {
  type StatuseventsFormState,
  type StatuseventsFormAction,
  StatuseventsFormActionTypes
} from "types/redux/statusevents/statuseventsForm";

const initialData: StatuseventsFormState = {
  findLoading: false,
  saveLoading: false,
  record: null,
};

export default (state = initialData, action: StatuseventsFormAction): StatuseventsFormState => {
  switch (action.type) {
    case StatuseventsFormActionTypes.STATUSEVENTS_FORM_RESET:
      return {
        ...state,
      }
    case StatuseventsFormActionTypes.STATUSEVENTS_FORM_FIND_STARTED:
      return {
        ...state,
        record: null,
        findLoading: true,
      }
    case StatuseventsFormActionTypes.STATUSEVENTS_FORM_FIND_SUCCESS:
      return {
        ...state,
        record: action.payload,
        findLoading: false,
      }
    case StatuseventsFormActionTypes.STATUSEVENTS_FORM_FIND_ERROR:
      return {
        ...state,
        record: null,
        findLoading: false,
      }
    case StatuseventsFormActionTypes.STATUSEVENTS_FORM_CREATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case StatuseventsFormActionTypes.STATUSEVENTS_FORM_CREATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case StatuseventsFormActionTypes.STATUSEVENTS_FORM_CREATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    case StatuseventsFormActionTypes.STATUSEVENTS_FORM_UPDATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case StatuseventsFormActionTypes.STATUSEVENTS_FORM_UPDATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case StatuseventsFormActionTypes.STATUSEVENTS_FORM_UPDATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    default:
      return state;
  }
}
