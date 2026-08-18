import Errors from 'components/FormItems/error/errors';
import axios from 'axios';
import { CapacityconstraintsListActionTypes } from 'types/redux/capacityconstraints/capacityconstraintsList';
import { toast } from 'react-toastify';
import type { AppDispatch } from 'store';

async function list(filter: any) {
  const response = await axios.get(`/capacityconstraints`, { params: filter });
  return response.data;
}

const actions = {
  doFetch: (filter: any) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: CapacityconstraintsListActionTypes.CAPACITYCONSTRAINTS_LIST_FETCH_STARTED,
      });
      const response = await list(filter);

      dispatch({
        type: CapacityconstraintsListActionTypes.CAPACITYCONSTRAINTS_LIST_FETCH_SUCCESS,
        payload: {
          rows: response.rows,
          count: response.count,
        },
      });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: CapacityconstraintsListActionTypes.CAPACITYCONSTRAINTS_LIST_FETCH_ERROR,
      });
    }
  },

  doDelete: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: CapacityconstraintsListActionTypes.CAPACITYCONSTRAINTS_LIST_DELETE_STARTED,
      });

      await axios.delete(`/capacityconstraints/${id}`);

      dispatch({
        type: CapacityconstraintsListActionTypes.CAPACITYCONSTRAINTS_LIST_DELETE_SUCCESS,
      });

      const response = await list({ page: 1, limit: 10 });
      toast.error('Deleted!');
      dispatch({
        type: CapacityconstraintsListActionTypes.CAPACITYCONSTRAINTS_LIST_FETCH_SUCCESS,
        payload: {
          rows: response.rows,
          count: response.count,
        },
      });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: CapacityconstraintsListActionTypes.CAPACITYCONSTRAINTS_LIST_DELETE_ERROR,
      });
    }
  },
  doOpenConfirm: (id: string) => async (dispatch: AppDispatch) => {
    dispatch({
      type: CapacityconstraintsListActionTypes.CAPACITYCONSTRAINTS_LIST_OPEN_CONFIRM,
      payload: {
        id: id,
      },
    });
  },
  doCloseConfirm: () => async (dispatch: AppDispatch) => {
    dispatch({
      type: CapacityconstraintsListActionTypes.CAPACITYCONSTRAINTS_LIST_CLOSE_CONFIRM,
    });
  },
};

export default actions;
