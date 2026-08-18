import axios from 'axios';
import Errors from 'components/FormItems/error/errors';
import { toast } from 'react-toastify';
import { router } from 'router';
import { FounderServiceLinesFormActionTypes } from "types/redux/founderServiceLines/founderServiceLinesForm";
import type { AppDispatch } from 'store';

const actions = {
  doNew: () => {
    return {
      type: FounderServiceLinesFormActionTypes.FOUNDER_SERVICE_LINES_FORM_RESET,
    };
  },

  doFind: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: FounderServiceLinesFormActionTypes.FOUNDER_SERVICE_LINES_FORM_FIND_STARTED,
      });
      const response = await axios.get(`/founderServiceLines/${id}`);
      const record = response.data;
      
        dispatch({
          type: FounderServiceLinesFormActionTypes.FOUNDER_SERVICE_LINES_FORM_FIND_SUCCESS,
          payload: record,
        });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: FounderServiceLinesFormActionTypes.FOUNDER_SERVICE_LINES_FORM_FIND_ERROR,
      });

      router.navigate('/admin/founderServiceLines');
    }
  },

  doCreate: (values: any) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: FounderServiceLinesFormActionTypes.FOUNDER_SERVICE_LINES_FORM_CREATE_STARTED,
      });

      axios.post('/founderServiceLines', { data: values })
        dispatch({
          type: FounderServiceLinesFormActionTypes.FOUNDER_SERVICE_LINES_FORM_CREATE_SUCCESS,
        });

        toast.success('Founder ServiceLines created');
        router.navigate('/admin/founderServiceLines');
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: FounderServiceLinesFormActionTypes.FOUNDER_SERVICE_LINES_FORM_CREATE_ERROR,
      });
    }
  },

  doUpdate: (id: string, values: any, isProfile: boolean) => async (
    dispatch: AppDispatch,
  ) => {
    try {
      dispatch({
        type: FounderServiceLinesFormActionTypes.FOUNDER_SERVICE_LINES_FORM_UPDATE_STARTED,
      });

      await axios.put(`/founderServiceLines/${id}`, {id, data: values});

      dispatch({
        type: FounderServiceLinesFormActionTypes.FOUNDER_SERVICE_LINES_FORM_UPDATE_SUCCESS,
      });

      if (isProfile) {
        toast.success('Profile updated');
      } else {
        toast.success('Founder ServiceLines updated');
        router.navigate('/admin/founderServiceLines');
      }
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: FounderServiceLinesFormActionTypes.FOUNDER_SERVICE_LINES_FORM_UPDATE_ERROR,
      });
    }
  }

};

export default actions;

