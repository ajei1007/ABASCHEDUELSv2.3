// requestsReducer.ts
import moment from 'moment';
import {
  GET_AVAILABILITY_REQUESTS_STARTED,
  GET_AVAILABILITY_REQUESTS_SUCCESS,
  GET_AVAILABILITY_REQUESTS_FAILURE,
  type RequestsActionTypes,
  GET_TIMEOFF_REQUESTS_STARTED,
  GET_TIMEOFF_REQUESTS_SUCCESS,
  GET_TIMEOFF_REQUESTS_FAILURE,
  DELETE_REQUEST_STARTED,
  DELETE_REQUEST_SUCCESS,
  DELETE_REQUEST_FAILURE,
  SET_SELECTED_START_DATE,
  SET_SELECTED_END_DATE,
} from 'types/redux/requests';

interface RequestsState {
  availabilityLoading: boolean;
  availabilityRequests?: any[];
  availabilityError: string | null;

  timeoffLoading: boolean;
  timeoffRequests?: any[];
  timeoffError: string | null;
  isDeleting: boolean;
  error: string | null;
  selectedStartDate: Date | null;
  selectedEndDate: Date | null;
}

const initialState: RequestsState = {
  availabilityLoading: false,
  availabilityRequests: [],
  availabilityError: null,
  timeoffLoading: false,
  timeoffRequests: [],
  timeoffError: null,
  isDeleting: false,
  error: null,
  selectedStartDate: moment().startOf('day').subtract(1, 'weeks').toDate(),
  selectedEndDate: moment().startOf('day').add(1, 'weeks').toDate(),
};

const requestsReducer = (
  state = initialState,
  action: RequestsActionTypes,
): RequestsState => {
  switch (action.type) {
    // Availability Requests Cases
    case GET_AVAILABILITY_REQUESTS_STARTED:
      return {
        ...state,
        availabilityLoading: true,
        availabilityError: null,
      };
    case GET_AVAILABILITY_REQUESTS_SUCCESS:
      return {
        ...state,
        availabilityLoading: false,
        availabilityRequests: action.payload,
      };
    case GET_AVAILABILITY_REQUESTS_FAILURE:
      return {
        ...state,
        availabilityLoading: false,
        availabilityError: action.payload,
      };
    case GET_TIMEOFF_REQUESTS_STARTED:
      return {
        ...state,
        timeoffLoading: true,
        timeoffError: null,
      };
    case GET_TIMEOFF_REQUESTS_SUCCESS:
      return {
        ...state,
        timeoffLoading: false,
        timeoffRequests: action.payload,
      };
    case GET_TIMEOFF_REQUESTS_FAILURE:
      return {
        ...state,
        timeoffLoading: false,
        timeoffError: action.payload,
      };
    case DELETE_REQUEST_STARTED:
      return {
        ...state,
        isDeleting: true,
        error: null,
      };

    case DELETE_REQUEST_SUCCESS:
      return {
        ...state,
        isDeleting: false,
      };

    case DELETE_REQUEST_FAILURE:
      return {
        ...state,
        isDeleting: false,
        error: action.payload || 'Delete failed',
      };
    case SET_SELECTED_START_DATE:
      return {
        ...state,
        selectedStartDate: action.payload,
      };
    case SET_SELECTED_END_DATE:
      return {
        ...state,
        selectedEndDate: action.payload,
      };
    default:
      return state;
  }
};

export default requestsReducer;
