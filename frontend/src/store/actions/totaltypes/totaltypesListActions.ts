import Errors from 'components/FormItems/error/errors';
import axios from 'axios';
import { TotaltypesListActionTypes } from 'types/redux/totaltypes/totaltypesList';
import type { AppDispatch } from 'store';

async function list(filter: any) {
  const response = await axios.get(
    `/totaltypes`,
    { params: filter }
  );
  return response.data;
}

const actions = {
  doFetch: (filter: any) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: TotaltypesListActionTypes.TOTALTYPES_LIST_FETCH_STARTED,
        payload: { filter },
      });

      const response = await list(filter);

      dispatch({
        type: TotaltypesListActionTypes.TOTALTYPES_LIST_FETCH_SUCCESS,
        payload: {
          rows: response.rows,
          count: response.count,
        },
      });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: TotaltypesListActionTypes.TOTALTYPES_LIST_FETCH_ERROR,
      });
    }
  },

  doDelete: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: TotaltypesListActionTypes.TOTALTYPES_LIST_DELETE_STARTED,
      });

      await axios.delete(`/totaltypes/${id}`);

      dispatch({
        type: TotaltypesListActionTypes.TOTALTYPES_LIST_DELETE_SUCCESS,
      });

      const response = await list({ page: 1, limit: 10 });
      dispatch({
        type: TotaltypesListActionTypes.TOTALTYPES_LIST_FETCH_SUCCESS,
        payload: {
          rows: response.rows,
          count: response.count,
        },
      });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: TotaltypesListActionTypes.TOTALTYPES_LIST_DELETE_ERROR,
      });
    }
  },
  doOpenConfirm: (id: string) => async (dispatch: AppDispatch) => {
    dispatch({
      type: TotaltypesListActionTypes.TOTALTYPES_LIST_OPEN_CONFIRM,
      payload: {
        id: id,
      },
    });
  },
  doCloseConfirm: () => async (dispatch: AppDispatch) => {
    dispatch({
      type: TotaltypesListActionTypes.TOTALTYPES_LIST_CLOSE_CONFIRM,
    });
  },
};

export default actions;
