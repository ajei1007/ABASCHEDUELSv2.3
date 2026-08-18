/* eslint-disable import/no-anonymous-default-export */
import {
  type TimeofftypesFormState,
  type TimeofftypesFormAction,
  TimeofftypesFormActionTypes
} from "types/redux/timeofftypes/timeofftypesForm";

const initialData: TimeofftypesFormState = {
  findLoading: false,
  saveLoading: false,
  record: null,
};

export default (state = initialData, action: TimeofftypesFormAction): TimeofftypesFormState => {
  switch (action.type) {
    case TimeofftypesFormActionTypes.TIMEOFFTYPES_FORM_RESET:
      return {
        ...state,
      }
    case TimeofftypesFormActionTypes.TIMEOFFTYPES_FORM_FIND_STARTED:
      return {
        ...state,
        record: null,
        findLoading: true,
      }
    case TimeofftypesFormActionTypes.TIMEOFFTYPES_FORM_FIND_SUCCESS:
      return {
        ...state,
        record: action.payload,
        findLoading: false,
      }
    case TimeofftypesFormActionTypes.TIMEOFFTYPES_FORM_FIND_ERROR:
      return {
        ...state,
        record: null,
        findLoading: false,
      }
    case TimeofftypesFormActionTypes.TIMEOFFTYPES_FORM_CREATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case TimeofftypesFormActionTypes.TIMEOFFTYPES_FORM_CREATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case TimeofftypesFormActionTypes.TIMEOFFTYPES_FORM_CREATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    case TimeofftypesFormActionTypes.TIMEOFFTYPES_FORM_UPDATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case TimeofftypesFormActionTypes.TIMEOFFTYPES_FORM_UPDATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case TimeofftypesFormActionTypes.TIMEOFFTYPES_FORM_UPDATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    default:
      return state;
  }
}
