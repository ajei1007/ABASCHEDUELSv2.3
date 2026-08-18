/* eslint-disable import/no-anonymous-default-export */
import {
  type MobiletokensListState,
  type MobiletokensListAction,
  MobiletokensListActionTypes
} from "types/redux/mobiletokens/mobiletokensList";

const initialData: MobiletokensListState = {
  rows: [],
  loading: false,
  count: 0,
  modalOpen: false,
  idToDelete: null,
};

export default (state = initialData, action: MobiletokensListAction): MobiletokensListState => {
  switch (action.type) {
    case MobiletokensListActionTypes.MOBILETOKENS_LIST_FETCH_STARTED:
      return {
        ...state,
        loading: true,
      }
    case MobiletokensListActionTypes.MOBILETOKENS_LIST_FETCH_SUCCESS:
      return {
        ...state,
        rows: action.payload!.rows,
        loading: false,
        count: action.payload!.count,
      }
    case MobiletokensListActionTypes.MOBILETOKENS_LIST_FETCH_ERROR:
      return {
        ...state,
        loading: false,
        rows: []
      }
    case MobiletokensListActionTypes.MOBILETOKENS_LIST_DELETE_STARTED:
      return {
        ...state,
        loading: true
      }
    case MobiletokensListActionTypes.MOBILETOKENS_LIST_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case MobiletokensListActionTypes.MOBILETOKENS_LIST_DELETE_ERROR:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case MobiletokensListActionTypes.MOBILETOKENS_LIST_OPEN_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: true,
        idToDelete: action.payload.id,
      }
    case MobiletokensListActionTypes.MOBILETOKENS_LIST_CLOSE_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    default:
      return state;
  }
}
