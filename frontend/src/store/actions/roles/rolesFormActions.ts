import axios from 'axios';
import Errors from 'components/FormItems/error/errors';
import { toast } from 'react-toastify';
import { router } from 'router';
import { RolesFormActionTypes } from 'types/redux/roles/rolesForm';
import type { AppDispatch } from 'store';

const actions = {
  doNew: () => {
    return {
      type: RolesFormActionTypes.ROLES_FORM_RESET,
    };
  },

  doFind: (id: string, resources: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: RolesFormActionTypes.ROLES_FORM_FIND_STARTED,
      });
      const response = await axios.get(`/roles/${id}`);
      const record = response.data;

      dispatch({
        type: RolesFormActionTypes.ROLES_FORM_FIND_SUCCESS,
        payload: record,
      });
    } catch (error: any) {
      Errors.handle(error);
      dispatch({
        type: RolesFormActionTypes.ROLES_FORM_FIND_ERROR,
      });
      router.navigate(`/admin/roles/resources/${resources}`);
    }
  },

  doCreate:
    (values: any, resources: string) =>
    async (dispatch: AppDispatch) => {
      try {
        dispatch({
          type: RolesFormActionTypes.ROLES_FORM_CREATE_STARTED,
        });

        await axios.post('/roles', { data: {...values, resourceName: resources} })
          dispatch({
            type: RolesFormActionTypes.ROLES_FORM_CREATE_SUCCESS,
          });

          toast.success('Roles created');
          router.navigate(`/admin/roles/resources/${resources}`);
      } catch (error: any) {
        Errors.handle(error);

        dispatch({
          type: RolesFormActionTypes.ROLES_FORM_CREATE_ERROR,
        });
      }
    },

  doUpdate:
    (id: string, values: any, isProfile: boolean, resources: string) =>
    async (dispatch: AppDispatch) => {
      try {
        dispatch({
          type: RolesFormActionTypes.ROLES_FORM_UPDATE_STARTED,
        });

        await axios.put(`/roles/${id}`, {
          data: { ...values, resourceName: resources },
        });

        dispatch({
          type: RolesFormActionTypes.ROLES_FORM_UPDATE_SUCCESS,
        });

        if (isProfile) {
          toast.success('Profile updated');
        } else {
          toast.success('Roles updated');
          router.navigate(`/admin/roles/resources/${resources}`);
        }
      } catch (error: any) {
        Errors.handle(error);

        dispatch({
          type: RolesFormActionTypes.ROLES_FORM_UPDATE_ERROR,
        });
      }
    },
};

export default actions;