import axios from 'axios';
import Errors from 'components/FormItems/error/errors';
import { toast } from 'react-toastify';
import { router } from 'router';
import { SubgroupgroupsFormActionTypes } from "types/redux/subgroupgroups/subgroupgroupsForm";
import type { AppDispatch } from 'store';

const actions = {
  doNew: () => {
    return {
      type: SubgroupgroupsFormActionTypes.SUBGROUPGROUPS_FORM_RESET,
    };
  },

  doFind: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: SubgroupgroupsFormActionTypes.SUBGROUPGROUPS_FORM_FIND_STARTED,
      });
      const response = await axios.get(`/subgroupgroups/${id}`);
      const record = response.data;
     
        dispatch({
          type: SubgroupgroupsFormActionTypes.SUBGROUPGROUPS_FORM_FIND_SUCCESS,
          payload: record,
        });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: SubgroupgroupsFormActionTypes.SUBGROUPGROUPS_FORM_FIND_ERROR,
      });

      router.navigate('/admin/subgroupgroups');
    }
  },

  doCreate: (values: any) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: SubgroupgroupsFormActionTypes.SUBGROUPGROUPS_FORM_CREATE_STARTED,
      });

      axios.post('/subgroupgroups', { data: values })
        dispatch({
          type: SubgroupgroupsFormActionTypes.SUBGROUPGROUPS_FORM_CREATE_SUCCESS,
        });

        toast.success('Subgroupgroups created');
        router.navigate('/admin/subgroupgroups');
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: SubgroupgroupsFormActionTypes.SUBGROUPGROUPS_FORM_CREATE_ERROR,
      });
    }
  },

  doUpdate: (id: string, values: any, isProfile: boolean) => async (
    dispatch: AppDispatch,
  ) => {
    try {
      dispatch({
        type: SubgroupgroupsFormActionTypes.SUBGROUPGROUPS_FORM_UPDATE_STARTED,
      });

      await axios.put(`/subgroupgroups/${id}`, {id, data: values});

      dispatch({
        type: SubgroupgroupsFormActionTypes.SUBGROUPGROUPS_FORM_UPDATE_SUCCESS,
      });

      if (isProfile) {
        toast.success('Profile updated');
      } else {
        toast.success('Subgroupgroups updated');
        router.navigate('/admin/subgroupgroups');
      }
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: SubgroupgroupsFormActionTypes.SUBGROUPGROUPS_FORM_UPDATE_ERROR,
      });
    }
  }

};

export default actions;

