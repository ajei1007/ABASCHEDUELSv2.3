import axios from 'axios';
import Errors from 'components/FormItems/error/errors';
import { toast } from 'react-toastify';
import { router } from 'router';
import { MobiletokensFormActionTypes } from "types/redux/mobiletokens/mobiletokensForm";
import type { AppDispatch } from 'store';

const actions = {
  doNew: () => {
    return {
      type: MobiletokensFormActionTypes.MOBILETOKENS_FORM_RESET,
    };
  },

  doFind: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: MobiletokensFormActionTypes.MOBILETOKENS_FORM_FIND_STARTED,
      });
      const response = await axios.get(`/mobiletokens/${id}`);
      const record = response.data;
      
        dispatch({
          type: MobiletokensFormActionTypes.MOBILETOKENS_FORM_FIND_SUCCESS,
          payload: record,
        });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: MobiletokensFormActionTypes.MOBILETOKENS_FORM_FIND_ERROR,
      });

      router.navigate('/admin/mobiletokens');
    }
  },

  doCreate: (values: any) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: MobiletokensFormActionTypes.MOBILETOKENS_FORM_CREATE_STARTED,
      });

      axios.post('/mobiletokens', { data: values })
        dispatch({
          type: MobiletokensFormActionTypes.MOBILETOKENS_FORM_CREATE_SUCCESS,
        });

        toast.success('Mobiletokens created');
        router.navigate('/admin/mobiletokens');
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: MobiletokensFormActionTypes.MOBILETOKENS_FORM_CREATE_ERROR,
      });
    }
  },

  doUpdate: (id: string, values: any, isProfile: boolean) => async (
    dispatch: AppDispatch,
  ) => {
    try {
      dispatch({
        type: MobiletokensFormActionTypes.MOBILETOKENS_FORM_UPDATE_STARTED,
      });

      await axios.put(`/mobiletokens/${id}`, {id, data: values});

      dispatch({
        type: MobiletokensFormActionTypes.MOBILETOKENS_FORM_UPDATE_SUCCESS,
      });

      if (isProfile) {
        toast.success('Profile updated');
      } else {
        toast.success('Mobiletokens updated');
        router.navigate('/admin/mobiletokens');
      }
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: MobiletokensFormActionTypes.MOBILETOKENS_FORM_UPDATE_ERROR,
      });
    }
  }

};

export default actions;

