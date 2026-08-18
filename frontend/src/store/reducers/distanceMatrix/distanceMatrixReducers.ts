import list from 'store/reducers/distanceMatrix/distanceMatrixListReducers';
import form from 'store/reducers/distanceMatrix/distanceMatrixFormReducers';
import { combineReducers } from 'redux';

export default combineReducers({
  list,
  form,
});
