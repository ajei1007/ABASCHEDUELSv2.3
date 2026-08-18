import axios from 'axios';
import Errors from 'components/FormItems/error/errors';
import { toast } from 'react-toastify';
import { router } from 'router';
import { TimeoffFormActionTypes } from "types/redux/timeoff/timeoffForm";
import type { AppDispatch } from 'store';

const actions = {
  doNew: () => {
    return {
      type: TimeoffFormActionTypes.TIMEOFF_FORM_RESET,
    };
  },

  doFind: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: TimeoffFormActionTypes.TIMEOFF_FORM_FIND_STARTED,
      });
      const response = await axios.get(`/timeoff/${id}`);
      const record = response.data;

        dispatch({
          type: TimeoffFormActionTypes.TIMEOFF_FORM_FIND_SUCCESS,
          payload: record,
        });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: TimeoffFormActionTypes.TIMEOFF_FORM_FIND_ERROR,
      });

      router.navigate('/admin/timeoff');
    }
  },

  doCreate: (values: any) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: TimeoffFormActionTypes.TIMEOFF_FORM_CREATE_STARTED,
      });

      axios.post('/timeoff', { data: values })
        dispatch({
          type: TimeoffFormActionTypes.TIMEOFF_FORM_CREATE_SUCCESS,
        });

        toast.success('Timeoff created');
        router.navigate('/admin/timeoff');
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: TimeoffFormActionTypes.TIMEOFF_FORM_CREATE_ERROR,
      });
    }
  },

  doUpdate: (id: string, values: any, isProfile: boolean) => async (
    dispatch: AppDispatch,
  ) => {
    try {
      dispatch({
        type: TimeoffFormActionTypes.TIMEOFF_FORM_UPDATE_STARTED,
      });

      await axios.put(`/timeoff/${id}`, {id, data: values});

      dispatch({
        type: TimeoffFormActionTypes.TIMEOFF_FORM_UPDATE_SUCCESS,
      });

      if (isProfile) {
        toast.success('Profile updated');
      } else {
        toast.success('Timeoff updated');
        router.navigate('/admin/timeoff');
      }
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: TimeoffFormActionTypes.TIMEOFF_FORM_UPDATE_ERROR,
      });
    }
  }

};

export default actions;

