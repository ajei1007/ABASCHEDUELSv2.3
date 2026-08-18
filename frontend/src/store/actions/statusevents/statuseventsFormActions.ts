import axios from 'axios';
import Errors from 'components/FormItems/error/errors';
import { toast } from 'react-toastify';
import { router } from 'router';
import { StatuseventsFormActionTypes } from "types/redux/statusevents/statuseventsForm";
import type { AppDispatch } from 'store';

const actions = {
  doNew: () => {
    return {
      type: StatuseventsFormActionTypes.STATUSEVENTS_FORM_RESET,
    };
  },

  doFind: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: StatuseventsFormActionTypes.STATUSEVENTS_FORM_FIND_STARTED,
      });
      const response = await axios.get(`/statusevents/${id}`);
      const record = response.data;
      
        dispatch({
          type: StatuseventsFormActionTypes.STATUSEVENTS_FORM_FIND_SUCCESS,
          payload: record,
        });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: StatuseventsFormActionTypes.STATUSEVENTS_FORM_FIND_ERROR,
      });

      router.navigate('/admin/statusevents');
    }
  },

  doCreate: (values: any) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: StatuseventsFormActionTypes.STATUSEVENTS_FORM_CREATE_STARTED,
      });

      axios.post('/statusevents', { data: values })
        dispatch({
          type: StatuseventsFormActionTypes.STATUSEVENTS_FORM_CREATE_SUCCESS,
        });

        toast.success('Statusevents created');
        router.navigate('/admin/statusevents');
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: StatuseventsFormActionTypes.STATUSEVENTS_FORM_CREATE_ERROR,
      });
    }
  },

  doUpdate: (id: string, values: any, isProfile: boolean) => async (
    dispatch: AppDispatch,
  ) => {
    try {
      dispatch({
        type: StatuseventsFormActionTypes.STATUSEVENTS_FORM_UPDATE_STARTED,
      });

      await axios.put(`/statusevents/${id}`, {id, data: values});

      dispatch({
        type: StatuseventsFormActionTypes.STATUSEVENTS_FORM_UPDATE_SUCCESS,
      });

      if (isProfile) {
        toast.success('Profile updated');
      } else {
        toast.success('Statusevents updated');
        router.navigate('/admin/statusevents');
      }
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: StatuseventsFormActionTypes.STATUSEVENTS_FORM_UPDATE_ERROR,
      });
    }
  }

};

export default actions;

