import Errors from 'components/FormItems/error/errors';
import axios from 'axios';
import { FounderServiceLinesListActionTypes } from 'types/redux/founderServiceLines/founderServiceLinesList';
import { toast } from 'react-toastify';
import type { AppDispatch } from 'store';

async function list(filter: any) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const response = await axios.get(`/founderServiceLines`, { params: filter });
  return { rows: [], count: 0 };
}

const actions = {
  doFetch: (filter: any) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: FounderServiceLinesListActionTypes.FOUNDER_SERVICE_LINES_LIST_FETCH_STARTED,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const response = await list(filter);

      dispatch({
        type: FounderServiceLinesListActionTypes.FOUNDER_SERVICE_LINES_LIST_FETCH_SUCCESS,
        payload: {
          rows: [],
          count: 0,
        },
      });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: FounderServiceLinesListActionTypes.FOUNDER_SERVICE_LINES_LIST_FETCH_ERROR,
      });
    }
  },

  doDelete: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: FounderServiceLinesListActionTypes.FOUNDER_SERVICE_LINES_LIST_DELETE_STARTED,
      });

      await axios.delete(`/founderServiceLines/${id}`);

      dispatch({
        type: FounderServiceLinesListActionTypes.FOUNDER_SERVICE_LINES_LIST_DELETE_SUCCESS,
      });

      const response = await list({ page: 1, limit: 10 });
      toast.error('Deleted!');
      dispatch({
        type: FounderServiceLinesListActionTypes.FOUNDER_SERVICE_LINES_LIST_FETCH_SUCCESS,
        payload: {
          rows: response.rows,
          count: response.count,
        },
      });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: FounderServiceLinesListActionTypes.FOUNDER_SERVICE_LINES_LIST_DELETE_ERROR,
      });
    }
  },
  doOpenConfirm: (id: string) => async (dispatch: AppDispatch) => {
    dispatch({
      type: FounderServiceLinesListActionTypes.FOUNDER_SERVICE_LINES_LIST_OPEN_CONFIRM,
      payload: {
        id: id,
      },
    });
  },
  doCloseConfirm: () => async (dispatch: AppDispatch) => {
    dispatch({
      type: FounderServiceLinesListActionTypes.FOUNDER_SERVICE_LINES_LIST_CLOSE_CONFIRM,
    });
  },
};

export default actions;
