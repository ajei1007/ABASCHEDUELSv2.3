import axios from 'axios';
import Errors from 'components/FormItems/error/errors';
import { toast } from 'react-toastify';
import { router } from 'router';
import { TotaltypesFormActionTypes } from "types/redux/totaltypes/totaltypesForm";
import type { AppDispatch } from 'store';

const actions = {
  doNew: () => {
    return {
      type: TotaltypesFormActionTypes.TOTALTYPES_FORM_RESET,
    };
  },

  doFind: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: TotaltypesFormActionTypes.TOTALTYPES_FORM_FIND_STARTED,
      });
      const response = await axios.get(`/totaltypes/${id}`);
      const record = response.data;

        dispatch({
          type: TotaltypesFormActionTypes.TOTALTYPES_FORM_FIND_SUCCESS,
          payload: record,
        });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: TotaltypesFormActionTypes.TOTALTYPES_FORM_FIND_ERROR,
      });

      router.navigate('/admin/totaltypes');
    }
  },

  doCreate: (values: any) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: TotaltypesFormActionTypes.TOTALTYPES_FORM_CREATE_STARTED,
      });

      axios.post('/totaltypes', { data: values })
        dispatch({
          type: TotaltypesFormActionTypes.TOTALTYPES_FORM_CREATE_SUCCESS,
        });

        toast.success('Totaltypes created');
        router.navigate('/admin/totaltypes');
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: TotaltypesFormActionTypes.TOTALTYPES_FORM_CREATE_ERROR,
      });
    }
  },

  doUpdate: (id: string, values: any, isProfile: boolean) => async (
    dispatch: AppDispatch,
  ) => {
    try {
      dispatch({
        type: TotaltypesFormActionTypes.TOTALTYPES_FORM_UPDATE_STARTED,
      });

      await axios.put(`/totaltypes/${id}`, {id, data: values});

      dispatch({
        type: TotaltypesFormActionTypes.TOTALTYPES_FORM_UPDATE_SUCCESS,
      });

      if (isProfile) {
        toast.success('Profile updated');
      } else {
        toast.success('Totaltypes updated');
        router.navigate('/admin/totaltypes');
      }
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: TotaltypesFormActionTypes.TOTALTYPES_FORM_UPDATE_ERROR,
      });
    }
  }

};

export default actions;

