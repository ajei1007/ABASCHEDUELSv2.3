import axios from 'axios';
import Errors from 'components/FormItems/error/errors';
import { toast } from 'react-toastify';
import { router } from 'router';
import { EventsFormActionTypes } from "types/redux/events/eventsForm";
import type { AppDispatch } from 'store';

const actions = {
  doNew: () => {
    return {
      type: EventsFormActionTypes.EVENTS_FORM_RESET,
    };
  },

  doFind: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: EventsFormActionTypes.EVENTS_FORM_FIND_STARTED,
      });
      const response = await axios.get(`/events/${id}`);
      const record = response.data;
      
        dispatch({
          type: EventsFormActionTypes.EVENTS_FORM_FIND_SUCCESS,
          payload: record,
        });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: EventsFormActionTypes.EVENTS_FORM_FIND_ERROR,
      });

      router.navigate('/admin/events');
    }
  },

  doCreate: (values: any) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: EventsFormActionTypes.EVENTS_FORM_CREATE_STARTED,
      });

      axios.post('/events', { data: values })
        dispatch({
          type: EventsFormActionTypes.EVENTS_FORM_CREATE_SUCCESS,
        });

        toast.success('Events created');
        router.navigate('/admin/events');
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: EventsFormActionTypes.EVENTS_FORM_CREATE_ERROR,
      });
    }
  },

  doUpdate: (id: string, values: any, isProfile: boolean) => async (
    dispatch: AppDispatch,
  ) => {
    try {
      dispatch({
        type: EventsFormActionTypes.EVENTS_FORM_UPDATE_STARTED,
      });

      await axios.put(`/events/${id}`, {id, data: values});

      dispatch({
        type: EventsFormActionTypes.EVENTS_FORM_UPDATE_SUCCESS,
      });

      if (isProfile) {
        toast.success('Profile updated');
      } else {
        toast.success('Events updated');
        router.navigate('/admin/events');
      }
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: EventsFormActionTypes.EVENTS_FORM_UPDATE_ERROR,
      });
    }
  }

};

export default actions;

