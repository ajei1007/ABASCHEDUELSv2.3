import axios from 'axios';
import Errors from 'components/FormItems/error/errors';
import { toast } from 'react-toastify';
import { UsersFormActionTypes } from "types/redux/users/usersForm";
import { router } from 'router';
import type { AppDispatch } from 'store';

const actions = {
  doChangePassword: ({newPassword, currentPassword}: any) => async (
    dispatch: AppDispatch
  ) => {
    try {
      dispatch({
        type: UsersFormActionTypes.USERS_FORM_CREATE_STARTED,
      });
      await axios.put('/auth/password-update', {newPassword, currentPassword})
      dispatch({
        type: UsersFormActionTypes.USERS_FORM_UPDATE_SUCCESS,
      });

      toast.success('Password has been updated');
      router.navigate('/app/dashboard');
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: UsersFormActionTypes.USERS_FORM_CREATE_ERROR,
      });
    }
  },
};

export default actions;

