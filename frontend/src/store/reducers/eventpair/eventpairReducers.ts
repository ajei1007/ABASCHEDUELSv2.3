import list from 'store/reducers/eventpair/eventpairListReducers';
import form from 'store/reducers/eventpair/eventpairFormReducers';
import { combineReducers } from 'redux';

export default combineReducers({
  list,
  form,
});
