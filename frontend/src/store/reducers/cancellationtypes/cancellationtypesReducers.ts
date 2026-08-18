import list from 'store/reducers/cancellationtypes/cancellationtypesListReducers';
import form from 'store/reducers/cancellationtypes/cancellationtypesFormReducers';
import { combineReducers } from 'redux';

export default combineReducers({
  list,
  form,
});
