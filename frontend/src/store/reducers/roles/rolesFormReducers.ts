/* eslint-disable import/no-anonymous-default-export */
import {
  type RolesFormState,
  type RolesFormAction,
  RolesFormActionTypes
} from "types/redux/roles/rolesForm";

const initialData: RolesFormState = {
  findLoading: false,
  saveLoading: false,
  record: null,
};

export default (state = initialData, action: RolesFormAction): RolesFormState => {
  switch (action.type) {
    case RolesFormActionTypes.ROLES_FORM_RESET:
      return {
        ...state,
      }
    case RolesFormActionTypes.ROLES_FORM_FIND_STARTED:
      return {
        ...state,
        record: null,
        findLoading: true,
      }
    case RolesFormActionTypes.ROLES_FORM_FIND_SUCCESS:
      return {
        ...state,
        record: action.payload,
        findLoading: false,
      }
    case RolesFormActionTypes.ROLES_FORM_FIND_ERROR:
      return {
        ...state,
        record: null,
        findLoading: false,
      }
    case RolesFormActionTypes.ROLES_FORM_CREATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case RolesFormActionTypes.ROLES_FORM_CREATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case RolesFormActionTypes.ROLES_FORM_CREATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    case RolesFormActionTypes.ROLES_FORM_UPDATE_STARTED:
      return {
        ...state,
        saveLoading: true,
      }
    case RolesFormActionTypes.ROLES_FORM_UPDATE_SUCCESS:
      return {
        ...state,
        saveLoading: false,
      }
    case RolesFormActionTypes.ROLES_FORM_UPDATE_ERROR:
      return {
        ...state,
        saveLoading: false,
      }
    default:
      return state;
  }
}
