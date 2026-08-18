import axios from 'axios';
import Errors from 'components/FormItems/error/errors';
import { toast } from 'react-toastify';
import { router } from 'router';
import { CompaniesFormActionTypes } from "types/redux/companies/companiesForm";
import type { AppDispatch } from 'store';

const actions = {
  doNew: () => {
    return {
      type: CompaniesFormActionTypes.COMPANIES_FORM_RESET,
    };
  },

  doFind: (id: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: CompaniesFormActionTypes.COMPANIES_FORM_FIND_STARTED,
      });
      const response = await axios.get(`/companies/${id}`);
      const record = response.data;
      
        dispatch({
          type: CompaniesFormActionTypes.COMPANIES_FORM_FIND_SUCCESS,
          payload: record,
        });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: CompaniesFormActionTypes.COMPANIES_FORM_FIND_ERROR,
      });

      router.navigate('/admin/companies');
    }
  },

  doCreate: (values: any) => async (dispatch: AppDispatch) => {
    try {
      dispatch({
        type: CompaniesFormActionTypes.COMPANIES_FORM_CREATE_STARTED,
      });

      axios.post('/companies', { data: values })
        dispatch({
          type: CompaniesFormActionTypes.COMPANIES_FORM_CREATE_SUCCESS,
        });

        toast.success('Companies created');
        router.navigate('/admin/companies');
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: CompaniesFormActionTypes.COMPANIES_FORM_CREATE_ERROR,
      });
    }
  },

  doUpdate: (id: string, values: any, isProfile: boolean) => async (
    dispatch: AppDispatch,
  ) => {
    try {
      dispatch({
        type: CompaniesFormActionTypes.COMPANIES_FORM_UPDATE_STARTED,
      });

      await axios.put(`/companies/${id}`, {id, data: values});

      dispatch({
        type: CompaniesFormActionTypes.COMPANIES_FORM_UPDATE_SUCCESS,
      });

      if (isProfile) {
        toast.success('Profile updated');
      } else {
        toast.success('Companies updated');
        router.navigate('/admin/companies');
      }
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: CompaniesFormActionTypes.COMPANIES_FORM_UPDATE_ERROR,
      });
    }
  }

};

export default actions;

