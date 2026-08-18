import axios from 'axios';
import Errors from 'components/FormItems/error/errors';
import { toast } from 'react-toastify';
import { router } from 'router';
import { DistanceMatrixFormActionTypes } from "types/redux/distanceMatrix/distanceMatrixForm";
import type { AppDispatch } from 'store';

const actions = {
  doNew: () => {
    return {
      type: DistanceMatrixFormActionTypes.DISTANCEMATRIX_FORM_RESET,
    };
  },

  doFind: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: DistanceMatrixFormActionTypes.DISTANCEMATRIX_FORM_FIND_STARTED,
      });
      const response = await axios.get(`/distancematrix/${id}`);
      const record = response.data;
        dispatch({
          type: DistanceMatrixFormActionTypes.DISTANCEMATRIX_FORM_FIND_SUCCESS,
          payload: record,
        });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: DistanceMatrixFormActionTypes.DISTANCEMATRIX_FORM_FIND_ERROR,
      });

      router.navigate('/admin/distancematrix');
    }
  },

  doCreate: (values: any) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: DistanceMatrixFormActionTypes.DISTANCEMATRIX_FORM_CREATE_STARTED,
      });

      axios.post('/distancematrix', { data: values })
        dispatch({
          type: DistanceMatrixFormActionTypes.DISTANCEMATRIX_FORM_CREATE_SUCCESS,
        });

        toast.success('Distance matrix created');
        router.navigate('/admin/distancematrix');
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: DistanceMatrixFormActionTypes.DISTANCEMATRIX_FORM_CREATE_ERROR,
      });
    }
  },

  doUpdate: (id: string, values: any, isProfile: boolean) => async (
    dispatch: AppDispatch,
  ) => {
    try {
      dispatch({
        type: DistanceMatrixFormActionTypes.DISTANCEMATRIX_FORM_UPDATE_STARTED,
      });

      await axios.put(`/distancematrix/${id}`, {id, data: values});

      dispatch({
        type: DistanceMatrixFormActionTypes.DISTANCEMATRIX_FORM_UPDATE_SUCCESS,
      });

      if (isProfile) {
        toast.success('Profile updated');
      } else {
        toast.success('Distance matrix updated');
        router.navigate('/admin/distancematrix');
      }
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: DistanceMatrixFormActionTypes.DISTANCEMATRIX_FORM_UPDATE_ERROR,
      });
    }
  }

};

export default actions;

