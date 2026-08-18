/* eslint-disable import/no-anonymous-default-export */
import {
  type DistanceMatrixListState,
  type DistanceMatrixListAction,
  DistanceMatrixListActionTypes
} from "types/redux/distanceMatrix/distanceMatrixList";

const initialData: DistanceMatrixListState = {
  rows: [],
  loading: false,
  count: 0,
  modalOpen: false,
  idToDelete: null,
};

export default (state = initialData, action: DistanceMatrixListAction): DistanceMatrixListState => {
  switch (action.type) {
    case DistanceMatrixListActionTypes.DISTANCEMATRIX_LIST_FETCH_STARTED:
      return {
        ...state,
        loading: true,
      }
    case DistanceMatrixListActionTypes.DISTANCEMATRIX_LIST_FETCH_SUCCESS:
      return {
        ...state,
        rows: action.payload!.rows,
        loading: false,
        count: action.payload!.count,
      }
    case DistanceMatrixListActionTypes.DISTANCEMATRIX_LIST_FETCH_ERROR:
      return {
        ...state,
        loading: false,
        rows: []
      }
    case DistanceMatrixListActionTypes.DISTANCEMATRIX_LIST_DELETE_STARTED:
      return {
        ...state,
        loading: true
      }
    case DistanceMatrixListActionTypes.DISTANCEMATRIX_LIST_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case DistanceMatrixListActionTypes.DISTANCEMATRIX_LIST_DELETE_ERROR:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case DistanceMatrixListActionTypes.DISTANCEMATRIX_LIST_OPEN_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: true,
        idToDelete: action.payload.id,
      }
    case DistanceMatrixListActionTypes.DISTANCEMATRIX_LIST_CLOSE_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    default:
      return state;
  }
}
