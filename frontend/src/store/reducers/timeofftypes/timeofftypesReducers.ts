import list from 'store/reducers/timeofftypes/timeofftypesListReducers';
import form from 'store/reducers/timeofftypes/timeofftypesFormReducers';
import { combineReducers } from 'redux';

export default combineReducers({
  list,
  form,
});
