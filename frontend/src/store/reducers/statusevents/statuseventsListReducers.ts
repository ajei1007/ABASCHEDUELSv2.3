/* eslint-disable import/no-anonymous-default-export */
import {
  type StatuseventsListState,
  type StatuseventsListAction,
  StatuseventsListActionTypes
} from "types/redux/statusevents/statuseventsList";

const initialData: StatuseventsListState = {
  rows: [],
  loading: false,
  count: 0,
  modalOpen: false,
  idToDelete: null,
};

export default (state = initialData, action: StatuseventsListAction): StatuseventsListState => {
  switch (action.type) {
    case StatuseventsListActionTypes.STATUSEVENTS_LIST_FETCH_STARTED:
      return {
        ...state,
        loading: true,
      }
    case StatuseventsListActionTypes.STATUSEVENTS_LIST_FETCH_SUCCESS:
      return {
        ...state,
        rows: action.payload!.rows,
        loading: false,
        count: action.payload!.count,
      }
    case StatuseventsListActionTypes.STATUSEVENTS_LIST_FETCH_ERROR:
      return {
        ...state,
        loading: false,
        rows: []
      }
    case StatuseventsListActionTypes.STATUSEVENTS_LIST_DELETE_STARTED:
      return {
        ...state,
        loading: true
      }
    case StatuseventsListActionTypes.STATUSEVENTS_LIST_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case StatuseventsListActionTypes.STATUSEVENTS_LIST_DELETE_ERROR:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case StatuseventsListActionTypes.STATUSEVENTS_LIST_OPEN_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: true,
        idToDelete: action.payload.id,
      }
    case StatuseventsListActionTypes.STATUSEVENTS_LIST_CLOSE_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    default:
      return state;
  }
}
