import list from 'store/reducers/branchgroups/branchgroupsListReducers';
import form from 'store/reducers/branchgroups/branchgroupsFormReducers';
import { combineReducers } from 'redux';

export default combineReducers({
  list,
  form,
});
