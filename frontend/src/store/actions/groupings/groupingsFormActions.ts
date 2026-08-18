import axios from 'axios';
import Errors from 'components/FormItems/error/errors';
import { toast } from 'react-toastify';
import { router } from 'router';
import { GroupingsFormActionTypes } from "types/redux/groupings/groupingsForm";
import type { AppDispatch } from 'store';

const actions = {
  doNew: () => {
    return {
      type: GroupingsFormActionTypes.GROUPINGS_FORM_RESET,
    };
  },

  doFind: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: GroupingsFormActionTypes.GROUPINGS_FORM_FIND_STARTED,
      });
      const response = await axios.get(`/groupings/${id}`);
      const record = response.data;
      
        dispatch({
          type: GroupingsFormActionTypes.GROUPINGS_FORM_FIND_SUCCESS,
          payload: record,
        });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: GroupingsFormActionTypes.GROUPINGS_FORM_FIND_ERROR,
      });

      router.navigate('/admin/groupings');
    }
  },

  doCreate: (values: any) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: GroupingsFormActionTypes.GROUPINGS_FORM_CREATE_STARTED,
      });

      await axios.post('/groupings', { data: values })
        dispatch({
          type: GroupingsFormActionTypes.GROUPINGS_FORM_CREATE_SUCCESS,
        });

        toast.success('Groupings created');
        router.navigate('/admin/groupings');
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: GroupingsFormActionTypes.GROUPINGS_FORM_CREATE_ERROR,
      });
    }
  },

  doUpdate: (id: string, values: any, isProfile: boolean) => async (
    dispatch: AppDispatch,
  ) => {
    try {
      dispatch({
        type: GroupingsFormActionTypes.GROUPINGS_FORM_UPDATE_STARTED,
      });

      await axios.put(`/groupings/${id}`, {id, data: values});

      dispatch({
        type: GroupingsFormActionTypes.GROUPINGS_FORM_UPDATE_SUCCESS,
      });

      if (isProfile) {
        toast.success('Profile updated');
      } else {
        toast.success('Groupings updated');
        router.navigate('/admin/groupings');
      }
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: GroupingsFormActionTypes.GROUPINGS_FORM_UPDATE_ERROR,
      });
    }
  }

};

export default actions;

