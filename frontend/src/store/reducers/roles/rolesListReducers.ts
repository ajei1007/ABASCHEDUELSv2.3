/* eslint-disable import/no-anonymous-default-export */
import {
  type RolesListState,
  type RolesListAction,
  RolesListActionTypes,
} from 'types/redux/roles/rolesList';

const initialData: RolesListState = {
  rows: [],
  loading: false,
  count: 0,
  modalOpen: false,
  idToDelete: null,
};

export default (state = initialData, action: RolesListAction): RolesListState => {
  switch (action.type) {
    case RolesListActionTypes.ROLES_LIST_FETCH_STARTED:
      return {
        ...state,
        loading: true,
      }
    case RolesListActionTypes.ROLES_LIST_FETCH_SUCCESS:
      return {
        ...state,
        rows: action.payload!.rows,
        loading: false,
        count: action.payload!.count,
      }
    case RolesListActionTypes.ROLES_LIST_FETCH_ERROR:
      return {
        ...state,
        loading: false,
        rows: []
      }
    case RolesListActionTypes.ROLES_LIST_DELETE_STARTED:
      return {
        ...state,
        loading: true
      }
    case RolesListActionTypes.ROLES_LIST_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case RolesListActionTypes.ROLES_LIST_DELETE_ERROR:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case RolesListActionTypes.ROLES_LIST_OPEN_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: true,
        idToDelete: action.payload.id,
      }
    case RolesListActionTypes.ROLES_LIST_CLOSE_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    default:
      return state;
  }
}
