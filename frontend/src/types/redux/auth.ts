export interface AuthState {
  isFetching: boolean,
  errorMessage: string,
  currentUser: null | any,
  loadingInit: boolean,
  deviceAddress: string;
}

export enum AuthActionTypes {
  LOGIN_REQUEST = 'LOGIN_REQUEST',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGOUT_REQUEST = 'LOGOUT_REQUEST',
  LOGOUT_SUCCESS = 'LOGOUT_SUCCESS',
  RESET_REQUEST = 'RESET_REQUEST',
  RESET_SUCCESS = 'RESET_SUCCESS',
  PASSWORD_RESET_EMAIL_REQUEST = 'PASSWORD_RESET_EMAIL_REQUEST',
  PASSWORD_RESET_EMAIL_SUCCESS = 'PASSWORD_RESET_EMAIL_SUCCESS',
  AUTH_FAILURE = 'AUTH_FAILURE',
  AUTH_INIT_SUCCESS = 'AUTH_INIT_SUCCESS',
  AUTH_INIT_ERROR = 'AUTH_INIT_ERROR',
  REGISTER_REQUEST = 'REGISTER_REQUEST',
  REGISTER_SUCCESS = 'REGISTER_SUCCESS',
  SET_DEVICE_ADDRESS = 'SET_DEVICE_ADDRESS',
}

interface LoginRequest {
  type: AuthActionTypes.LOGIN_REQUEST;
}

interface LoginSuccess {
  type: AuthActionTypes.LOGIN_SUCCESS;
}

interface LogoutRequest {
  type: AuthActionTypes.LOGOUT_REQUEST;
}

interface LogoutSuccess {
  type: AuthActionTypes.LOGOUT_SUCCESS;
}

interface ResetRequest {
  type: AuthActionTypes.RESET_REQUEST;
}

interface ResetSuccess {
  type: AuthActionTypes.RESET_SUCCESS;
}

interface PasswordResetEmailRequest {
  type: AuthActionTypes.PASSWORD_RESET_EMAIL_REQUEST;
}

interface PasswordResetEmailSuccess {
  type: AuthActionTypes.PASSWORD_RESET_EMAIL_SUCCESS;
}

interface AuthFailure {
  type: AuthActionTypes.AUTH_FAILURE;
  payload: string;
}

interface AuthInitSuccess {
  type: AuthActionTypes.AUTH_INIT_SUCCESS;
  payload: any;
}

interface AuthInitError {
  type: AuthActionTypes.AUTH_INIT_ERROR;
}

interface RegisterRequest {
  type: AuthActionTypes.REGISTER_REQUEST;
}

interface RegisterSuccess {
  type: AuthActionTypes.REGISTER_SUCCESS;
}

interface SetDeviceAddress {
  type: AuthActionTypes.SET_DEVICE_ADDRESS;
  payload: string;
}

export type AuthAction =
  LoginRequest
  | LoginSuccess
  | LogoutRequest
  | LogoutSuccess
  | ResetRequest
  | ResetSuccess
  | PasswordResetEmailRequest
  | PasswordResetEmailSuccess
  | AuthFailure
  | AuthInitSuccess
  | AuthInitError
  | RegisterRequest
  | RegisterSuccess
  | SetDeviceAddress
