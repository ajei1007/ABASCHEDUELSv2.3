import {
  type AvailabilitiesListState,
  type AvailabilitiesListAction,
  AvailabilitiesListActionTypes,
} from 'types/redux/availabilities/availabilitiesList';

const initialData: AvailabilitiesListState = {
  rows: [],
  loading: false,
  count: 0,
  modalOpen: false,
  idToDelete: null,
};

const reducer = (state = initialData, action: AvailabilitiesListAction): AvailabilitiesListState => {
  switch (action.type) {
    case AvailabilitiesListActionTypes.AVAILABILITIES_LIST_FETCH_STARTED:
      return {
        ...state,
        loading: true,
      }
    case AvailabilitiesListActionTypes.AVAILABILITIES_LIST_FETCH_SUCCESS:
      return {
        ...state,
        rows: action.payload!.rows,
        loading: false,
        count: action.payload!.count,
      }
    case AvailabilitiesListActionTypes.AVAILABILITIES_LIST_FETCH_ERROR:
      return {
        ...state,
        loading: false,
        rows: []
      }
    case AvailabilitiesListActionTypes.AVAILABILITIES_LIST_DELETE_STARTED:
      return {
        ...state,
        loading: true
      }
    case AvailabilitiesListActionTypes.AVAILABILITIES_LIST_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case AvailabilitiesListActionTypes.AVAILABILITIES_LIST_DELETE_ERROR:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case AvailabilitiesListActionTypes.AVAILABILITIES_LIST_OPEN_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: true,
        idToDelete: action.payload.id,
      }
    case AvailabilitiesListActionTypes.AVAILABILITIES_LIST_CLOSE_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    default:
      return state;
  }
}

export default reducer;