import Errors from 'components/FormItems/error/errors';
import axios from 'axios';
import { DrivetimebranchListActionTypes } from "types/redux/drivetimebranch/drivetimebranchList";
import { toast } from 'react-toastify';
import type { AppDispatch } from 'store';

async function list(filter?: any) {
  const response = await axios.get(
    `/drivetimebranch`, {
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
        type: DrivetimebranchListActionTypes.DRIVETIMEBRANCH_LIST_FETCH_STARTED,
      });

      const response = await list(filter);

      dispatch({
        type: DrivetimebranchListActionTypes.DRIVETIMEBRANCH_LIST_FETCH_SUCCESS,
        payload: {
          rows: response.rows,
          count: response.count,
        },
      });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: DrivetimebranchListActionTypes.DRIVETIMEBRANCH_LIST_FETCH_ERROR,
      });
    }
  },

  doDelete: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: DrivetimebranchListActionTypes.DRIVETIMEBRANCH_LIST_DELETE_STARTED,
      });

      await axios.delete(`/drivetimebranch/${id}`)

      dispatch({
        type: DrivetimebranchListActionTypes.DRIVETIMEBRANCH_LIST_DELETE_SUCCESS,
      });

      const response = await list({page:1});
      toast.error('Deleted!');
      dispatch({
        type: DrivetimebranchListActionTypes.DRIVETIMEBRANCH_LIST_FETCH_SUCCESS,
        payload: {
          rows: response.rows,
          count: response.count,
        },
      });

    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: DrivetimebranchListActionTypes.DRIVETIMEBRANCH_LIST_DELETE_ERROR,
      });
    }
  },
  doOpenConfirm: (id: string) => async (dispatch: AppDispatch) => {
    dispatch({
      type: DrivetimebranchListActionTypes.DRIVETIMEBRANCH_LIST_OPEN_CONFIRM,
      payload: {
        id: id
      },
    });
  },
  doCloseConfirm: () => async (dispatch: AppDispatch) => {
    dispatch({
      type: DrivetimebranchListActionTypes.DRIVETIMEBRANCH_LIST_CLOSE_CONFIRM,
    });
  },
};


export default actions;
