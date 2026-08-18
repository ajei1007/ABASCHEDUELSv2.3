/* eslint-disable import/no-anonymous-default-export */
import {
  type DrivetimebranchListState,
  type DrivetimebranchListAction,
  DrivetimebranchListActionTypes
} from "types/redux/drivetimebranch/drivetimebranchList";

const initialData: DrivetimebranchListState = {
  rows: [],
  loading: false,
  count: 0,
  modalOpen: false,
  idToDelete: null,
};

export default (state = initialData, action: DrivetimebranchListAction): DrivetimebranchListState => {
  switch (action.type) {
    case DrivetimebranchListActionTypes.DRIVETIMEBRANCH_LIST_FETCH_STARTED:
      return {
        ...state,
        loading: true,
      }
    case DrivetimebranchListActionTypes.DRIVETIMEBRANCH_LIST_FETCH_SUCCESS:
      return {
        ...state,
        rows: action.payload!.rows,
        loading: false,
        count: action.payload!.count,
      }
    case DrivetimebranchListActionTypes.DRIVETIMEBRANCH_LIST_FETCH_ERROR:
      return {
        ...state,
        loading: false,
        rows: []
      }
    case DrivetimebranchListActionTypes.DRIVETIMEBRANCH_LIST_DELETE_STARTED:
      return {
        ...state,
        loading: true
      }
    case DrivetimebranchListActionTypes.DRIVETIMEBRANCH_LIST_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case DrivetimebranchListActionTypes.DRIVETIMEBRANCH_LIST_DELETE_ERROR:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case DrivetimebranchListActionTypes.DRIVETIMEBRANCH_LIST_OPEN_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: true,
        idToDelete: action.payload.id,
      }
    case DrivetimebranchListActionTypes.DRIVETIMEBRANCH_LIST_CLOSE_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    default:
      return state;
  }
}
