import axios from 'axios';
import config from '../../config';
import { decodeJwt } from 'jose';
import { toast } from 'react-toastify';
import Errors from 'components/FormItems/error/errors';
import type { AnyAction } from 'redux';
import { AuthActionTypes } from 'types/redux/auth';
import type { AppDispatch } from 'store';
import { router } from 'router';

async function findMe() {
  const response = await axios.get('/auth/me');
  return response.data;
}

export function authError(payload: string) {
  return {
    type: AuthActionTypes.AUTH_FAILURE,
    payload,
  };
}

export function doInit(isLoggedIn: boolean = false) {
  return async (dispatch: AppDispatch) => {
    try {
      let currentUser = null;
      let token = localStorage.getItem('token');
      if (token) {
        if (isLoggedIn) {
          window.location.href = '/admin/scheduler';
        }
        currentUser = await findMe();
      }
      dispatch({
        type: AuthActionTypes.AUTH_INIT_SUCCESS,
        payload: {
          currentUser,
        },
      });
    } catch (error: any) {
      Errors.handle(error);

      dispatch({
        type: AuthActionTypes.AUTH_INIT_ERROR,
        payload: error,
      });
      const msg = error?.response?.data;
      if (msg) {
        toast.error(msg);
      } else {
        toast.error('Something went wrong. Try again');
      }
    }
  };
}

export function logoutUser(): AnyAction & any {
  return (dispatch: AppDispatch) => {
    dispatch({
      type: AuthActionTypes.LOGOUT_REQUEST,
    });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    axios.defaults.headers.common['Authorization'] = '';
    dispatch({
      type: AuthActionTypes.LOGOUT_SUCCESS,
    });
    window.location.href = '/login';
  };
}

export function receiveToken(token: any, redirect: boolean = true) {
  return (dispatch: AppDispatch) => {
    let user = decodeJwt(token);

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.removeItem('mmToken');
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    dispatch({
      type: AuthActionTypes.LOGIN_SUCCESS,
    });

    if (redirect) {
      router.navigate('/app');
    }
  };
}

export function loginUser(creds: any) {
  return async (dispatch: AppDispatch) => {
    dispatch({
      type: AuthActionTypes.LOGIN_REQUEST,
    });
    if (creds.social) {
      window.location.href = config.baseURLApi + '/auth/signin/' + creds.social;
    } else if (creds.email.length > 0 && creds.password.length > 0) {
      try {
        const res = await axios.post('/auth/signin/local', creds);
        const token = res.data;
        dispatch(receiveToken(token, false));
        dispatch(doInit(true));
      } catch (error: any) {
        const msg = error?.response?.data;
        if (msg) {
          toast.error(msg);
        } else {
          toast.error('Something went wrong. Try again');
        }
      }
    } else {
      dispatch(authError('Something went wrong. Try again'));
    }
  };
}

export function switchUser(id: any) {
  return (dispatch: AppDispatch, getState: any) => {
    dispatch({
      type: AuthActionTypes.LOGIN_REQUEST,
    });

    const currentUser = getState().auth.currentUser;

    const userId: any = localStorage.getItem('userId');

    const isSwitchBack = userId && id === JSON.parse(userId);

    !isSwitchBack &&
      localStorage.setItem('userId', JSON.stringify(currentUser.id));

    const targetUserId = isSwitchBack ? JSON.parse(userId) : id;

    axios
      .post('/auth/switch-user', { id: targetUserId })
      .then((res) => {
        const token = res.data;
        dispatch(receiveToken(token, false));
        dispatch(doInit(true));

        isSwitchBack && localStorage.removeItem('userId');
      })
      .catch((err) => {
        const msg = err?.response?.data;
        if (msg) {
          toast.error(msg);
        } else {
          toast.error('Something went wrong. Try again');
        }
      });
  };
}

export function switchCompanyAdmin(companyId: any) {
  return (dispatch: AppDispatch) => {
    dispatch({
      type: AuthActionTypes.LOGIN_REQUEST,
    });

    axios
      .post('/auth/switch-company-admin', { id: companyId })
      .then((res) => {
        const token = res.data;
        dispatch(receiveToken(token, false));
        dispatch(doInit(true));
      })
      .catch((err) => {
        const msg = err?.response?.data;
        if (msg) {
          toast.error(msg);
        } else {
          toast.error('Something went wrong. Try again.');
        }
      });
  };
}

export function verifyEmail(token: string) {
  return (dispatch: AppDispatch) => {
    axios
      .put('/auth/verify-email', { token })
      .then((verified) => {
        if (verified) {
          toast.success('Your email was verified');
        }
      })
      .catch((err) => {
        toast.error(err.response.data);
      })
      .finally(() => {
        router.navigate('/login');
      });
  };
}

export function resetPassword(token: string, password: string) {
  return async (dispatch: AppDispatch) => {
    dispatch({
      type: AuthActionTypes.RESET_REQUEST,
    });
    try {
      await axios.put('/auth/password-reset', { token, password });

      dispatch({
        type: AuthActionTypes.RESET_SUCCESS,
      });
      toast.success('Password has been updated');
      router.navigate('/login');
    } catch (err: any) {
      dispatch(authError(err.response.data));
      const msg = err?.response?.data;
      if (msg) {
        toast.error(msg);
      } else {
        toast.error('Something went wrong. Try again');
      }
    }
  };
}

export function sendPasswordResetEmail(email: string) {
  return async (dispatch: AppDispatch) => {
    dispatch({
      type: AuthActionTypes.PASSWORD_RESET_EMAIL_REQUEST,
    });
    try {
      await axios.post('/auth/send-password-reset-email', { email });
      dispatch({
        type: AuthActionTypes.PASSWORD_RESET_EMAIL_SUCCESS,
      });
      toast.success('Email with resetting instructions has been sent');
      router.navigate('/login');
    } catch (err: any) {
      dispatch(authError(err.response.data));
      const msg = err?.response?.data;
      if (msg) {
        toast.error(msg);
      } else {
        toast.error('Something went wrong. Try again');
      }
    }
  };
}

export function registerUser(creds: any) {
  return async (dispatch: AppDispatch) => {
    dispatch({
      type: AuthActionTypes.REGISTER_REQUEST,
    });

    try {
      await axios.post('/auth/signup', creds);
      dispatch({
        type: AuthActionTypes.REGISTER_SUCCESS,
      });
      toast.success("We've sent verification link to your email.");
      return true;
    } catch (err: any) {
      dispatch(authError(err.response.data));
      const msg = err?.response?.data;
      if (msg) {
        toast.error(msg);
      } else {
        toast.error('Something went wrong. Try again');
      }
      return false;
    }
  };
}

export function validateToken(token: string) {
  return async (dispatch: AppDispatch) => {
    try {
      const res = await axios.get(`/auth/validate-token`, {
        params: { token },
      });
      return res.data;
    } catch (err: any) {
      router.navigate('/register');
      if (err.response.data) {
        dispatch(authError(err.response.data));
        toast.error(err.response.data);
      }
      return;
    }
  };
}

export function createCompany(data: any) {
  return async (dispatch: AppDispatch) => {
    try {
      const res = await axios.post('/auth/create-company', data);
      const token = res.data;

      dispatch(receiveToken(token, false));
      dispatch(doInit(true));
    } catch (err: any) {
      if (err.response.data) {
        toast.error(err.response.data);
      }
    }
  };
}
