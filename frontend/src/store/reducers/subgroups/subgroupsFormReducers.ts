/* eslint-disable import/no-anonymous-default-export */
import {
  type SubgroupsFormState,
  type SubgroupsFormAction,
  SubgroupsFormActionTypes
} from "types/redux/subgroups/subgroupsForm";

const initialData: SubgroupsFormState = {
  findLoading: false,
  saveLoading: false,
  record: null,
};

export default (state = initialData, action: SubgroupsFormAction): SubgroupsFormState => {
  switch (action.type) {
    case SubgroupsFormActionTypes.SUBGROUPS_FORM_RESET:
      return {
        ...state,
      }
    case SubgroupsFormActionTypes.SUBGROUPS_FORM_FIND_STARTED:
      return {
        ...state,
        record: null,
        findLoading: true,
      }
    case SubgroupsFormActionTypes.SUBGROUPS_FORM_FIND_SUCCESS:
      return {
        ...state,
        record: action.payload,
        findLoading: false,
      }
    case SubgroupsFormActionTypes.SUBGROUPS_FORM_FIND_ERROR:
      return {
        ...state,
        record: null,
        findLoading: false,
      }
    case SubgroupsFormActionTypes.SUBGROUPS_FORM_CREATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case SubgroupsFormActionTypes.SUBGROUPS_FORM_CREATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case SubgroupsFormActionTypes.SUBGROUPS_FORM_CREATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    case SubgroupsFormActionTypes.SUBGROUPS_FORM_UPDATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case SubgroupsFormActionTypes.SUBGROUPS_FORM_UPDATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case SubgroupsFormActionTypes.SUBGROUPS_FORM_UPDATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    default:
      return state;
  }
}
