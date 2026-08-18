import axios from 'axios';
import Errors from 'components/FormItems/error/errors';
import { toast } from 'react-toastify';
import { router } from 'router';
import { CustomFormActionTypes } from "types/redux/custom/customForm";
import type { AppDispatch } from 'store';

const actions = {
  doNew: () => {
    return {
      type: CustomFormActionTypes.CUSTOM_FORM_RESET,
    };
  },
  doFind: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: CustomFormActionTypes.CUSTOM_FORM_FIND_STARTED,
      });
      const response = await axios.get(`/newconstraintgenerator/${id}`);
      const record = response.data;
      
        dispatch({
          type: CustomFormActionTypes.CUSTOM_FORM_FIND_SUCCESS,
          payload: record,
        });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: CustomFormActionTypes.CUSTOM_FORM_FIND_ERROR,
      });

      router.navigate('/admin/custom');
    }
  },
  doCreate: (values: any) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: CustomFormActionTypes.CUSTOM_FORM_CREATE_STARTED,
      });

      axios.post('/newconstraintgenerator', { data: values })

        toast.success('Custom created');
        router.navigate('/admin/custom');
    } catch (error: any) {
      Errors.handle(error);
    } finally {
      dispatch({
        type: CustomFormActionTypes.CUSTOM_FORM_CREATE_SUCCESS,
      });
    }
  },
  doUpdate: (id: string, values: any, isProfile: boolean) => async (
    dispatch: AppDispatch,
  ) => {
    try {
      dispatch({
        type: CustomFormActionTypes.CUSTOM_FORM_UPDATE_STARTED,
      });

      await axios.put(`/newconstraintgenerator/${id}`, {id, data: values});

      dispatch({
        type: CustomFormActionTypes.CUSTOM_FORM_UPDATE_SUCCESS,
      });

      if (isProfile) {
        toast.success('Profile updated');
      } else {
        toast.success('Custom updated');
        router.navigate('/admin/custom');
      }
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: CustomFormActionTypes.CUSTOM_FORM_UPDATE_ERROR,
      });
    }
  }
};

export default actions;

