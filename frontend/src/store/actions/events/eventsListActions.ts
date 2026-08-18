import Errors from 'components/FormItems/error/errors';
import axios from 'axios';
import {
  EventsListActionTypes,
} from 'types/redux/events/eventsList';
import { toast } from 'react-toastify';
import getWeekdaysInRange from 'utils/getWeekdaysInRange';
import moment from 'moment';
import type { AppDispatch } from 'store';

export async function list(filter?: any) {
  if (filter.start && filter.end) {
    const weekdays = getWeekdaysInRange(filter.start, filter.end);
    filter.weekdays = weekdays.join('|')
  }
  if (filter.end) {
    filter.end = moment(filter.end).add(1, 'day').format('YYYY-MM-DD');
  }
  if (filter.firstName) {
    filter.lastName = filter.firstName
  }
  const response = await axios.get(
    '/events', {
      params: filter,
    }
  );
  return response.data;
}

const actions = {
  doFetch: (filter: any) => async (
    dispatch: AppDispatch,
  ) => {
    try {
      dispatch({
        type: EventsListActionTypes.EVENTS_LIST_FETCH_STARTED,
      });

      const response = await list(filter);

      dispatch({
        type: EventsListActionTypes.EVENTS_LIST_FETCH_SUCCESS,
        payload: {
          rows: response.rows,
          count: response.count,
        },
      });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: EventsListActionTypes.EVENTS_LIST_FETCH_ERROR,
      });
    }
  },

  doDelete: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: EventsListActionTypes.EVENTS_LIST_DELETE_STARTED,
      });

      await axios.delete(`/events/${id}`)

      dispatch({
        type: EventsListActionTypes.EVENTS_LIST_DELETE_SUCCESS,
      });
      
      const response = await list({page:1});toast.error('Deleted!');
      dispatch({
        type: EventsListActionTypes.EVENTS_LIST_FETCH_SUCCESS,
        payload: {
          rows: response.rows,
          count: response.count,
        },
      });
      
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: EventsListActionTypes.EVENTS_LIST_DELETE_ERROR,
      });
    }
  },
  doOpenConfirm: (id: string) => async (dispatch: AppDispatch) => {
    dispatch({
      type: EventsListActionTypes.EVENTS_LIST_OPEN_CONFIRM,
      payload: {
        id: id
      },
    });
  },
  doCloseConfirm: () => async (dispatch: AppDispatch) => {
    dispatch({
      type: EventsListActionTypes.EVENTS_LIST_CLOSE_CONFIRM,
    });
  },
};


export default actions;
