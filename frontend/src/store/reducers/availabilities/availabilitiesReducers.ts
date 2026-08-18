import list from 'store/reducers/availabilities/availabilitiesListReducers';
import form from 'store/reducers/availabilities/availabilitiesFormReducers';
import { combineReducers } from 'redux';

export default combineReducers({
  list,
  form,
});
