/* eslint-disable import/no-anonymous-default-export */
import {
  type BranchgroupsListState,
  type BranchgroupsListAction,
  BranchgroupsListActionTypes
} from "types/redux/branchgroups/branchgroupsList";

const initialData: BranchgroupsListState = {
  rows: [],
  loading: false,
  count: 0,
  modalOpen: false,
  idToDelete: null,
};

export default (state = initialData, action: BranchgroupsListAction): BranchgroupsListState => {
  switch (action.type) {
    case BranchgroupsListActionTypes.BRANCHGROUPS_LIST_FILTERED:
      return {
        ...state,
        rows: action.payload!.rows,
        loading: false,
      }
    case BranchgroupsListActionTypes.BRANCHGROUPS_LIST_FETCH_STARTED:
      return {
        ...state,
        loading: true,
      }
    case BranchgroupsListActionTypes.BRANCHGROUPS_LIST_FETCH_SUCCESS:
      return {
        ...state,
        rows: action.payload!.rows,
        loading: false,
        count: action.payload!.count,
      }
    case BranchgroupsListActionTypes.BRANCHGROUPS_LIST_FETCH_ERROR:
      return {
        ...state,
        loading: false,
        rows: []
      }
    case BranchgroupsListActionTypes.BRANCHGROUPS_LIST_DELETE_STARTED:
      return {
        ...state,
        loading: true
      }
    case BranchgroupsListActionTypes.BRANCHGROUPS_LIST_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case BranchgroupsListActionTypes.BRANCHGROUPS_LIST_DELETE_ERROR:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case BranchgroupsListActionTypes.BRANCHGROUPS_LIST_OPEN_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: true,
        idToDelete: action.payload.id,
      }
    case BranchgroupsListActionTypes.BRANCHGROUPS_LIST_CLOSE_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    default:
      return state;
  }
}
