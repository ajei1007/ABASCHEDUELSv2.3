import {
  type CustomListState,
  type CustomListAction,
  CustomListActionTypes,
} from 'types/redux/custom/customList';

const initialData: CustomListState = {
  rows: [],
  loading: false,
  count: 0,
  modalOpen: false,
  idToDelete: null,
};

export default function customListReducers(state = initialData, action: CustomListAction): CustomListState {
  switch (action.type) {
    case CustomListActionTypes.CUSTOM_LIST_FILTERED:
      return {
        ...state,
        rows: action.payload!.rows,
        loading: false,
      }
    case CustomListActionTypes.CUSTOM_LIST_FETCH_STARTED:
      return {
        ...state,
        loading: true,
      }
    case CustomListActionTypes.CUSTOM_LIST_FETCH_SUCCESS:
      return {
        ...state,
        rows: action.payload!.rows,
        loading: false,
        count: action.payload!.count,
      }
    case CustomListActionTypes.CUSTOM_LIST_FETCH_ERROR:
      return {
        ...state,
        loading: false,
        rows: []
      }
    case CustomListActionTypes.CUSTOM_LIST_DELETE_STARTED:
      return {
        ...state,
        loading: true
      }
    case CustomListActionTypes.CUSTOM_LIST_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case CustomListActionTypes.CUSTOM_LIST_DELETE_ERROR:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case CustomListActionTypes.CUSTOM_LIST_OPEN_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: true,
        idToDelete: action.payload.id,
      }
    case CustomListActionTypes.CUSTOM_LIST_CLOSE_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    default:
      return state;
  }
}
