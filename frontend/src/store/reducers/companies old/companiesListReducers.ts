/* eslint-disable import/no-anonymous-default-export */
import {
  type CompaniesListState,
  type CompaniesListAction,
  CompaniesListActionTypes,
} from 'types/redux/companies/companiesList';

const initialData: CompaniesListState = {
  rows: [],
  loading: false,
  count: 0,
  modalOpen: false,
  idToDelete: null,
};

export default (state = initialData, action: CompaniesListAction): CompaniesListState => {
  switch (action.type) {
    case CompaniesListActionTypes.COMPANIES_LIST_FETCH_STARTED:
      return {
        ...state,
        loading: true,
      }
    case CompaniesListActionTypes.COMPANIES_LIST_FETCH_SUCCESS:
      return {
        ...state,
        rows: action.payload!.rows,
        loading: false,
        count: action.payload!.count,
      }
    case CompaniesListActionTypes.COMPANIES_LIST_FETCH_ERROR:
      return {
        ...state,
        loading: false,
        rows: []
      }
    case CompaniesListActionTypes.COMPANIES_LIST_DELETE_STARTED:
      return {
        ...state,
        loading: true
      }
    case CompaniesListActionTypes.COMPANIES_LIST_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case CompaniesListActionTypes.COMPANIES_LIST_DELETE_ERROR:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case CompaniesListActionTypes.COMPANIES_LIST_OPEN_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: true,
        idToDelete: action.payload.id,
      }
    case CompaniesListActionTypes.COMPANIES_LIST_CLOSE_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    default:
      return state;
  }
}
