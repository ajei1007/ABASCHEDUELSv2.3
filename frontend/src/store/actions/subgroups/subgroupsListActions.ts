import Errors from 'components/FormItems/error/errors';
import axios from 'axios';
import { SubgroupsListActionTypes } from 'types/redux/subgroups/subgroupsList';
import { toast } from 'react-toastify';
import type { AppDispatch } from 'store';

async function list(filter: any, type: string) {
  const response = await axios.get(`/subgroups/groupings/${type}`, {
    params: filter
  });
  return response.data;
}

const actions = {
  doFetch: (filter: any, group_type: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: SubgroupsListActionTypes.SUBGROUPS_LIST_FETCH_STARTED,
        payload: { filter },
      });

      const response = await list(filter, group_type);

      dispatch({
        type: SubgroupsListActionTypes.SUBGROUPS_LIST_FETCH_SUCCESS,
        payload: {
          rows: response.rows,
          count: response.count,
        },
      });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: SubgroupsListActionTypes.SUBGROUPS_LIST_FETCH_ERROR,
      });
    }
  },

  doDelete: (id: string, group_type: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: SubgroupsListActionTypes.SUBGROUPS_LIST_DELETE_STARTED,
      });

      await axios.delete(`/subgroups/${id}`);

      dispatch({
        type: SubgroupsListActionTypes.SUBGROUPS_LIST_DELETE_SUCCESS,
      });

      const response = await list({ page: 1, limit: 10 }, group_type);
      toast.error('Deleted!');
      dispatch({
        type: SubgroupsListActionTypes.SUBGROUPS_LIST_FETCH_SUCCESS,
        payload: {
          rows: response.rows,
          count: response.count,
        },
      });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: SubgroupsListActionTypes.SUBGROUPS_LIST_DELETE_ERROR,
      });
    }
  },
  doOpenConfirm: (id: string) => async (dispatch: AppDispatch) => {
    dispatch({
      type: SubgroupsListActionTypes.SUBGROUPS_LIST_OPEN_CONFIRM,
      payload: {
        id: id,
      },
    });
  },
  doCloseConfirm: () => async (dispatch: AppDispatch) => {
    dispatch({
      type: SubgroupsListActionTypes.SUBGROUPS_LIST_CLOSE_CONFIRM,
    });
  },
};

export default actions;
