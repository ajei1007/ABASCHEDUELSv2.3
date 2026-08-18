import axios from 'axios';
import Errors from 'components/FormItems/error/errors';
import { toast } from 'react-toastify';
import { router } from 'router';
import { UsersFormActionTypes } from 'types/redux/users/usersForm';
import type { AppDispatch } from 'store';

const actions = {
  doNew: () => {
    return {
      type: UsersFormActionTypes.USERS_FORM_RESET,
    };
  },

  doFind: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: UsersFormActionTypes.USERS_FORM_FIND_STARTED,
      });
      const response = await axios.get(`/users/${id}?cache=false`);
      const record = response.data;
      
        dispatch({
          type: UsersFormActionTypes.USERS_FORM_FIND_SUCCESS,
          payload: record,
        });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: UsersFormActionTypes.USERS_FORM_FIND_ERROR,
      });

      router.navigate('/admin/users');
    }
  },

  doCreate:
    (values: any, resources: any) =>
    async (dispatch: AppDispatch) => {
      dispatch({
        type: UsersFormActionTypes.USERS_FORM_CREATE_STARTED,
      });

      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const response = await axios.post('/users', { data: values });
        dispatch({
          type: UsersFormActionTypes.USERS_FORM_CREATE_SUCCESS,
        });
    
        toast.success('User created');
        router.navigate(`/admin/users/resources/${resources}`);
    
      } catch (error: any) {
        const msg = error?.response?.data;
        if (msg) {
          toast.error(msg);
        } else {
          toast.error('Something went wrong. Try again');
        }
    
        dispatch({
          type: UsersFormActionTypes.USERS_FORM_CREATE_ERROR,
        });
      }
    },

  doUpdate:
    (id: string, values: any, isProfile: boolean, resources: string, onClose?: any) =>
    async (dispatch: AppDispatch) => {
      try {
        dispatch({
          type: UsersFormActionTypes.USERS_FORM_UPDATE_STARTED,
        });

        await axios.put(`/users/${id}`, { id, data: values });

        dispatch({
          type: UsersFormActionTypes.USERS_FORM_UPDATE_SUCCESS,
          payload: { id, resources, data: values },
        });

        if (isProfile) {
          toast.success('Profile updated');
        } else {
          toast.success('Users updated');
          if (onClose) {
            return onClose()
          }
          return router.navigate(`/admin/users/resources/${resources}`);
        }
      } catch (error: any) {
        // Errors.handle(error);

        const msg = error?.response?.data;
        if (msg) {
          toast.error(msg);
        } else {
          toast.error("Something went wrong. Try again");
        }

        dispatch({
          type: UsersFormActionTypes.USERS_FORM_UPDATE_ERROR,
        });
      }
    },
};

export default actions;