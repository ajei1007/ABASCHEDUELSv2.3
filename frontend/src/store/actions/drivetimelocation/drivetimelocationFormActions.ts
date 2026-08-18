import axios from 'axios';
import Errors from 'components/FormItems/error/errors';
import { toast } from 'react-toastify';
import { router } from 'router';
import { DrivetimelocationFormActionTypes } from "types/redux/drivetimelocation/drivetimelocationForm";
import type { AppDispatch } from 'store';

const actions = {
  doNew: () => {
    return {
      type: DrivetimelocationFormActionTypes.DRIVETIMELOCATION_FORM_RESET,
    };
  },

  doFind: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: DrivetimelocationFormActionTypes.DRIVETIMELOCATION_FORM_FIND_STARTED,
      });
      const response = await axios.get(`/drivetimelocation/${id}`);
      const record = response.data;
        dispatch({
          type: DrivetimelocationFormActionTypes.DRIVETIMELOCATION_FORM_FIND_SUCCESS,
          payload: record,
        });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: DrivetimelocationFormActionTypes.DRIVETIMELOCATION_FORM_FIND_ERROR,
      });

      router.navigate('/admin/drivetimelocation');
    }
  },

  doCreate: (values: any) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: DrivetimelocationFormActionTypes.DRIVETIMELOCATION_FORM_CREATE_STARTED,
      });

      axios.post('/drivetimelocation', { data: values })
        dispatch({
          type: DrivetimelocationFormActionTypes.DRIVETIMELOCATION_FORM_CREATE_SUCCESS,
        });

        toast.success('Drivetimelocation created');
        router.navigate('/admin/drivetimelocation');
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: DrivetimelocationFormActionTypes.DRIVETIMELOCATION_FORM_CREATE_ERROR,
      });
    }
  },

  doUpdate: (id: string, values: any, isProfile: boolean) => async (
    dispatch: AppDispatch,
  ) => {
    try {
      dispatch({
        type: DrivetimelocationFormActionTypes.DRIVETIMELOCATION_FORM_UPDATE_STARTED,
      });

      await axios.put(`/drivetimelocation/${id}`, {id, data: values});

      dispatch({
        type: DrivetimelocationFormActionTypes.DRIVETIMELOCATION_FORM_UPDATE_SUCCESS,
      });

      if (isProfile) {
        toast.success('Profile updated');
      } else {
        toast.success('Drivetimelocation updated');
        router.navigate('/admin/drivetimelocation');
      }
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: DrivetimelocationFormActionTypes.DRIVETIMELOCATION_FORM_UPDATE_ERROR,
      });
    }
  }

};

export default actions;

