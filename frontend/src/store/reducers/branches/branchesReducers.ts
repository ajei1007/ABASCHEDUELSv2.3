import list from 'store/reducers/branches/branchesListReducers';
import form from 'store/reducers/branches/branchesFormReducers';
import { combineReducers } from 'redux';

export default combineReducers({
  list,
  form,
});
