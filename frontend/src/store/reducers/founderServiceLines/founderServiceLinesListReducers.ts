/* eslint-disable import/no-anonymous-default-export */
import {
  type FounderServiceLinesListState,
  type FounderServiceLinesListAction,
  FounderServiceLinesListActionTypes,
} from 'types/redux/founderServiceLines/founderServiceLinesList';

const initialData: FounderServiceLinesListState = {
  rows: [],
  loading: false,
  count: 0,
  modalOpen: false,
  idToDelete: null,
};

export default (state = initialData, action: FounderServiceLinesListAction): FounderServiceLinesListState => {
  switch (action.type) {
    case FounderServiceLinesListActionTypes.FOUNDER_SERVICE_LINES_LIST_FETCH_STARTED:
      return {
        ...state,
        loading: true,
      }
    case FounderServiceLinesListActionTypes.FOUNDER_SERVICE_LINES_LIST_FETCH_SUCCESS:
      return {
        ...state,
        rows: action.payload!.rows,
        loading: false,
        count: action.payload!.count,
      }
    case FounderServiceLinesListActionTypes.FOUNDER_SERVICE_LINES_LIST_FETCH_ERROR:
      return {
        ...state,
        loading: false,
        rows: []
      }
    case FounderServiceLinesListActionTypes.FOUNDER_SERVICE_LINES_LIST_DELETE_STARTED:
      return {
        ...state,
        loading: true
      }
    case FounderServiceLinesListActionTypes.FOUNDER_SERVICE_LINES_LIST_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case FounderServiceLinesListActionTypes.FOUNDER_SERVICE_LINES_LIST_DELETE_ERROR:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case FounderServiceLinesListActionTypes.FOUNDER_SERVICE_LINES_LIST_OPEN_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: true,
        idToDelete: action.payload.id,
      }
    case FounderServiceLinesListActionTypes.FOUNDER_SERVICE_LINES_LIST_CLOSE_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    default:
      return state;
  }
}
