import list from 'store/reducers/mobiletokens/mobiletokensListReducers';
import form from 'store/reducers/mobiletokens/mobiletokensFormReducers';
import { combineReducers } from 'redux';

export default combineReducers({
  list,
  form,
});
