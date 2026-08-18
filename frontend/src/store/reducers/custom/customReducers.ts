import list from 'store/reducers/custom/customListReducers';
import form from 'store/reducers/custom/customFormReducers';
import { combineReducers } from 'redux';

export default combineReducers({
  list,
  form,
});
