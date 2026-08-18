import list from 'store/reducers/roles/rolesListReducers';
import form from 'store/reducers/roles/rolesFormReducers';
import { combineReducers } from 'redux';

export default combineReducers({
  list,
  form,
});
