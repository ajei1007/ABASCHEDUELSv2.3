/* eslint-disable import/no-anonymous-default-export */
import {
  type TimeofftypesListState,
  type TimeofftypesListAction,
  TimeofftypesListActionTypes
} from "types/redux/timeofftypes/timeofftypesList";

const initialData: TimeofftypesListState = {
  rows: [],
  loading: false,
  count: 0,
  modalOpen: false,
  idToDelete: null,
};

export default (state = initialData, action: TimeofftypesListAction): TimeofftypesListState => {
  switch (action.type) {
    case TimeofftypesListActionTypes.TIMEOFFTYPES_LIST_FETCH_STARTED:
      return {
        ...state,
        loading: true,
      }
    case TimeofftypesListActionTypes.TIMEOFFTYPES_LIST_FETCH_SUCCESS:
      return {
        ...state,
        rows: action.payload!.rows,
        loading: false,
        count: action.payload!.count,
      }
    case TimeofftypesListActionTypes.TIMEOFFTYPES_LIST_FETCH_ERROR:
      return {
        ...state,
        loading: false,
        rows: []
      }
    case TimeofftypesListActionTypes.TIMEOFFTYPES_LIST_DELETE_STARTED:
      return {
        ...state,
        loading: true
      }
    case TimeofftypesListActionTypes.TIMEOFFTYPES_LIST_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case TimeofftypesListActionTypes.TIMEOFFTYPES_LIST_DELETE_ERROR:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case TimeofftypesListActionTypes.TIMEOFFTYPES_LIST_OPEN_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: true,
        idToDelete: action.payload.id,
      }
    case TimeofftypesListActionTypes.TIMEOFFTYPES_LIST_CLOSE_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    default:
      return state;
  }
}
