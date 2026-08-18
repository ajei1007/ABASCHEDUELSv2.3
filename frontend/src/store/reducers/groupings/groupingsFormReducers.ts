/* eslint-disable import/no-anonymous-default-export */
import {
  type GroupingsFormState,
  type GroupingsFormAction,
  GroupingsFormActionTypes
} from "types/redux/groupings/groupingsForm";

const initialData: GroupingsFormState = {
  findLoading: false,
  saveLoading: false,
  record: null,
};

export default (state = initialData, action: GroupingsFormAction): GroupingsFormState => {
  switch (action.type) {
    case GroupingsFormActionTypes.GROUPINGS_FORM_RESET:
      return {
        ...state,
      }
    case GroupingsFormActionTypes.GROUPINGS_FORM_FIND_STARTED:
      return {
        ...state,
        record: null,
        findLoading: true,
      }
    case GroupingsFormActionTypes.GROUPINGS_FORM_FIND_SUCCESS:
      return {
        ...state,
        record: action.payload,
        findLoading: false,
      }
    case GroupingsFormActionTypes.GROUPINGS_FORM_FIND_ERROR:
      return {
        ...state,
        record: null,
        findLoading: false,
      }
    case GroupingsFormActionTypes.GROUPINGS_FORM_CREATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case GroupingsFormActionTypes.GROUPINGS_FORM_CREATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case GroupingsFormActionTypes.GROUPINGS_FORM_CREATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    case GroupingsFormActionTypes.GROUPINGS_FORM_UPDATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case GroupingsFormActionTypes.GROUPINGS_FORM_UPDATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case GroupingsFormActionTypes.GROUPINGS_FORM_UPDATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    default:
      return state;
  }
}
