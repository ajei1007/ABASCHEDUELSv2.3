import list from 'store/reducers/branchtype/branchtypeListReducers';
import form from 'store/reducers/branchtype/branchtypeFormReducers';
import { combineReducers } from 'redux';

export default combineReducers({
  list,
  form,
});
