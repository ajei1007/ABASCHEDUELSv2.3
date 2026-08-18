/* eslint-disable import/no-anonymous-default-export */
import {
  type EventpairListState,
  type EventpairListAction,
  EventpairListActionTypes,
} from "types/redux/eventpair/eventpairList";

const initialData: EventpairListState = {
  rows: [],
  loading: false,
  count: 0,
  modalOpen: false,
  idToDelete: null,
};

export default (state = initialData, action: EventpairListAction): EventpairListState => {
  switch (action.type) {
    case EventpairListActionTypes.EVENTPAIR_LIST_FETCH_STARTED:
      return {
        ...state,
        loading: true,
      }
    case EventpairListActionTypes.EVENTPAIR_LIST_FETCH_SUCCESS:
      return {
        ...state,
        rows: action.payload!.rows,
        loading: false,
        count: action.payload!.count,
      }
    case EventpairListActionTypes.EVENTPAIR_LIST_FETCH_ERROR:
      return {
        ...state,
        loading: false,
        rows: []
      }
    case EventpairListActionTypes.EVENTPAIR_LIST_DELETE_STARTED:
      return {
        ...state,
        loading: true
      }
    case EventpairListActionTypes.EVENTPAIR_LIST_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case EventpairListActionTypes.EVENTPAIR_LIST_DELETE_ERROR:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case EventpairListActionTypes.EVENTPAIR_LIST_OPEN_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: true,
        idToDelete: action.payload.id,
      }
    case EventpairListActionTypes.EVENTPAIR_LIST_CLOSE_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    default:
      return state;
  }
}
