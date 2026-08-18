import list from 'store/reducers/priorities/prioritiesListReducers';
import form from 'store/reducers/priorities/prioritiesFormReducers';
import { combineReducers } from 'redux';

export default combineReducers({
  list,
  form,
});
