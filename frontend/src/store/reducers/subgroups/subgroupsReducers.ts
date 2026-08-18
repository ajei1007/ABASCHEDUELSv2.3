import list from 'store/reducers/subgroups/subgroupsListReducers';
import form from 'store/reducers/subgroups/subgroupsFormReducers';
import { combineReducers } from 'redux';

export default combineReducers({
  list,
  form,
});
