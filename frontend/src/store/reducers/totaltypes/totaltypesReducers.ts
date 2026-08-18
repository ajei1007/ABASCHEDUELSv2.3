import list from 'store/reducers/totaltypes/totaltypesListReducers';
import form from 'store/reducers/totaltypes/totaltypesFormReducers';
import { combineReducers } from 'redux';

export default combineReducers({
  list,
  form,
});
