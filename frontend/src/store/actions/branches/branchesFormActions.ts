import axios from 'axios';
import Errors from 'components/FormItems/error/errors';
import { toast } from 'react-toastify';
import { router } from 'router';
import { BranchesFormActionTypes, type BranchRecord } from "types/redux/branches/branchesForm";
import type { AppDispatch } from 'store';

const actions = {
  doNew: () => {
    return {
      type: BranchesFormActionTypes.BRANCHES_FORM_RESET,
    };
  },

  doFind: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: BranchesFormActionTypes.BRANCHES_FORM_FIND_STARTED,
      });
      const response = await axios.get(`/branches/${id}`);
      const record: BranchRecord = response.data;
     
        dispatch({
          type: BranchesFormActionTypes.BRANCHES_FORM_FIND_SUCCESS,
          payload: record,
        });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: BranchesFormActionTypes.BRANCHES_FORM_FIND_ERROR,
      });

      router.navigate('/admin/branches');
    }
  },

  doCreate: (values: any) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: BranchesFormActionTypes.BRANCHES_FORM_CREATE_STARTED,
      });

      await axios.post('/branches', { data: values })
        dispatch({
          type: BranchesFormActionTypes.BRANCHES_FORM_CREATE_SUCCESS,
        });

        toast.success('Branches created');
        router.navigate('/admin/branches');
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: BranchesFormActionTypes.BRANCHES_FORM_CREATE_ERROR,
      });
    }
  },

  doUpdate: (id: string, values: any, isProfile: boolean) => async (
    dispatch: AppDispatch,
  ) => {
    try {
      dispatch({
        type: BranchesFormActionTypes.BRANCHES_FORM_UPDATE_STARTED,
      });

      await axios.put(`/branches/${id}`, {id, data: values});

      dispatch({
        type: BranchesFormActionTypes.BRANCHES_FORM_UPDATE_SUCCESS,
      });

      if (isProfile) {
        toast.success('Profile updated');
      } else {
        toast.success('Branches updated');
        router.navigate('/admin/branches');
      }
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: BranchesFormActionTypes.BRANCHES_FORM_UPDATE_ERROR,
      });
    }
  }

};

export default actions;

