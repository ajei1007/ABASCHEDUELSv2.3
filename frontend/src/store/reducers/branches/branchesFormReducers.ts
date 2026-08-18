/* eslint-disable import/no-anonymous-default-export */
import {
  type BranchesFormState,
  type BranchesFormAction,
  BranchesFormActionTypes
} from "types/redux/branches/branchesForm";

const initialData: BranchesFormState = {
  findLoading: false,
  saveLoading: false,
  record: null,
};

export default (state = initialData, action: BranchesFormAction): BranchesFormState => {
  switch (action.type) {
    case BranchesFormActionTypes.BRANCHES_FORM_RESET:
      return {
        ...state,
      }
    case BranchesFormActionTypes.BRANCHES_FORM_FIND_STARTED:
      return {
        ...state,
        record: null,
        findLoading: true,
      }
    case BranchesFormActionTypes.BRANCHES_FORM_FIND_SUCCESS:
      return {
        ...state,
        record: action.payload,
        findLoading: false,
      }
    case BranchesFormActionTypes.BRANCHES_FORM_FIND_ERROR:
      return {
        ...state,
        record: null,
        findLoading: false,
      }
    case BranchesFormActionTypes.BRANCHES_FORM_CREATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case BranchesFormActionTypes.BRANCHES_FORM_CREATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case BranchesFormActionTypes.BRANCHES_FORM_CREATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    case BranchesFormActionTypes.BRANCHES_FORM_UPDATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case BranchesFormActionTypes.BRANCHES_FORM_UPDATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case BranchesFormActionTypes.BRANCHES_FORM_UPDATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    default:
      return state;
  }
}
