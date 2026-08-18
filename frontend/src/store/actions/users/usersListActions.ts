import Errors from 'components/FormItems/error/errors';
import axios from 'axios';
import {
  UsersListActionTypes,
  type UsersAddress,
} from 'types/redux/users/usersList';
import { toast } from 'react-toastify';
import type { AppDispatch } from 'store';

async function list(filter: any, type: string) {
  const response = await axios.get(`/users/resources/${type}`, {
    params: filter,
  });
  return response.data;
}

const actions = {
  doFetch:
    (filter: any, type: string) =>
    async (dispatch: AppDispatch) => {
      try {
        dispatch({
          type: UsersListActionTypes.USERS_LIST_FETCH_STARTED,
          payload: { filter },
        });

        const response = await list(filter, type);

        dispatch({
          type: UsersListActionTypes.USERS_LIST_FETCH_SUCCESS,
          payload: {
            rows: response.rows,
            count: response.count,
          },
        });
      } catch (error: any) {
        Errors.handle(error);

        dispatch({
          type: UsersListActionTypes.USERS_LIST_FETCH_ERROR,
        });
      }
    },

  doDelete:
    (id: string, deleteEvents: boolean = false, deleteEventsFromDate?: any) => async (dispatch: AppDispatch) => {
      try {
        dispatch({
          type: UsersListActionTypes.USERS_LIST_DELETE_STARTED,
        });

        await axios.delete(`/users/${id}`, { params: { deleteEvents, deleteEventsFromDate  } });

        dispatch({
          type: UsersListActionTypes.USERS_LIST_DELETE_SUCCESS,
          payload: {
            id,
          },
        });

        toast.error('Deleted!');
        
        // const response = await list({ page: 1, limit: 10 }, type);
        // dispatch({
        //   type: UsersListActionTypes.USERS_LIST_FETCH_SUCCESS,
        //   payload: {
        //     rows: response.rows,
        //     count: response.count,
        //   },
        // });
      } catch (error: any) {
        Errors.handle(error);

        dispatch({
          type: UsersListActionTypes.USERS_LIST_DELETE_ERROR,
        });
      }
    },
  doOpenConfirm: (id: string) => async (dispatch: AppDispatch) => {
    dispatch({
      type: UsersListActionTypes.USERS_LIST_OPEN_CONFIRM,
      payload: {
        id: id,
      },
    });
  },
  doCloseConfirm: () => async (dispatch: AppDispatch) => {
    dispatch({
      type: UsersListActionTypes.USERS_LIST_CLOSE_CONFIRM,
    });
  },
  doAddUserAddress: (address: UsersAddress) => (dispatch: AppDispatch) => {
    dispatch({
      type: UsersListActionTypes.USERS_ADD_ADDRESS,
      payload: address,
    });
  },
};

export default actions;
