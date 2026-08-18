import Errors from 'components/FormItems/error/errors';
import axios from 'axios';
import { RolesListActionTypes } from 'types/redux/roles/rolesList';
import { toast } from 'react-toastify';
import type { AppDispatch } from 'store';

async function list(filter: any, type: string) {
  const response = await axios.get(`/roles/resources/${type}`, {
    params: filter,
  });
  return response.data;
}

const actions = {
  doFetch:
    (filter: any, resourceType: string) => async (dispatch: AppDispatch) => {
      try {
        dispatch({
          type: RolesListActionTypes.ROLES_LIST_FETCH_STARTED,
          payload: { filter },
        });

        const response = await list(filter, resourceType);

        dispatch({
          type: RolesListActionTypes.ROLES_LIST_FETCH_SUCCESS,
          payload: {
            rows: response.rows,
            count: response.count,
          },
        });
      } catch (error: any) {
        Errors.handle(error);

        dispatch({
          type: RolesListActionTypes.ROLES_LIST_FETCH_ERROR,
        });
      }
    },

  doDelete: (id: string, resourceType: any) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: RolesListActionTypes.ROLES_LIST_DELETE_STARTED,
      });

      await axios.delete(`/roles/${id}`);

      dispatch({
        type: RolesListActionTypes.ROLES_LIST_DELETE_SUCCESS,
      });

      const response = await list({ page: 1, limit: 10 }, resourceType);
      toast.error('Deleted!');
      dispatch({
        type: RolesListActionTypes.ROLES_LIST_FETCH_SUCCESS,
        payload: {
          rows: response.rows,
          count: response.count,
        },
      });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: RolesListActionTypes.ROLES_LIST_DELETE_ERROR,
      });
    }
  },
  doOpenConfirm: (id: string) => async (dispatch: AppDispatch) => {
    dispatch({
      type: RolesListActionTypes.ROLES_LIST_OPEN_CONFIRM,
      payload: {
        id: id,
      },
    });
  },
  doCloseConfirm: () => async (dispatch: AppDispatch) => {
    dispatch({
      type: RolesListActionTypes.ROLES_LIST_CLOSE_CONFIRM,
    });
  },
};

export default actions;
