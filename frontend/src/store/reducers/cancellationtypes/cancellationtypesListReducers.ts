/* eslint-disable import/no-anonymous-default-export */
import {
  type CancellationtypesListState,
  type CancellationtypesListAction,
  CancellationtypesListActionTypes,
} from 'types/redux/cancellationtypes/cancellationtypesList';

const initialData: CancellationtypesListState = {
  rows: [],
  loading: false,
  count: 0,
  modalOpen: false,
  idToDelete: null,
};

export default (state = initialData, action: CancellationtypesListAction): CancellationtypesListState => {
  switch (action.type) {
    case CancellationtypesListActionTypes.CANCELLATIONTYPES_LIST_FETCH_STARTED:
      return {
        ...state,
        loading: true,
      }
    case CancellationtypesListActionTypes.CANCELLATIONTYPES_LIST_FETCH_SUCCESS:
      return {
        ...state,
        rows: action.payload!.rows,
        loading: false,
        count: action.payload!.count,
      }
    case CancellationtypesListActionTypes.CANCELLATIONTYPES_LIST_FETCH_ERROR:
      return {
        ...state,
        loading: false,
        rows: []
      }
    case CancellationtypesListActionTypes.CANCELLATIONTYPES_LIST_DELETE_STARTED:
      return {
        ...state,
        loading: true
      }
    case CancellationtypesListActionTypes.CANCELLATIONTYPES_LIST_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case CancellationtypesListActionTypes.CANCELLATIONTYPES_LIST_DELETE_ERROR:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case CancellationtypesListActionTypes.CANCELLATIONTYPES_LIST_OPEN_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: true,
        idToDelete: action.payload.id,
      }
    case CancellationtypesListActionTypes.CANCELLATIONTYPES_LIST_CLOSE_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    default:
      return state;
  }
}
