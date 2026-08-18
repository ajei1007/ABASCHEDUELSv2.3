import axios from 'axios';
import Errors from 'components/FormItems/error/errors';
import { toast } from 'react-toastify';
import { router } from 'router';
import { AvailabilitiesFormActionTypes } from 'types/redux/availabilities/availabilitiesForm';
import type { AppDispatch } from 'store';

const actions = {
  doNew: () => {
    return {
      type: AvailabilitiesFormActionTypes.AVAILABILITIES_FORM_RESET,
    };
  },

  doFind: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: AvailabilitiesFormActionTypes.AVAILABILITIES_FORM_FIND_STARTED,
      });
      const response = await axios.get(`/availabilities/${id}`);
      const record = response.data;
      
        dispatch({
          type: AvailabilitiesFormActionTypes.AVAILABILITIES_FORM_FIND_SUCCESS,
          payload: record,
        });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: AvailabilitiesFormActionTypes.AVAILABILITIES_FORM_FIND_ERROR,
      });

      router.navigate('/admin/availabilities');
    }
  },

  doCreate:
    (values: any, resources: string) =>
    async (dispatch: AppDispatch) => {
      try {
        dispatch({
          type: AvailabilitiesFormActionTypes.AVAILABILITIES_FORM_CREATE_STARTED,
        });

        axios.post('/availabilities', { data: values })
          dispatch({
            type: AvailabilitiesFormActionTypes.AVAILABILITIES_FORM_CREATE_SUCCESS,
          });

          toast.success('Availabilities created');

          router.navigate(`/admin/availabilities/resources/${resources}`);
      } catch (error: any) {
        Errors.handle(error);

        dispatch({
          type: AvailabilitiesFormActionTypes.AVAILABILITIES_FORM_CREATE_ERROR,
        });
      }
    },

  doUpdate:
    (id: string, values: any, isProfile: boolean, resources: string) =>
    async (dispatch: AppDispatch) => {
      try {
        dispatch({
          type: AvailabilitiesFormActionTypes.AVAILABILITIES_FORM_UPDATE_STARTED,
        });

        await axios.put(`/availabilities/${id}`, { id, data: values });

        dispatch({
          type: AvailabilitiesFormActionTypes.AVAILABILITIES_FORM_UPDATE_SUCCESS,
        });

        if (isProfile) {
          toast.success('Profile updated');
        } else {
          toast.success('Availabilities updated');
          router.navigate(`/admin/availabilities/resources/${resources}`);
        }
      } catch (error: any) {
        Errors.handle(error);

        dispatch({
          type: AvailabilitiesFormActionTypes.AVAILABILITIES_FORM_UPDATE_ERROR,
        });
      }
    },
};

export default actions;