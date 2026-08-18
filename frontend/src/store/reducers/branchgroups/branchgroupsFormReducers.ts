/* eslint-disable import/no-anonymous-default-export */
import {
  type BranchgroupsFormState,
  type BranchgroupsFormAction,
  BranchgroupsFormActionTypes
} from "types/redux/branchgroups/branchgroupsForm";

const initialData: BranchgroupsFormState = {
  findLoading: false,
  saveLoading: false,
  record: null,
};

export default (state = initialData, action: BranchgroupsFormAction): BranchgroupsFormState => {
  switch (action.type) {
    case BranchgroupsFormActionTypes.BRANCHGROUPS_FORM_RESET:
      return {
        ...state,
      }
    case BranchgroupsFormActionTypes.BRANCHGROUPS_FORM_FIND_STARTED:
      return {
        ...state,
        record: null,
        findLoading: true,
      }
    case BranchgroupsFormActionTypes.BRANCHGROUPS_FORM_FIND_SUCCESS:
      return {
        ...state,
        record: action.payload,
        findLoading: false,
      }
    case BranchgroupsFormActionTypes.BRANCHGROUPS_FORM_FIND_ERROR:
      return {
        ...state,
        record: null,
        findLoading: false,
      }
    case BranchgroupsFormActionTypes.BRANCHGROUPS_FORM_CREATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case BranchgroupsFormActionTypes.BRANCHGROUPS_FORM_CREATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case BranchgroupsFormActionTypes.BRANCHGROUPS_FORM_CREATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    case BranchgroupsFormActionTypes.BRANCHGROUPS_FORM_UPDATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case BranchgroupsFormActionTypes.BRANCHGROUPS_FORM_UPDATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case BranchgroupsFormActionTypes.BRANCHGROUPS_FORM_UPDATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    default:
      return state;
  }
}
