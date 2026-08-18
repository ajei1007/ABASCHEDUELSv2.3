// actions.ts
import {
  DELETE_REQUEST_STARTED,
  DELETE_REQUEST_SUCCESS,
  DELETE_REQUEST_FAILURE,
  UPDATE_REQUEST_STARTED,
  UPDATE_REQUEST_SUCCESS,
  UPDATE_REQUEST_FAILURE,
  CREATE_REQUEST_STARTED,
  CREATE_REQUEST_SUCCESS,
  CREATE_REQUEST_FAILURE,
  GET_AVAILABILITY_REQUESTS_FAILURE,
  GET_AVAILABILITY_REQUESTS_SUCCESS,
  GET_AVAILABILITY_REQUESTS_STARTED,
  GET_TIMEOFF_REQUESTS_STARTED,
  GET_TIMEOFF_REQUESTS_SUCCESS,
  GET_TIMEOFF_REQUESTS_FAILURE,
  SET_SELECTED_START_DATE,
  SET_SELECTED_END_DATE,
} from 'types/redux/requests';
import axios, { AxiosError } from 'axios';
import type { AppDispatch } from 'store';
import { toast } from 'react-toastify';
import moment from 'moment-timezone';

export const setSelectedStartDate = (date: Date) => ({
  type: SET_SELECTED_START_DATE as typeof SET_SELECTED_START_DATE,
  payload: date,
});

export const setSelectedEndDate = (date: Date) => ({
  type: SET_SELECTED_END_DATE as typeof SET_SELECTED_END_DATE,
  payload: date,
});

export const fetchRequests =
  (timeoff: 0 | 1) => async (dispatch: any, getState: any) => {
    const state = getState();
    const { id } = state.auth.currentUser;
    const timezone = state.settings.settingValues.timezone;
    const { selectedStartDate, selectedEndDate } = state.requests;

    if (timeoff === 1) {
      dispatch({ type: GET_TIMEOFF_REQUESTS_STARTED });
    } else {
      dispatch({ type: GET_AVAILABILITY_REQUESTS_STARTED });
    }

    try {
      const start = moment(selectedStartDate).tz(timezone).format('YYYY-MM-DD');
      const end = moment(selectedEndDate).tz(timezone).format('YYYY-MM-DD');

      const res = await axios.get(
        '/availabilities/request/resources/Resource',
        {
          params: { user: id, start, end, timeoff },
        },
      );
      const data = res.data.rows;

      if (timeoff === 1) {
        dispatch({
          type: GET_TIMEOFF_REQUESTS_SUCCESS,
          payload: data,
        });
      } else {
        dispatch({
          type: GET_AVAILABILITY_REQUESTS_SUCCESS,
          payload: data,
        });
      }
    } catch (err: any) {
      const message = err.message || 'Error fetching requests';
      if (timeoff === 1) {
        dispatch({
          type: GET_TIMEOFF_REQUESTS_FAILURE,
          payload: message,
        });
      } else {
        dispatch({
          type: GET_AVAILABILITY_REQUESTS_FAILURE,
          payload: message,
        });
      }
    }
  };

export const deleteRequest = (id: string) => async (dispatch: AppDispatch) => {
  dispatch({ type: DELETE_REQUEST_STARTED });
  try {
    await axios.delete(`/availabilities/${id}`);
    dispatch({ type: DELETE_REQUEST_SUCCESS });
  } catch (error: any) {
    dispatch({
      type: DELETE_REQUEST_FAILURE,
      payload: error.message || 'Delete failed',
    });
  }
};

export const updateRequest =
  (data: any): any =>
  async (dispatch: AppDispatch) => {
    dispatch({ type: UPDATE_REQUEST_STARTED });
    try {
      await axios.put(`/availabilities/request/${data.id}`, {
        data,
        id: data.id,
      });
      dispatch({
        type: UPDATE_REQUEST_SUCCESS,
      });
    } catch (error: any) {
      dispatch({
        type: UPDATE_REQUEST_FAILURE,
        payload: error.message || 'Update failed',
      });
    }
  };

export const createRequest = (data: any): any => {
  return async (dispatch: AppDispatch) => {
    dispatch({ type: CREATE_REQUEST_STARTED });

    try {
      const response = await axios.post(`/availabilities/request`, { data });
      dispatch({
        type: CREATE_REQUEST_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      dispatch({
        type: CREATE_REQUEST_FAILURE,
        payload: error.message,
      });
    }
  };
};

export const getAvailabilityRequests = (): any => {
  return async (dispatch: AppDispatch, getState: () => any) => {
    dispatch({ type: GET_AVAILABILITY_REQUESTS_STARTED });

    try {
      const data = await dispatch(fetchRequests(0));
      dispatch({
        type: GET_AVAILABILITY_REQUESTS_SUCCESS,
        payload: data,
      });
    } catch (error: any) {
      dispatch({
        type: GET_AVAILABILITY_REQUESTS_FAILURE,
        payload: error.message,
      });
    }
  };
};

export const getTimeOffRequests = (): any => {
  return async (dispatch: AppDispatch, getState: () => any) => {
    dispatch({ type: GET_TIMEOFF_REQUESTS_STARTED });

    try {
      const data = await dispatch(fetchRequests(1));
      dispatch({
        type: GET_TIMEOFF_REQUESTS_SUCCESS,
        payload: data,
      });
    } catch (error: any) {
      dispatch({
        type: GET_TIMEOFF_REQUESTS_FAILURE,
        payload: error.message,
      });
    }
  };
};

export const getRequestById = async (id: string) => {
  try {
    const res = await axios.get(`/availabilities/request/${id}`);
    const data = res.data;
    return data;
  } catch (error) {
    const err = error as AxiosError;
    const errMsg = err?.response?.data as any;
    if (errMsg) {
      toast.error(errMsg);
    }
  }
};
