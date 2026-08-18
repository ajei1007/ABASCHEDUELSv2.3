import list from 'store/reducers/statusevents/statuseventsListReducers';
import form from 'store/reducers/statusevents/statuseventsFormReducers';
import { combineReducers } from 'redux';

export default combineReducers({
  list,
  form,
});
