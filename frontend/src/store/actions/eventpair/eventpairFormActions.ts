import axios from 'axios';
import Errors from 'components/FormItems/error/errors';
import { toast } from 'react-toastify';
import { router } from 'router';
import { EventpairFormActionTypes } from "types/redux/eventpair/eventpairForm";
import type { AppDispatch } from 'store';

const actions = {
  doNew: () => {
    return {
      type: EventpairFormActionTypes.EVENTPAIR_FORM_RESET,
    };
  },

  doFind: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: EventpairFormActionTypes.EVENTPAIR_FORM_FIND_STARTED,
      });
      const response = await axios.get(`/eventpair/${id}`);
      const record = response.data;
      
      console.log('record', record);
        dispatch({
          type: EventpairFormActionTypes.EVENTPAIR_FORM_FIND_SUCCESS,
          payload: record,
        });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: EventpairFormActionTypes.EVENTPAIR_FORM_FIND_ERROR,
      });

      router.navigate('/admin/eventpair');
    }
  },

  doCreate: (values: any) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: EventpairFormActionTypes.EVENTPAIR_FORM_CREATE_STARTED,
      });

      axios.post('/eventpair', { data: values })
        dispatch({
          type: EventpairFormActionTypes.EVENTPAIR_FORM_CREATE_SUCCESS,
        });

        toast.success('Eventpair created');
        router.navigate('/admin/eventpair');
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: EventpairFormActionTypes.EVENTPAIR_FORM_CREATE_ERROR,
      });
    }
  },

  doUpdate: (id: string, values: any, isProfile: boolean) => async (
    dispatch: AppDispatch,
  ) => {
    try {
      dispatch({
        type: EventpairFormActionTypes.EVENTPAIR_FORM_UPDATE_STARTED,
      });

      await axios.put(`/eventpair/${id}`, {id, data: values});

      dispatch({
        type: EventpairFormActionTypes.EVENTPAIR_FORM_UPDATE_SUCCESS,
      });

      if (isProfile) {
        toast.success('Profile updated');
      } else {
        toast.success('Eventpair updated');
        router.navigate('/admin/eventpair');
      }
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: EventpairFormActionTypes.EVENTPAIR_FORM_UPDATE_ERROR,
      });
    }
  }

};

export default actions;

