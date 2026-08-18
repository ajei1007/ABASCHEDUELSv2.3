import list from 'store/reducers/users/usersListReducers';
import form from 'store/reducers/users/usersFormReducers';
import { combineReducers } from 'redux';

export default combineReducers({
  list,
  form,
});
