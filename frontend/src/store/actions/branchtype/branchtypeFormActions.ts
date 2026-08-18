import axios from 'axios';
import Errors from 'components/FormItems/error/errors';
import { toast } from 'react-toastify';
import { router } from 'router';
import { BranchtypeFormActionTypes, type BranchtypeRecord } from "types/redux/branchtype/branchtypeForm";
import type { AppDispatch } from 'store';

const actions = {
  doNew: () => {
    return {
      type: BranchtypeFormActionTypes.BRANCHTYPE_FORM_RESET,
    };
  },

  doFind: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: BranchtypeFormActionTypes.BRANCHTYPE_FORM_FIND_STARTED,
      });

      const response = await axios.get(`/branchtype/${id}`);
      const record: BranchtypeRecord = response.data;
      
        dispatch({
          type: BranchtypeFormActionTypes.BRANCHTYPE_FORM_FIND_SUCCESS,
          payload: record,
        });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: BranchtypeFormActionTypes.BRANCHTYPE_FORM_FIND_ERROR,
      });

      router.navigate('/admin/branchtype');
    }
  },

  doCreate: (values: any) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: BranchtypeFormActionTypes.BRANCHTYPE_FORM_CREATE_STARTED,
      });

      await axios.post('/branchtype', { data: values })
        dispatch({
          type: BranchtypeFormActionTypes.BRANCHTYPE_FORM_CREATE_SUCCESS,
        });

        toast.success('Branchtype created');
        router.navigate('/admin/branchtype');
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: BranchtypeFormActionTypes.BRANCHTYPE_FORM_CREATE_ERROR,
      });
    }
  },

  doUpdate: (id: string, values: any, isProfile: boolean) => async (
    dispatch: AppDispatch,
  ) => {
    try {
      dispatch({
        type: BranchtypeFormActionTypes.BRANCHTYPE_FORM_UPDATE_STARTED,
      });

      await axios.put(`/branchtype/${id}`, {id, data: values});

      dispatch({
        type: BranchtypeFormActionTypes.BRANCHTYPE_FORM_UPDATE_SUCCESS,
      });

      if (isProfile) {
        toast.success('Profile updated');
      } else {
        toast.success('Branchtype updated');
        router.navigate('/admin/branchtype');
      }
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: BranchtypeFormActionTypes.BRANCHTYPE_FORM_UPDATE_ERROR,
      });
    }
  }

};

export default actions;

