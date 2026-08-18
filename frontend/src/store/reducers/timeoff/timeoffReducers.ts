import list from 'store/reducers/timeoff/timeoffListReducers';
import form from 'store/reducers/timeoff/timeoffFormReducers';
import { combineReducers } from 'redux';

export default combineReducers({
  list,
  form,
});
