/* eslint-disable import/no-anonymous-default-export */
import {
  type EventpairFormState,
  type EventpairFormAction,
  EventpairFormActionTypes
} from "types/redux/eventpair/eventpairForm";

const initialData: EventpairFormState = {
  findLoading: false,
  saveLoading: false,
  record: null,
};

export default (state = initialData, action: EventpairFormAction): EventpairFormState => {
  switch (action.type) {
    case EventpairFormActionTypes.EVENTPAIR_FORM_RESET:
      return {
        ...state,
      }
    case EventpairFormActionTypes.EVENTPAIR_FORM_FIND_STARTED:
      return {
        ...state,
        record: null,
        findLoading: true,
      }
    case EventpairFormActionTypes.EVENTPAIR_FORM_FIND_SUCCESS:
      return {
        ...state,
        record: action.payload,
        findLoading: false,
      }
    case EventpairFormActionTypes.EVENTPAIR_FORM_FIND_ERROR:
      return {
        ...state,
        record: null,
        findLoading: false,
      }
    case EventpairFormActionTypes.EVENTPAIR_FORM_CREATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case EventpairFormActionTypes.EVENTPAIR_FORM_CREATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case EventpairFormActionTypes.EVENTPAIR_FORM_CREATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    case EventpairFormActionTypes.EVENTPAIR_FORM_UPDATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case EventpairFormActionTypes.EVENTPAIR_FORM_UPDATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case EventpairFormActionTypes.EVENTPAIR_FORM_UPDATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    default:
      return state;
  }
}
