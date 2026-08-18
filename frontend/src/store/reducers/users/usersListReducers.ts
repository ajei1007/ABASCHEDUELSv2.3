import {
  type UsersListState,
  type UsersListAction,
  UsersListActionTypes,
} from 'types/redux/users/usersList';

const initialData: UsersListState = {
  rows: [],
  loading: false,
  count: 0,
  modalOpen: false,
  idToDelete: null,
  addresses: [],
};

const usersReducer = (state = initialData, action: UsersListAction): UsersListState => {
  switch (action.type) {
    case UsersListActionTypes.USERS_LIST_FETCH_STARTED:
      return {
        ...state,
        loading: true,
      }
    case UsersListActionTypes.USERS_LIST_FETCH_SUCCESS:
      return {
        ...state,
        rows: action.payload!.rows,
        loading: false,
        count: action.payload!.count,
      }
    case UsersListActionTypes.USERS_LIST_FETCH_ERROR:
      return {
        ...state,
        loading: false,
        rows: []
      }
    case UsersListActionTypes.USERS_LIST_DELETE_STARTED:
      return {
        ...state,
        loading: true
      }
    case UsersListActionTypes.USERS_LIST_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case UsersListActionTypes.USERS_LIST_DELETE_ERROR:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case UsersListActionTypes.USERS_LIST_OPEN_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: true,
        idToDelete: action.payload.id,
      }
    case UsersListActionTypes.USERS_LIST_CLOSE_CONFIRM:
      return {
        ...state,
        loading: false,
        modalOpen: false,
      }
    case UsersListActionTypes.USERS_ADD_ADDRESS:
      return {
        ...state,
        addresses: [...state.addresses, action.payload],
      }
    default:
      return state;
  }
}

export default usersReducer;