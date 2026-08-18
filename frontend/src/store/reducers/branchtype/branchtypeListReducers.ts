/* eslint-disable import/no-anonymous-default-export */
import {
  type BranchtypeListState,
  type BranchtypeListAction,
  BranchtypeListActionTypes
} from "types/redux/branchtype/branchtypeList";

const initialData: BranchtypeListState = {
  rows: [],
  loading: false,
  count: 0,
  modalOpen: false,
  idToDelete: null,
};

export default (state = initialData, action: BranchtypeListAction): BranchtypeListState => {
  switch (action.type) {
    case BranchtypeListActionTypes.BRANCHTYPE_LIST_FETCH_STARTED:
      return {
        ...state,
        loading: true,
      }
    case BranchtypeListActionTypes.BRANCHTYPE_LIST_FETCH_SUCCESS:
      return {
        ...state,
        rows: action.payload!.rows,
        loading: false,
        count: action.payload!.count,
      }
    case BranchtypeListActionTypes.BRANCHTYPE_LIST_FETCH_ERROR:
      return {
        ...state,
        loading: false,
        rows: []
      }
    case BranchtypeListActionTypes.BRANCHTYPE_LIST_DELETE_STARTED:
      return {
        ...state,
        loading: true
      }
    case BranchtypeListActionTypes.BRANCHTYPE_LIST_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case BranchtypeListActionTypes.BRANCHTYPE_LIST_DELETE_ERROR:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case BranchtypeListActionTypes.BRANCHTYPE_LIST_OPEN_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: true,
        idToDelete: action.payload.id,
      }
    case BranchtypeListActionTypes.BRANCHTYPE_LIST_CLOSE_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    default:
      return state;
  }
}
