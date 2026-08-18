/* eslint-disable import/no-anonymous-default-export */
import {
  type SubgroupsListState,
  type SubgroupsListAction,
  SubgroupsListActionTypes,
} from 'types/redux/subgroups/subgroupsList';
const initialData: SubgroupsListState = {
  rows: [],
  loading: false,
  count: 0,
  modalOpen: false,
  idToDelete: null,
};

export default (state = initialData, action: SubgroupsListAction): SubgroupsListState => {
  switch (action.type) {
    case SubgroupsListActionTypes.SUBGROUPS_LIST_FETCH_STARTED:
      return {
        ...state,
        loading: true,
      }
    case SubgroupsListActionTypes.SUBGROUPS_LIST_FETCH_SUCCESS:
      return {
        ...state,
        rows: action.payload!.rows,
        loading: false,
        count: action.payload!.count,
      }
    case SubgroupsListActionTypes.SUBGROUPS_LIST_FETCH_ERROR:
      return {
        ...state,
        loading: false,
        rows: []
      }
    case SubgroupsListActionTypes.SUBGROUPS_LIST_DELETE_STARTED:
      return {
        ...state,
        loading: true
      }
    case SubgroupsListActionTypes.SUBGROUPS_LIST_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case SubgroupsListActionTypes.SUBGROUPS_LIST_DELETE_ERROR:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case SubgroupsListActionTypes.SUBGROUPS_LIST_OPEN_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: true,
        idToDelete: action.payload.id,
      }
    case SubgroupsListActionTypes.SUBGROUPS_LIST_CLOSE_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    default:
      return state;
  }
}
