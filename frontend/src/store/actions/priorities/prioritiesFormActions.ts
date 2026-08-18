import axios from 'axios';
import Errors from 'components/FormItems/error/errors';
import { toast } from 'react-toastify';
import { router } from 'router';
import { PrioritiesFormActionTypes } from "types/redux/priorities/prioritiesForm";
import type { AppDispatch } from 'store';

const actions = {
  doNew: () => {
    return {
      type: PrioritiesFormActionTypes.PRIORITIES_FORM_RESET,
    };
  },

  doFind: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: PrioritiesFormActionTypes.PRIORITIES_FORM_FIND_STARTED,
      });
      const response = await axios.get(`/priorities/${id}`);
      const record = response.data;

        dispatch({
          type: PrioritiesFormActionTypes.PRIORITIES_FORM_FIND_SUCCESS,
          payload: record,
        });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: PrioritiesFormActionTypes.PRIORITIES_FORM_FIND_ERROR,
      });

      router.navigate('/admin/priorities');
    }
  },

  doCreate: (values: any) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: PrioritiesFormActionTypes.PRIORITIES_FORM_CREATE_STARTED,
      });

      axios.post('/priorities', { data: values })
        dispatch({
          type: PrioritiesFormActionTypes.PRIORITIES_FORM_CREATE_SUCCESS,
        });

        toast.success('Priorities created');
        router.navigate('/admin/priorities');
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: PrioritiesFormActionTypes.PRIORITIES_FORM_CREATE_ERROR,
      });
    }
  },

  doUpdate: (id: string, values: any, isProfile: boolean) => async (
    dispatch: AppDispatch,
  ) => {
    try {
      dispatch({
        type: PrioritiesFormActionTypes.PRIORITIES_FORM_UPDATE_STARTED,
      });

      await axios.put(`/priorities/${id}`, {id, data: values});

      dispatch({
        type: PrioritiesFormActionTypes.PRIORITIES_FORM_UPDATE_SUCCESS,
      });

      if (isProfile) {
        toast.success('Profile updated');
      } else {
        toast.success('Priorities updated');
        router.navigate('/admin/priorities');
      }
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: PrioritiesFormActionTypes.PRIORITIES_FORM_UPDATE_ERROR,
      });
    }
  }

};

export default actions;

