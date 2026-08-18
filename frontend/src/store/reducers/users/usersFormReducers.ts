/* eslint-disable import/no-anonymous-default-export */
import {
  type UsersFormState,
  type UsersFormAction,
  UsersFormActionTypes
} from "types/redux/users/usersForm";

const initialData: UsersFormState = {
  findLoading: false,
  saveLoading: false,
  record: null,
};

export default (state = initialData, action: UsersFormAction): UsersFormState => {
  switch (action.type) {
    case UsersFormActionTypes.USERS_FORM_RESET:
      
      return {
        ...state,
      }
    case UsersFormActionTypes.USERS_FORM_FIND_STARTED:
      return {
        ...state,
        record: null,
        findLoading: true,
      }
    case UsersFormActionTypes.USERS_FORM_FIND_SUCCESS:
      return {
        ...state,
        record: action.payload,
        findLoading: false,
      }
    case UsersFormActionTypes.USERS_FORM_FIND_ERROR:
      return {
        ...state,
        record: null,
        findLoading: false,
      }
    case UsersFormActionTypes.USERS_FORM_CREATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case UsersFormActionTypes.USERS_FORM_CREATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case UsersFormActionTypes.USERS_FORM_CREATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    case UsersFormActionTypes.USERS_FORM_UPDATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case UsersFormActionTypes.USERS_FORM_UPDATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case UsersFormActionTypes.USERS_FORM_UPDATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    default:
      return state;
  }
}
