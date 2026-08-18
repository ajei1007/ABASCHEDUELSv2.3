import type { AuthAction, AuthState } from "types/redux/auth";
import { AuthActionTypes } from "types/redux/auth";

const initialData: AuthState = {
  isFetching: false,
  errorMessage: '',
  currentUser: null,
  loadingInit: true,
  deviceAddress: '',
}

export default function authReducer(state = initialData, action: AuthAction): AuthState {
  switch (action.type) {
    case AuthActionTypes.LOGIN_REQUEST:
    case AuthActionTypes.RESET_REQUEST:
    case AuthActionTypes.PASSWORD_RESET_EMAIL_REQUEST:
    case AuthActionTypes.REGISTER_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
        errorMessage: '',
      });
    case AuthActionTypes.LOGIN_SUCCESS:
    case AuthActionTypes.LOGOUT_SUCCESS:
    case AuthActionTypes.RESET_SUCCESS:
    case AuthActionTypes.PASSWORD_RESET_EMAIL_SUCCESS:
    case AuthActionTypes.REGISTER_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        errorMessage: '',
      });
    case AuthActionTypes.AUTH_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        errorMessage: action.payload,
      });
    case AuthActionTypes.AUTH_INIT_SUCCESS:
      return Object.assign({}, state, {
        currentUser: action.payload.currentUser || null,
        loadingInit: false,
      });
    case AuthActionTypes.AUTH_INIT_ERROR:
      return Object.assign({}, state, {
        currentUser: null,
        loadingInit: false,
      });
    case AuthActionTypes.SET_DEVICE_ADDRESS:
      return Object.assign({}, state, {
        deviceAddress: action.payload,
      });
    default:
      return state;
  }
}
