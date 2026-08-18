/* eslint-disable import/no-anonymous-default-export */
import {
  type CancellationsListState,
  type CancellationsListAction,
  CancellationsListActionTypes,
} from 'types/redux/cancellations/cancellationsList';

const initialData: CancellationsListState = {
  rows: [],
  loading: false,
  count: 0,
  modalOpen: false,
  idToDelete: null,
};

export default (state = initialData, action: CancellationsListAction): CancellationsListState => {
  switch (action.type) {
    case CancellationsListActionTypes.CANCELLATIONS_LIST_FETCH_STARTED:
      return {
        ...state,
        loading: true,
      }
    case CancellationsListActionTypes.CANCELLATIONS_LIST_FETCH_SUCCESS:
      return {
        ...state,
        rows: action.payload!.rows,
        loading: false,
        count: action.payload!.count,
      }
    case CancellationsListActionTypes.CANCELLATIONS_LIST_FETCH_ERROR:
      return {
        ...state,
        loading: false,
        rows: []
      }
    case CancellationsListActionTypes.CANCELLATIONS_LIST_DELETE_STARTED:
      return {
        ...state,
        loading: true
      }
    case CancellationsListActionTypes.CANCELLATIONS_LIST_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case CancellationsListActionTypes.CANCELLATIONS_LIST_DELETE_ERROR:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case CancellationsListActionTypes.CANCELLATIONS_LIST_OPEN_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: true,
        idToDelete: action.payload.id,
      }
    case CancellationsListActionTypes.CANCELLATIONS_LIST_CLOSE_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    default:
      return state;
  }
}
