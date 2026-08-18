/* eslint-disable import/no-anonymous-default-export */
import {
  type FounderServiceLinesFormState,
  type FounderServiceLinesFormAction,
  FounderServiceLinesFormActionTypes
} from "types/redux/founderServiceLines/founderServiceLinesForm";

const initialData: FounderServiceLinesFormState = {
  findLoading: false,
  saveLoading: false,
  record: null,
};

export default (state = initialData, action: FounderServiceLinesFormAction): FounderServiceLinesFormState => {
  switch (action.type) {
    case FounderServiceLinesFormActionTypes.FOUNDER_SERVICE_LINES_FORM_RESET:
      return {
        ...state,
      }
    case FounderServiceLinesFormActionTypes.FOUNDER_SERVICE_LINES_FORM_FIND_STARTED:
      return {
        ...state,
        record: null,
        findLoading: true,
      }
    case FounderServiceLinesFormActionTypes.FOUNDER_SERVICE_LINES_FORM_FIND_SUCCESS:
      return {
        ...state,
        record: action.payload,
        findLoading: false,
      }
    case FounderServiceLinesFormActionTypes.FOUNDER_SERVICE_LINES_FORM_FIND_ERROR:
      return {
        ...state,
        record: null,
        findLoading: false,
      }
    case FounderServiceLinesFormActionTypes.FOUNDER_SERVICE_LINES_FORM_CREATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case FounderServiceLinesFormActionTypes.FOUNDER_SERVICE_LINES_FORM_CREATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case FounderServiceLinesFormActionTypes.FOUNDER_SERVICE_LINES_FORM_CREATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    case FounderServiceLinesFormActionTypes.FOUNDER_SERVICE_LINES_FORM_UPDATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case FounderServiceLinesFormActionTypes.FOUNDER_SERVICE_LINES_FORM_UPDATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case FounderServiceLinesFormActionTypes.FOUNDER_SERVICE_LINES_FORM_UPDATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    default:
      return state;
  }
}
