import axios from 'axios';
import Errors from 'components/FormItems/error/errors';
import { toast } from 'react-toastify';
import { router } from 'router';
import { BranchgroupsFormActionTypes } from "types/redux/branchgroups/branchgroupsForm";
import type { AppDispatch } from 'store';

const actions = {
  doNew: () => {
    return {
      type: BranchgroupsFormActionTypes.BRANCHGROUPS_FORM_RESET,
    };
  },

  doFind: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: BranchgroupsFormActionTypes.BRANCHGROUPS_FORM_FIND_STARTED,
      });
      const response = await axios.get(`/branchgroups/${id}`);
      const record = response.data;

        dispatch({
          type: BranchgroupsFormActionTypes.BRANCHGROUPS_FORM_FIND_SUCCESS,
          payload: record,
        });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: BranchgroupsFormActionTypes.BRANCHGROUPS_FORM_FIND_ERROR,
      });

      router.navigate('/admin/branchgroups');
    }
  },

  doCreate: (values: any) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: BranchgroupsFormActionTypes.BRANCHGROUPS_FORM_CREATE_STARTED,
      });

      axios.post('/branchgroups', { data: values })
        dispatch({
          type: BranchgroupsFormActionTypes.BRANCHGROUPS_FORM_CREATE_SUCCESS,
        });

        toast.success('Branchgroups created');
        router.navigate('/admin/branchgroups');
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: BranchgroupsFormActionTypes.BRANCHGROUPS_FORM_CREATE_ERROR,
      });
    }
  },

  doUpdate: (id: string, values: any, isProfile: boolean) => async (
    dispatch: AppDispatch,
  ) => {
    try {
      dispatch({
        type: BranchgroupsFormActionTypes.BRANCHGROUPS_FORM_UPDATE_STARTED,
      });

      await axios.put(`/branchgroups/${id}`, {id, data: values});

      dispatch({
        type: BranchgroupsFormActionTypes.BRANCHGROUPS_FORM_UPDATE_SUCCESS,
      });

      if (isProfile) {
        toast.success('Profile updated');
      } else {
        toast.success('Branchgroups updated');
        router.navigate('/admin/branchgroups');
      }
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: BranchgroupsFormActionTypes.BRANCHGROUPS_FORM_UPDATE_ERROR,
      });
    }
  }

};

export default actions;

