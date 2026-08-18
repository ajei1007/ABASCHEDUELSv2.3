import axios from 'axios';
import Errors from 'components/FormItems/error/errors';
import { toast } from 'react-toastify';
import { router } from 'router';
import { DrivetimebranchFormActionTypes } from "types/redux/drivetimebranch/drivetimebranchForm";
import type { AppDispatch } from 'store';

const actions = {
  doNew: () => {
    return {
      type: DrivetimebranchFormActionTypes.DRIVETIMEBRANCH_FORM_RESET,
    };
  },

  doFind: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: DrivetimebranchFormActionTypes.DRIVETIMEBRANCH_FORM_FIND_STARTED,
      });
      const response = await axios.get(`/drivetimebranch/${id}`);
      const record = response.data;
      
      console.log('record', record);
      dispatch({
          type: DrivetimebranchFormActionTypes.DRIVETIMEBRANCH_FORM_FIND_SUCCESS,
          payload: record,
        });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: DrivetimebranchFormActionTypes.DRIVETIMEBRANCH_FORM_FIND_ERROR,
      });

      router.navigate('/admin/drivetimebranch');
    }
  },

  doCreate: (values: any) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: DrivetimebranchFormActionTypes.DRIVETIMEBRANCH_FORM_CREATE_STARTED,
      });

      axios.post('/drivetimebranch', { data: values })
        dispatch({
          type: DrivetimebranchFormActionTypes.DRIVETIMEBRANCH_FORM_CREATE_SUCCESS,
        });

        toast.success('Drivetimebranch created');
        router.navigate('/admin/drivetimebranch');
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: DrivetimebranchFormActionTypes.DRIVETIMEBRANCH_FORM_CREATE_ERROR,
      });
    }
  },

  doUpdate: (id: string, values: any, isProfile: boolean) => async (
    dispatch: AppDispatch,
  ) => {
    try {
      dispatch({
        type: DrivetimebranchFormActionTypes.DRIVETIMEBRANCH_FORM_UPDATE_STARTED,
      });

      await axios.put(`/drivetimebranch/${id}`, {id, data: values});

      dispatch({
        type: DrivetimebranchFormActionTypes.DRIVETIMEBRANCH_FORM_UPDATE_SUCCESS,
      });

      if (isProfile) {
        toast.success('Profile updated');
      } else {
        toast.success('Drivetimebranch updated');
        router.navigate('/admin/drivetimebranch');
      }
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: DrivetimebranchFormActionTypes.DRIVETIMEBRANCH_FORM_UPDATE_ERROR,
      });
    }
  }

};

export default actions;

