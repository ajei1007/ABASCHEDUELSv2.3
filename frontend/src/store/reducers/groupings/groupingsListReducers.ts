/* eslint-disable import/no-anonymous-default-export */
import {
  type GroupingsListState,
  type GroupingsListAction,
  GroupingsListActionTypes,
} from 'types/redux/groupings/groupingsList';

const initialData: GroupingsListState = {
  rows: [],
  loading: false,
  count: 0,
  modalOpen: false,
  idToDelete: null,
};

export default (state = initialData, action: GroupingsListAction): GroupingsListState => {
  switch (action.type) {
    case GroupingsListActionTypes.GROUPINGS_LIST_FETCH_STARTED:
      return {
        ...state,
        loading: true,
      }
    case GroupingsListActionTypes.GROUPINGS_LIST_FETCH_SUCCESS:
      return {
        ...state,
        rows: action.payload!.rows,
        loading: false,
        count: action.payload!.count,
      }
    case GroupingsListActionTypes.GROUPINGS_LIST_FETCH_ERROR:
      return {
        ...state,
        loading: false,
        rows: []
      }
    case GroupingsListActionTypes.GROUPINGS_LIST_DELETE_STARTED:
      return {
        ...state,
        loading: true
      }
    case GroupingsListActionTypes.GROUPINGS_LIST_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case GroupingsListActionTypes.GROUPINGS_LIST_DELETE_ERROR:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case GroupingsListActionTypes.GROUPINGS_LIST_OPEN_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: true,
        idToDelete: action.payload.id,
      }
    case GroupingsListActionTypes.GROUPINGS_LIST_CLOSE_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    default:
      return state;
  }
}
