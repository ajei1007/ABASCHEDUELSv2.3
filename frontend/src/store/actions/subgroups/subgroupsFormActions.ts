import axios from 'axios';
import Errors from 'components/FormItems/error/errors';
import { toast } from 'react-toastify';
import { router } from 'router';
import { SubgroupsFormActionTypes } from 'types/redux/subgroups/subgroupsForm';
import type { AppDispatch } from 'store';

const actions = {
  doNew: () => {
    return {
      type: SubgroupsFormActionTypes.SUBGROUPS_FORM_RESET,
    };
  },

  doFind: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: SubgroupsFormActionTypes.SUBGROUPS_FORM_FIND_STARTED,
      });
      const response = await axios.get(`/subgroups/${id}`);
      const record = response.data;

      dispatch({
        type: SubgroupsFormActionTypes.SUBGROUPS_FORM_FIND_SUCCESS,
        payload: record,
      });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: SubgroupsFormActionTypes.SUBGROUPS_FORM_FIND_ERROR,
      });

      router.navigate('/admin/subgroups');
    }
  },

  doCreate: (values: any, groups: any) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: SubgroupsFormActionTypes.SUBGROUPS_FORM_CREATE_STARTED,
      });

      await axios.post('/subgroups', {
        data: { ...values, groupingName: groups },
      });
      dispatch({
        type: SubgroupsFormActionTypes.SUBGROUPS_FORM_CREATE_SUCCESS,
      });

      toast.success('Subgroups created');
      router.navigate(`/admin/subgroups/groupings/${groups}`);
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: SubgroupsFormActionTypes.SUBGROUPS_FORM_CREATE_ERROR,
      });
    }
  },

  doUpdate:
    (id: string, values: any, isProfile: boolean, groups: any) =>
    async (dispatch: AppDispatch) => {
      try {
        dispatch({
          type: SubgroupsFormActionTypes.SUBGROUPS_FORM_UPDATE_STARTED,
        });

        await axios.put(`/subgroups/${id}`, {
          id,
          data: { ...values, groupingName: groups },
        });

        dispatch({
          type: SubgroupsFormActionTypes.SUBGROUPS_FORM_UPDATE_SUCCESS,
        });

        if (isProfile) {
          toast.success('Profile updated');
        } else {
          toast.success('Subgroups updated');
          router.navigate(`/admin/subgroups/groupings/${groups}`);
        }
      } catch (error: any) {
        Errors.handle(error);

        dispatch({
          type: SubgroupsFormActionTypes.SUBGROUPS_FORM_UPDATE_ERROR,
        });
      }
    },
};

export default actions;
