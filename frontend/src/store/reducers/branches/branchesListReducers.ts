/* eslint-disable import/no-anonymous-default-export */
import {
  type BranchesListState,
  type BranchesListAction,
  BranchesListActionTypes,
} from 'types/redux/branches/branchesList';

const initialData: BranchesListState = {
  rows: [],
  loading: false,
  count: 0,
  modalOpen: false,
  idToDelete: null,
};

export default (state = initialData, action: BranchesListAction): BranchesListState => {
  switch (action.type) {
    case BranchesListActionTypes.BRANCHES_LIST_FETCH_STARTED:
      return {
        ...state,
        loading: true,
      }
    case BranchesListActionTypes.BRANCHES_LIST_FETCH_SUCCESS:
      return {
        ...state,
        rows: action.payload!.rows,
        loading: false,
        count: action.payload!.count,
      }
    case BranchesListActionTypes.BRANCHES_LIST_FETCH_ERROR:
      return {
        ...state,
        loading: false,
        rows: []
      }
    case BranchesListActionTypes.BRANCHES_LIST_DELETE_STARTED:
      return {
        ...state,
        loading: true
      }
    case BranchesListActionTypes.BRANCHES_LIST_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case BranchesListActionTypes.BRANCHES_LIST_DELETE_ERROR:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case BranchesListActionTypes.BRANCHES_LIST_OPEN_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: true,
        idToDelete: action.payload.id,
      }
    case BranchesListActionTypes.BRANCHES_LIST_CLOSE_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    default:
      return state;
  }
}
