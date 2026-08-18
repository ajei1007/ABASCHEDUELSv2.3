import Errors from 'components/FormItems/error/errors';
import axios from 'axios';
import { MobiletokensListActionTypes } from "types/redux/mobiletokens/mobiletokensList";
import type { AppDispatch } from 'store';

async function list(filter?: any) {
  const response = await axios.get(
    `/mobiletokens`, {
      params: filter
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
        type: MobiletokensListActionTypes.MOBILETOKENS_LIST_FETCH_STARTED,
      });

      const response = await list(filter);

      dispatch({
        type: MobiletokensListActionTypes.MOBILETOKENS_LIST_FETCH_SUCCESS,
        payload: {
          rows: response.rows,
          count: response.count,
        },
      });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: MobiletokensListActionTypes.MOBILETOKENS_LIST_FETCH_ERROR,
      });
    }
  },

  doDelete: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: MobiletokensListActionTypes.MOBILETOKENS_LIST_DELETE_STARTED,
      });

      await axios.delete(`/mobiletokens/${id}`)

      dispatch({
        type: MobiletokensListActionTypes.MOBILETOKENS_LIST_DELETE_SUCCESS,
      });

      const response = await list();
      dispatch({
        type: MobiletokensListActionTypes.MOBILETOKENS_LIST_FETCH_SUCCESS,
        payload: {
          rows: response.rows,
          count: response.count,
        },
      });

    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: MobiletokensListActionTypes.MOBILETOKENS_LIST_DELETE_ERROR,
      });
    }
  },
  doOpenConfirm: (id: string) => async (dispatch: AppDispatch) => {
    dispatch({
      type: MobiletokensListActionTypes.MOBILETOKENS_LIST_OPEN_CONFIRM,
      payload: {
        id: id
      },
    });
  },
  doCloseConfirm: () => async (dispatch: AppDispatch) => {
    dispatch({
      type: MobiletokensListActionTypes.MOBILETOKENS_LIST_CLOSE_CONFIRM,
    });
  },
};


export default actions;
