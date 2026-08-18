import Errors from 'components/FormItems/error/errors';
import axios from 'axios';
import {
  AvailabilitiesListActionTypes,
} from 'types/redux/availabilities/availabilitiesList';
import { toast } from 'react-toastify';
import type { AppDispatch } from 'store';


async function list(filter?: any, type?: string) {
  const response = await axios.get(
    `/availabilities/resources/${type}`, {
      params: filter,
    }
  );
  return response.data;
}

const actions = {
  doFetch: (filter: any, type: any ) => async (
    dispatch: AppDispatch,
  ) => {
    try {
      dispatch({
        type: AvailabilitiesListActionTypes.AVAILABILITIES_LIST_FETCH_STARTED,
        payload: { filter },
      });

      const response = await list(filter, type);

      dispatch({
        type: AvailabilitiesListActionTypes.AVAILABILITIES_LIST_FETCH_SUCCESS,
        payload: {
          rows: response.rows,
          count: response.count,
        },
      });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: AvailabilitiesListActionTypes.AVAILABILITIES_LIST_FETCH_ERROR,
      });
    }
  },

  doDelete: (id: string,resource_type:any) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: AvailabilitiesListActionTypes.AVAILABILITIES_LIST_DELETE_STARTED,
      });

      await axios.delete(`/availabilities/${id}`)

      dispatch({
        type: AvailabilitiesListActionTypes.AVAILABILITIES_LIST_DELETE_SUCCESS,
      });

      const response = await list({ page: 1, limit: 10 }, resource_type);
      
      toast.success('Availabilit Deleted!');

      dispatch({
        type: AvailabilitiesListActionTypes.AVAILABILITIES_LIST_FETCH_SUCCESS,
        payload: {
          rows: response.rows,
          count: response.count,
        },
      });

    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: AvailabilitiesListActionTypes.AVAILABILITIES_LIST_DELETE_ERROR,
      });
    }
  },
  doOpenConfirm: (id: string) => async (dispatch: AppDispatch) => {
    dispatch({
      type: AvailabilitiesListActionTypes.AVAILABILITIES_LIST_OPEN_CONFIRM,
      payload: {
        id: id
      },
    });
  },
  doCloseConfirm: () => async (dispatch: AppDispatch) => {
    dispatch({
      type: AvailabilitiesListActionTypes.AVAILABILITIES_LIST_CLOSE_CONFIRM,
    });
  },
};


export default actions;
