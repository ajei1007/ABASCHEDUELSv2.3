/* eslint-disable import/no-anonymous-default-export */
import {
  type CompaniesFormState,
  type CompaniesFormAction,
  CompaniesFormActionTypes
} from "types/redux/companies/companiesForm";

const initialData: CompaniesFormState = {
  findLoading: false,
  saveLoading: false,
  record: null,
};

export default (state = initialData, action: CompaniesFormAction): CompaniesFormState => {
  switch (action.type) {
    case CompaniesFormActionTypes.COMPANIES_FORM_RESET:
      return {
        ...state,
      }
    case CompaniesFormActionTypes.COMPANIES_FORM_FIND_STARTED:
      return {
        ...state,
        record: null,
        findLoading: true,
      }
    case CompaniesFormActionTypes.COMPANIES_FORM_FIND_SUCCESS:
      return {
        ...state,
        record: action.payload,
        findLoading: false,
      }
    case CompaniesFormActionTypes.COMPANIES_FORM_FIND_ERROR:
      return {
        ...state,
        record: null,
        findLoading: false,
      }
    case CompaniesFormActionTypes.COMPANIES_FORM_CREATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case CompaniesFormActionTypes.COMPANIES_FORM_CREATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case CompaniesFormActionTypes.COMPANIES_FORM_CREATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    case CompaniesFormActionTypes.COMPANIES_FORM_UPDATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case CompaniesFormActionTypes.COMPANIES_FORM_UPDATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case CompaniesFormActionTypes.COMPANIES_FORM_UPDATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    default:
      return state;
  }
}
