import list from 'store/reducers/companies/companiesListReducers';
import form from 'store/reducers/companies/companiesFormReducers';
import { combineReducers } from 'redux';

export default combineReducers({
  list,
  form,
});
