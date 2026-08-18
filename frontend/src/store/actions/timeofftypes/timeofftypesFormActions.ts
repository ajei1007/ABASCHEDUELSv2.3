import axios from 'axios';
import Errors from 'components/FormItems/error/errors';
import { toast } from 'react-toastify';
import { router } from 'router';
import { TimeofftypesFormActionTypes } from "types/redux/timeofftypes/timeofftypesForm";
import type { AppDispatch } from 'store';

const actions = {
  doNew: () => {
    return {
      type: TimeofftypesFormActionTypes.TIMEOFFTYPES_FORM_RESET,
    };
  },

  doFind: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: TimeofftypesFormActionTypes.TIMEOFFTYPES_FORM_FIND_STARTED,
      });
      const response = await axios.get(`/timeofftypes/${id}`);
      const record = response.data;
      

        dispatch({
          type: TimeofftypesFormActionTypes.TIMEOFFTYPES_FORM_FIND_SUCCESS,
          payload: record,
        });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: TimeofftypesFormActionTypes.TIMEOFFTYPES_FORM_FIND_ERROR,
      });

      router.navigate('/admin/timeofftypes');
    }
  },

  doCreate: (values: any) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: TimeofftypesFormActionTypes.TIMEOFFTYPES_FORM_CREATE_STARTED,
      });

      axios.post('/timeofftypes', { data: values })
        dispatch({
          type: TimeofftypesFormActionTypes.TIMEOFFTYPES_FORM_CREATE_SUCCESS,
        });

        toast.success('Timeofftypes created');
        router.navigate('/admin/timeofftypes');
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: TimeofftypesFormActionTypes.TIMEOFFTYPES_FORM_CREATE_ERROR,
      });
    }
  },

  doUpdate: (id: string, values: any, isProfile: boolean) => async (
    dispatch: AppDispatch,
  ) => {
    try {
      dispatch({
        type: TimeofftypesFormActionTypes.TIMEOFFTYPES_FORM_UPDATE_STARTED,
      });

      await axios.put(`/timeofftypes/${id}`, {id, data: values});

      dispatch({
        type: TimeofftypesFormActionTypes.TIMEOFFTYPES_FORM_UPDATE_SUCCESS,
      });

      if (isProfile) {
        toast.success('Profile updated');
      } else {
        toast.success('Timeofftypes updated');
        router.navigate('/admin/timeofftypes');
      }
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: TimeofftypesFormActionTypes.TIMEOFFTYPES_FORM_UPDATE_ERROR,
      });
    }
  }

};

export default actions;

