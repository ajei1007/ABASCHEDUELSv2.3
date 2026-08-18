import axios from 'axios';
import moment from 'moment';
import { fetchEvents, fetchStatistics } from 'store/slices/calendar/thunks';
import { RequestsActionTypes } from 'types/redux/approvals';

export const setCancellationsRequestData = (data: any) => {
  return {
    type: RequestsActionTypes.SET_CANCELLATIONS_REQUEST_DATA,
    cancellationsRequestData: data,
  };
};
export const setConfirmationsRequestData = (data: any) => {
  return {
    type: RequestsActionTypes.SET_CONFIRMATIONS_REQUEST_DATA,
    confirmationsRequestData: data,
    confirmationsRequestDataCount: data.length,
  };
};
export const setAvailabilitiesRequestData = (data: any) => {
  return {
    type: RequestsActionTypes.SET_AVAILABILITIES_REQUEST_DATA,
    availabilitiesRequestData: data,
  };
};
export const setTimeoffRequestData = (data: any) => {
  return {
    type: RequestsActionTypes.SET_TIMEOFF_REQUEST_DATA,
    timeoffRequestData: data,
  };
};
export const setLateRequestData = (data: any) => {
  return {
    type: RequestsActionTypes.SET_LATE_REQUEST_DATA,
    lateRequestData: data,
  };
};

export const setSelectedStartDate = (date: Date) => ({
  type: RequestsActionTypes.SET_SELECTED_START_DATE,
  payload: date,
});

export const setSelectedEndDate = (date: Date) => ({
  type: RequestsActionTypes.SET_SELECTED_END_DATE,
  payload: date,
});

const getFormattedRange = (getState: any) => {
  const timezone = getState().settings.settingValues.timezone;
  const { selectedStartDate, selectedEndDate } = getState().approvals;
  return {
    start: moment(selectedStartDate).tz(timezone).format('YYYY-MM-DD'),
    end: moment(selectedEndDate).tz(timezone).format('YYYY-MM-DD'),
  };
};

//Fetch Cancellations Request Data
export const fetchCancellationsRequestData = () => {
  return async (dispatch: any, getState: any) => {
    const { start, end } = getFormattedRange(getState);
    const branches = getState()
      .calendar.current_branches.map((y: any) => y.value)
      .join('|');

    const response = await axios.get('/statusevents/new', {
      params: {
        start,
        end,
        status: 'Pending Cancelation',
        branches,
      },
    });
    const data = response.data;
    dispatch(setCancellationsRequestData(data));
  };
};

//Fetch Cancellations Request Data
export const fetchConfirmationsRequestData = (filter: any) => {
  return async (dispatch: any, getState: any) => {
    const { start, end } = getFormattedRange(getState);
    const branches = getState()
      .calendar.current_branches.map((y: any) => y.value)
      .join('|');

    const response = await axios.get('/statusevents/confirmations', {
      params: {
        start,
        end,
        branches,
        filter,
      },
    });
    const data = response.data;
    dispatch(setConfirmationsRequestData(data));
  };
};
//Fetch Availabilities Request Data
export const fetchAvailabilitiesRequestData = () => {
  return async (dispatch: any, getState: any) => {
    const { start, end } = getFormattedRange(getState);
    const branches = getState()
      .calendar.current_branches.map((y: any) => y.value)
      .join('|');

    const response = await axios.get('/availabilities/resources/Resource', {
      params: {
        timeoff: 0,
        start,
        end,
        status: 'Pending',
        branches,
      },
    });
    const data = response.data.rows;
    dispatch(setAvailabilitiesRequestData(data));
  };
};
//Fetch Time off Request Data
export const fetchTimeOffRequestData = () => {
  return async (dispatch: any, getState: any) => {
    const { start, end } = getFormattedRange(getState);
    const branches = getState()
      .calendar.current_branches.map((y: any) => y.value)
      .join('|');

    const response = await axios.get('/availabilities/resources/Resource', {
      params: {
        timeoff: 1,
        start,
        end,
        status: 'Pending',
        branches,
      },
    });
    const data = response.data.rows;
    dispatch(setTimeoffRequestData(data));
  };
};
//fetch Late Request
export const fetchLateRequestData = () => {
  return async (dispatch: any, getState: any) => {
    const { start, end } = getFormattedRange(getState);
    const branches = getState()
      .calendar.current_branches.map((y: any) => y.value)
      .join('|');

    const response = await axios.get('/', {
      params: {
        start,
        end,
        status: 'Pending',
        branches,
      },
    });
    const data = response.data.rows;
    dispatch(setLateRequestData(data));
  };
};

//updateRequests
export const updateRequests = (data: any) => {
  return async () => {
    try {
      await axios.put('/availabilities/status/multiple', data);
    } catch (error) {
      console.log('error', error);
    }
  };
};
//updateCancellationRequests
export const updateCancellationRequests = (data: any) => {
  return async (dispatch: any, getState: any) => {
    try {
      await axios.put('/statusevents/status/multiple', data);
    } catch (error) {
      console.log('error', error);
    } finally {
      dispatch(
        fetchEvents({
          bol: false,
        }),
      );
      const statsViewEnabled =
        getState().settings.settingValues.statsViewEnabled;
      const calendarStart = getState().calendar.calendar_start;
      const calendarEnd = getState().calendar.calendar_end;
      if (statsViewEnabled) {
        dispatch(
          fetchStatistics({
            start: calendarStart,
            end: calendarEnd,
          }),
        );
      }
    }
  };
};
