import list from 'store/reducers/industries/industriesListReducers';
import form from 'store/reducers/industries/industriesFormReducers';
import { combineReducers } from 'redux';

export default combineReducers({
  list,
  form,
});