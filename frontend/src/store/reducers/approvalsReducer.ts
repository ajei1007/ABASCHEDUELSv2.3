import moment from 'moment';
import {
  type RequestsAction,
  RequestsActionTypes,
  type RequestsState,
} from 'types/redux/approvals';

const initialState: RequestsState = {
  cancellationsRequestData: [],
  confirmationsRequestData: [],
  confirmationsRequestDataCount: 0,
  confirmationsRequestDataLoading: false,
  availabilitiesRequestData: [],
  timeoffRequestData: [],
  lateRequestData: [],
  selectedStartDate: moment().startOf('day').subtract(1, 'weeks').toDate(),
  selectedEndDate: moment().startOf('day').add(1, 'weeks').toDate(),
};

export default function approvalsReducer(
  state = initialState,
  action: RequestsAction,
): RequestsState {
  switch (action.type) {
    case RequestsActionTypes.SET_CANCELLATIONS_REQUEST_DATA:
      return {
        ...state,
        cancellationsRequestData: action.cancellationsRequestData,
      };
    case RequestsActionTypes.SET_CONFIRMATIONS_REQUEST_DATA:
      return {
        ...state,
        confirmationsRequestData: action.confirmationsRequestData,
        confirmationsRequestDataCount: action.confirmationsRequestDataCount,
        confirmationsRequestDataLoading: false,
      };
    case RequestsActionTypes.SET_AVAILABILITIES_REQUEST_DATA:
      return {
        ...state,
        availabilitiesRequestData: action.availabilitiesRequestData,
      };
    case RequestsActionTypes.SET_TIMEOFF_REQUEST_DATA:
      return {
        ...state,
        timeoffRequestData: action.timeoffRequestData,
      };
    case RequestsActionTypes.SET_LATE_REQUEST_DATA:
      return {
        ...state,
        lateRequestData: action.lateRequestData,
      };
    case RequestsActionTypes.SET_SELECTED_START_DATE:
      return {
        ...state,
        selectedStartDate: action.payload,
      };
    case RequestsActionTypes.SET_SELECTED_END_DATE:
      return {
        ...state,
        selectedEndDate: action.payload,
      };
    default:
      return state;
  }
}
