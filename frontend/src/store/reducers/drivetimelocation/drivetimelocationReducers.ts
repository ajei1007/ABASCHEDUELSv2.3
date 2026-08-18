import list from 'store/reducers/drivetimelocation/drivetimelocationListReducers';
import form from 'store/reducers/drivetimelocation/drivetimelocationFormReducers';
import { combineReducers } from 'redux';

export default combineReducers({
  list,
  form,
});
