/* eslint-disable import/no-anonymous-default-export */
import {
  type TotaltypesListState,
  type TotaltypesListAction,
  TotaltypesListActionTypes
} from "types/redux/totaltypes/totaltypesList";

const initialData: TotaltypesListState = {
  rows: [],
  loading: false,
  count: 0,
  modalOpen: false,
  idToDelete: null,
};

export default (state = initialData, action: TotaltypesListAction): TotaltypesListState => {
  switch (action.type) {
    case TotaltypesListActionTypes.TOTALTYPES_LIST_FETCH_STARTED:
      return {
        ...state,
        loading: true,
      }
    case TotaltypesListActionTypes.TOTALTYPES_LIST_FETCH_SUCCESS:
      return {
        ...state,
        rows: action.payload!.rows,
        loading: false,
        count: action.payload!.count,
      }
    case TotaltypesListActionTypes.TOTALTYPES_LIST_FETCH_ERROR:
      return {
        ...state,
        loading: false,
        rows: []
      }
    case TotaltypesListActionTypes.TOTALTYPES_LIST_DELETE_STARTED:
      return {
        ...state,
        loading: true
      }
    case TotaltypesListActionTypes.TOTALTYPES_LIST_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case TotaltypesListActionTypes.TOTALTYPES_LIST_DELETE_ERROR:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case TotaltypesListActionTypes.TOTALTYPES_LIST_OPEN_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: true,
        idToDelete: action.payload.id,
      }
    case TotaltypesListActionTypes.TOTALTYPES_LIST_CLOSE_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    default:
      return state;
  }
}
