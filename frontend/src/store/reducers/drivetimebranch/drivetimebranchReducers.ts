import list from 'store/reducers/drivetimebranch/drivetimebranchListReducers';
import form from 'store/reducers/drivetimebranch/drivetimebranchFormReducers';
import { combineReducers } from 'redux';

export default combineReducers({
  list,
  form,
});
