import axios from 'axios';
import Errors from 'components/FormItems/error/errors';
import { toast } from 'react-toastify';
import { router } from 'router';
import { CapacityconstraintsFormActionTypes } from "types/redux/capacityconstraints/capacityconstraintsForm";
import type { AppDispatch } from 'store';

const actions = {
  doNew: () => {
    return {
      type: CapacityconstraintsFormActionTypes.CAPACITYCONSTRAINTS_FORM_RESET,
    };
  },

  doFind: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: CapacityconstraintsFormActionTypes.CAPACITYCONSTRAINTS_FORM_FIND_STARTED,
      });
      const response = await axios.get(`/capacityconstraints/${id}`);
      const record = response.data;
      
        dispatch({
          type: CapacityconstraintsFormActionTypes.CAPACITYCONSTRAINTS_FORM_FIND_SUCCESS,
          payload: record,
        });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: CapacityconstraintsFormActionTypes.CAPACITYCONSTRAINTS_FORM_FIND_ERROR,
      });

      router.navigate('/admin/capacityconstraints');
    }
  },

  doCreate: (values: any) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: CapacityconstraintsFormActionTypes.CAPACITYCONSTRAINTS_FORM_CREATE_STARTED,
      });

      axios.post('/capacityconstraints', { data: values })
        dispatch({
          type: CapacityconstraintsFormActionTypes.CAPACITYCONSTRAINTS_FORM_CREATE_SUCCESS,
        });

        toast.success('Capacityconstraints created');
        router.navigate('/admin/capacityconstraints');
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: CapacityconstraintsFormActionTypes.CAPACITYCONSTRAINTS_FORM_CREATE_ERROR,
      });
    }
  },

  doUpdate: (id: string, values: any, isProfile: boolean) => async (
    dispatch: AppDispatch,
  ) => {
    try {
      dispatch({
        type: CapacityconstraintsFormActionTypes.CAPACITYCONSTRAINTS_FORM_UPDATE_STARTED,
      });

      await axios.put(`/capacityconstraints/${id}`, {id, data: values});

      dispatch({
        type: CapacityconstraintsFormActionTypes.CAPACITYCONSTRAINTS_FORM_UPDATE_SUCCESS,
      });

      if (isProfile) {
        toast.success('Profile updated');
      } else {
        toast.success('Capacity constraints updated');
        router.navigate('/admin/capacityconstraints');
      }
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: CapacityconstraintsFormActionTypes.CAPACITYCONSTRAINTS_FORM_UPDATE_ERROR,
      });
    }
  }

};

export default actions;

