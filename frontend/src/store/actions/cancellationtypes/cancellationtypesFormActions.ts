import axios from 'axios';
import Errors from 'components/FormItems/error/errors';
import { toast } from 'react-toastify';
import { router } from 'router';
import { CancellationtypesFormActionTypes } from "types/redux/cancellationtypes/cancellationtypesForm";
import type { AppDispatch } from 'store';

const actions = {
  doNew: () => {
    return {
      type: CancellationtypesFormActionTypes.CANCELLATIONTYPES_FORM_RESET,
    };
  },

  doFind: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: CancellationtypesFormActionTypes.CANCELLATIONTYPES_FORM_FIND_STARTED,
      });
      const response = await axios.get(`/cancellationtypes/${id}`);
      const record = response.data;
      
        dispatch({
          type: CancellationtypesFormActionTypes.CANCELLATIONTYPES_FORM_FIND_SUCCESS,
          payload: record,
        });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: CancellationtypesFormActionTypes.CANCELLATIONTYPES_FORM_FIND_ERROR,
      });

      router.navigate('/admin/cancellationtypes');
    }
  },

  doCreate: (values: any) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: CancellationtypesFormActionTypes.CANCELLATIONTYPES_FORM_CREATE_STARTED,
      });

      axios.post('/cancellationtypes', { data: values })
        dispatch({
          type: CancellationtypesFormActionTypes.CANCELLATIONTYPES_FORM_CREATE_SUCCESS,
        });

        toast.success('Cancellationtypes created');
        router.navigate('/admin/cancellationtypes');
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: CancellationtypesFormActionTypes.CANCELLATIONTYPES_FORM_CREATE_ERROR,
      });
    }
  },

  doUpdate: (id: string, values: any, isProfile: boolean) => async (
    dispatch: AppDispatch,
  ) => {
    try {
      dispatch({
        type: CancellationtypesFormActionTypes.CANCELLATIONTYPES_FORM_UPDATE_STARTED,
      });

      await axios.put(`/cancellationtypes/${id}`, {id, data: values});

      dispatch({
        type: CancellationtypesFormActionTypes.CANCELLATIONTYPES_FORM_UPDATE_SUCCESS,
      });

      if (isProfile) {
        toast.success('Profile updated');
      } else {
        toast.success('Cancellationtypes updated');
        router.navigate('/admin/cancellationtypes');
      }
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: CancellationtypesFormActionTypes.CANCELLATIONTYPES_FORM_UPDATE_ERROR,
      });
    }
  }

};

export default actions;

