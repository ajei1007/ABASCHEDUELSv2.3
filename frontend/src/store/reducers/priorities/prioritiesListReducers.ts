/* eslint-disable import/no-anonymous-default-export */
import {
  type PrioritiesListState,
  type PrioritiesListAction,
  PrioritiesListActionTypes,
} from 'types/redux/priorities/prioritiesList';
const initialData: PrioritiesListState = {
  rows: [],
  loading: false,
  count: 0,
  modalOpen: false,
  idToDelete: null,
};

export default (state = initialData, action: PrioritiesListAction): PrioritiesListState => {
  switch (action.type) {
    case PrioritiesListActionTypes.PRIORITIES_LIST_FETCH_STARTED:
      return {
        ...state,
        loading: true,
      }
    case PrioritiesListActionTypes.PRIORITIES_LIST_FETCH_SUCCESS:
      return {
        ...state,
        rows: action.payload!.rows,
        loading: false,
        count: action.payload!.count,
      }
    case PrioritiesListActionTypes.PRIORITIES_LIST_FETCH_ERROR:
      return {
        ...state,
        loading: false,
        rows: []
      }
    case PrioritiesListActionTypes.PRIORITIES_LIST_DELETE_STARTED:
      return {
        ...state,
        loading: true
      }
    case PrioritiesListActionTypes.PRIORITIES_LIST_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case PrioritiesListActionTypes.PRIORITIES_LIST_DELETE_ERROR:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case PrioritiesListActionTypes.PRIORITIES_LIST_OPEN_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: true,
        idToDelete: action.payload.id,
      }
    case PrioritiesListActionTypes.PRIORITIES_LIST_CLOSE_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    default:
      return state;
  }
}
