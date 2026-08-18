/* eslint-disable import/no-anonymous-default-export */
import {
  type TimeoffFormState,
  type TimeoffFormAction,
  TimeoffFormActionTypes
} from "types/redux/timeoff/timeoffForm";

const initialData: TimeoffFormState = {
  findLoading: false,
  saveLoading: false,
  record: null,
};

export default (state = initialData, action: TimeoffFormAction): TimeoffFormState => {
  switch (action.type) {
    case TimeoffFormActionTypes.TIMEOFF_FORM_RESET:
      return {
        ...state,
      }
    case TimeoffFormActionTypes.TIMEOFF_FORM_FIND_STARTED:
      return {
        ...state,
        record: null,
        findLoading: true,
      }
    case TimeoffFormActionTypes.TIMEOFF_FORM_FIND_SUCCESS:
      return {
        ...state,
        record: action.payload,
        findLoading: false,
      }
    case TimeoffFormActionTypes.TIMEOFF_FORM_FIND_ERROR:
      return {
        ...state,
        record: null,
        findLoading: false,
      }
    case TimeoffFormActionTypes.TIMEOFF_FORM_CREATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case TimeoffFormActionTypes.TIMEOFF_FORM_CREATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case TimeoffFormActionTypes.TIMEOFF_FORM_CREATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    case TimeoffFormActionTypes.TIMEOFF_FORM_UPDATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case TimeoffFormActionTypes.TIMEOFF_FORM_UPDATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case TimeoffFormActionTypes.TIMEOFF_FORM_UPDATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    default:
      return state;
  }
}
