import list from 'store/reducers/groupings/groupingsListReducers';
import form from 'store/reducers/groupings/groupingsFormReducers';
import { combineReducers } from 'redux';

export default combineReducers({
  list,
  form,
});
