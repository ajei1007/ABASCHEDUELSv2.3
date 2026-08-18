/* eslint-disable import/no-anonymous-default-export */
import {
  type TimeoffListState,
  type TimeoffListAction,
  TimeoffListActionTypes
} from "types/redux/timeoff/timeoffList";

const initialData: TimeoffListState = {
  rows: [],
  loading: false,
  count: 0,
  modalOpen: false,
  idToDelete: null,
};

export default (state = initialData, action: TimeoffListAction): TimeoffListState => {
  switch (action.type) {
    case TimeoffListActionTypes.TIMEOFF_LIST_FETCH_STARTED:
      return {
        ...state,
        loading: true,
      }
    case TimeoffListActionTypes.TIMEOFF_LIST_FETCH_SUCCESS:
      return {
        ...state,
        rows: action.payload!.rows,
        loading: false,
        count: action.payload!.count,
      }
    case TimeoffListActionTypes.TIMEOFF_LIST_FETCH_ERROR:
      return {
        ...state,
        loading: false,
        rows: []
      }
    case TimeoffListActionTypes.TIMEOFF_LIST_DELETE_STARTED:
      return {
        ...state,
        loading: true
      }
    case TimeoffListActionTypes.TIMEOFF_LIST_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case TimeoffListActionTypes.TIMEOFF_LIST_DELETE_ERROR:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case TimeoffListActionTypes.TIMEOFF_LIST_OPEN_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: true,
        idToDelete: action.payload.id,
      }
    case TimeoffListActionTypes.TIMEOFF_LIST_CLOSE_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    default:
      return state;
  }
}
