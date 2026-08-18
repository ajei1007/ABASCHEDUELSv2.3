/* eslint-disable import/no-anonymous-default-export */
import {
  type CapacityconstraintsListState,
  type CapacityconstraintsListAction,
  CapacityconstraintsListActionTypes,
} from 'types/redux/capacityconstraints/capacityconstraintsList';

const initialData: CapacityconstraintsListState = {
  rows: [],
  loading: false,
  count: 0,
  modalOpen: false,
  idToDelete: null,
};

export default (state = initialData, action: CapacityconstraintsListAction): CapacityconstraintsListState => {
  switch (action.type) {
    case CapacityconstraintsListActionTypes.CAPACITYCONSTRAINTS_LIST_FETCH_STARTED:
      return {
        ...state,
        loading: true,
      }
    case CapacityconstraintsListActionTypes.CAPACITYCONSTRAINTS_LIST_FETCH_SUCCESS:
      return {
        ...state,
        rows: action.payload!.rows,
        loading: false,
        count: action.payload!.count,
      }
    case CapacityconstraintsListActionTypes.CAPACITYCONSTRAINTS_LIST_FETCH_ERROR:
      return {
        ...state,
        loading: false,
        rows: []
      }
    case CapacityconstraintsListActionTypes.CAPACITYCONSTRAINTS_LIST_DELETE_STARTED:
      return {
        ...state,
        loading: true
      }
    case CapacityconstraintsListActionTypes.CAPACITYCONSTRAINTS_LIST_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case CapacityconstraintsListActionTypes.CAPACITYCONSTRAINTS_LIST_DELETE_ERROR:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case CapacityconstraintsListActionTypes.CAPACITYCONSTRAINTS_LIST_OPEN_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: true,
        idToDelete: action.payload.id,
      }
    case CapacityconstraintsListActionTypes.CAPACITYCONSTRAINTS_LIST_CLOSE_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    default:
      return state;
  }
}
