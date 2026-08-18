/* eslint-disable import/no-anonymous-default-export */
import {
  type IndustriesListState,
  type IndustriesListAction,
  IndustriesListActionTypes,
} from 'types/redux/industries/industriesList';

const initialData: IndustriesListState = {
  rows: [],
  loading: false,
  count: 0,
  modalOpen: false,
  idToDelete: null,
};

export default (state = initialData, action: IndustriesListAction): IndustriesListState => {
  switch (action.type) {
    case IndustriesListActionTypes.INDUSTRIES_LIST_FETCH_STARTED:
      return {
        ...state,
        loading: true,
      }
    case IndustriesListActionTypes.INDUSTRIES_LIST_FETCH_SUCCESS:
      return {
        ...state,
        rows: action.payload!.rows,
        loading: false,
        count: action.payload!.count,
      }
    case IndustriesListActionTypes.INDUSTRIES_LIST_FETCH_ERROR:
      return {
        ...state,
        loading: false,
        rows: []
      }
    case IndustriesListActionTypes.INDUSTRIES_LIST_DELETE_STARTED:
      return {
        ...state,
        loading: true
      }
    case IndustriesListActionTypes.INDUSTRIES_LIST_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case IndustriesListActionTypes.INDUSTRIES_LIST_DELETE_ERROR:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case IndustriesListActionTypes.INDUSTRIES_LIST_OPEN_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: true,
        idToDelete: action.payload.id,
      }
    case IndustriesListActionTypes.INDUSTRIES_LIST_CLOSE_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    default:
      return state;
  }
}