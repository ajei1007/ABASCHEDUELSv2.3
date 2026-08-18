import list from 'store/reducers/founderServiceLines/founderServiceLinesListReducers';
import form from 'store/reducers/founderServiceLines/founderServiceLinesFormReducers';
import { combineReducers } from 'redux';

export default combineReducers({
  list,
  form,
});
