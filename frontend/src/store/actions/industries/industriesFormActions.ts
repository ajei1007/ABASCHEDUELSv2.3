import axios from 'axios';
import Errors from 'components/FormItems/error/errors';
import { toast } from 'react-toastify';
import { router } from 'router';
import { IndustriesFormActionTypes } from "types/redux/industries/industriesForm";
import type { AppDispatch } from 'store';

const actions = {
  doNew: () => {
    return {
      type: IndustriesFormActionTypes.INDUSTRIES_FORM_RESET,
    };
  },

  doFind: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: IndustriesFormActionTypes.INDUSTRIES_FORM_FIND_STARTED,
      });
      const response = await axios.get(`/industries/${id}`);
      const record = response.data;
      
        dispatch({
          type: IndustriesFormActionTypes.INDUSTRIES_FORM_FIND_SUCCESS,
          payload: record,
        });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: IndustriesFormActionTypes.INDUSTRIES_FORM_FIND_ERROR,
      });

      router.navigate('/admin/industries');
    }
  },

  doCreate: (values: any) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: IndustriesFormActionTypes.INDUSTRIES_FORM_CREATE_STARTED,
      });

      axios.post('/industries', { data: values })
        dispatch({
          type: IndustriesFormActionTypes.INDUSTRIES_FORM_CREATE_SUCCESS,
        });

        toast.success('Industries created');
        router.navigate('/admin/industries');
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: IndustriesFormActionTypes.INDUSTRIES_FORM_CREATE_ERROR,
      });
    }
  },

  doUpdate: (id: string, values: any, isProfile: boolean) => async (
    dispatch: AppDispatch,
  ) => {
    try {
      dispatch({
        type: IndustriesFormActionTypes.INDUSTRIES_FORM_UPDATE_STARTED,
      });

      await axios.put(`/industries/${id}`, {id, data: values});

      dispatch({
        type: IndustriesFormActionTypes.INDUSTRIES_FORM_UPDATE_SUCCESS,
      });

      if (isProfile) {
        toast.success('Profile updated');
      } else {
        toast.success('Industries updated');
        router.navigate('/admin/industries');
      }
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: IndustriesFormActionTypes.INDUSTRIES_FORM_UPDATE_ERROR,
      });
    }
  }

};

export default actions;