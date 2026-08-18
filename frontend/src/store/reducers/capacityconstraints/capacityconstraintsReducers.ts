import list from 'store/reducers/capacityconstraints/capacityconstraintsListReducers';
import form from 'store/reducers/capacityconstraints/capacityconstraintsFormReducers';
import { combineReducers } from 'redux';

export default combineReducers({
  list,
  form,
});
