import list from 'store/reducers/events/eventsListReducers';
import form from 'store/reducers/events/eventsFormReducers';
import { combineReducers } from 'redux';

export default combineReducers({
  list,
  form,
});
