import Errors from 'components/FormItems/error/errors';
import axios from 'axios';
import { CustomListActionTypes } from 'types/redux/custom/customList';
import { toast } from 'react-toastify';
import type { AppDispatch } from 'store';

export async function list(filter?: any) {
  const response = await axios.get('/newconstraintgenerator/table', {
    params: filter
  });
  console.log('response.data', response.data);
  return response.data;
}

const actions = {
  doFetch: (filter: any, keepPagination = false) => async (
    dispatch: AppDispatch,
  ) => {
    try {
      dispatch({
        type: CustomListActionTypes.CUSTOM_LIST_FETCH_STARTED,
        payload: { filter, keepPagination },
      });

      const response = await list(filter);

      dispatch({
        type: CustomListActionTypes.CUSTOM_LIST_FETCH_SUCCESS,
        payload: {
          rows: response.rows,
          count: response.count,
        },
      });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: CustomListActionTypes.CUSTOM_LIST_FETCH_ERROR,
      });
    }
  },

  doDelete: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: CustomListActionTypes.CUSTOM_LIST_DELETE_STARTED,
      });

      await axios.delete(`/newconstraintgenerator/${id}`)

      dispatch({
        type: CustomListActionTypes.CUSTOM_LIST_DELETE_SUCCESS,
      });

      toast.error('Deleted!');
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: CustomListActionTypes.CUSTOM_LIST_DELETE_ERROR,
      });
    }
  },
  doOpenConfirm: (id: string) => async (dispatch: AppDispatch) => {
    dispatch({
      type: CustomListActionTypes.CUSTOM_LIST_OPEN_CONFIRM,
      payload: {
        id: id
      },
    });
  },
  doCloseConfirm: () => async (dispatch: AppDispatch) => {
    dispatch({
      type: CustomListActionTypes.CUSTOM_LIST_CLOSE_CONFIRM,
    });
  },
};


export default actions;
