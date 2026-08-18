import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { IntegrationActionTypes } from 'types/redux/integrations';

export const setFetchingIntegrationLoading = (isLoading: boolean) => {
  return (dispatch: any) => {
    dispatch({
      type: IntegrationActionTypes.SET_FETCHING_INTEGRATION_LOADING,
      fetchingIntegrationLoading: isLoading,
    });
  };
};

export const syncUsers = (
  credentials: null | string | number | any = null,
  syncEventUpdatedInThePast: any,
) => {
  return async (dispatch: any, getState: any) => {
    const deviceAddress = getState().auth.deviceAddress;
    const selectedIntegrationSoftware =
      getState().integration?.selectedIntegrationSoftware;
    const timezone = getState().settings?.settingValues?.timezone;
    const currentBranch = getState().calendar.current_branches.map(
      (e: any) => e.value,
    )?.[0];
    const withCredentials = credentials ? true : false;

    dispatch(setFetchingIntegrationLoading(true));
    try {
      const response = await axios.post(
        `/integrations/sync-users/${selectedIntegrationSoftware}`,
        {
          branch: currentBranch,
          credentials,
          ipaddress: deviceAddress,
          timezone,
          withCredentials,
          syncEventUpdatedInThePast,
        },
      );

      if (response?.data?.question) {
        dispatch({
          type: IntegrationActionTypes.SET_THERA_QUESTIONS_AND_ANSWERS,
          payload: response.data,
        });
        return;
      }

      dispatch({
        type: IntegrationActionTypes.SET_INTEGRATION_AUTH_TYPE,
        integrationAuthType: null,
      });
      dispatch({
        type: IntegrationActionTypes.SET_SYNCED_USERS,
        payload: response.data,
      });
      dispatch({
        type: IntegrationActionTypes.SET_THERA_QUESTIONS_AND_ANSWERS,
        payload: null,
      });
    } catch (error) {
      const err = error as AxiosError;
      const errorData = err?.response?.data as any;
      // const status = error?.response.status;

      if (errorData) {
        toast.error(errorData);
      } else {
        toast.error('Something went wrong. Try again!');
      }

      dispatch({
        type: IntegrationActionTypes.SET_INTEGRATION_AUTH_TYPE,
        integrationAuthType: 'sync',
      });
      if (credentials?.QuestionID == null) {
        dispatch({
          type: IntegrationActionTypes.SET_THERA_QUESTIONS_AND_ANSWERS,
          payload: null,
        });
      }
    } finally {
      dispatch({
        type: IntegrationActionTypes.SET_INTEGRATION_MODAL,
        integrationLoginModal: true,
      });
      dispatch(setFetchingIntegrationLoading(false));
    }
  };
};

export const fetchSyncedUsers = () => {
  return async (dispatch: any, getState: any) => {
    const selectedIntegrationSoftware =
      getState().integration?.selectedIntegrationSoftware;
    const currentBranch = getState().calendar.current_branches.map(
      (e: any) => e.value,
    )?.[0];

    dispatch(setFetchingIntegrationLoading(true));
    try {
      const response = await axios.get(
        `/integrations/synced-users/${selectedIntegrationSoftware}`,
        { params: { branch: currentBranch } },
      );

      dispatch({
        type: IntegrationActionTypes.SET_INTEGRATION_AUTH_TYPE,
        integrationAuthType: null,
      });
      dispatch({
        type: IntegrationActionTypes.SET_SYNCED_USERS,
        payload: response.data,
      });
    } catch (error) {
      dispatch({
        type: IntegrationActionTypes.SET_INTEGRATION_AUTH_TYPE,
        integrationAuthType: 'sync',
      });
    } finally {
      dispatch({
        type: IntegrationActionTypes.SET_INTEGRATION_MODAL,
        integrationLoginModal: true,
      });
      dispatch(setFetchingIntegrationLoading(false));
    }
  };
};

export const doAuthentication = (platform: any) => {
  return async (dispatch: any) => {
    dispatch(setFetchingIntegrationLoading(true));
    try {
      const response = await axios.get(`/auth/integrations/${platform}`);

      const { username, password } = response.data;
      if (username || password) {
        await dispatch(integrateNow(response.data));
      }
    } catch (error) {
      const err = error as AxiosError;
      const status = err?.response?.status;
      if (status === 404) {
        dispatch({
          type: IntegrationActionTypes.SET_INTEGRATION_MODAL,
          integrationLoginModal: true,
        });
      }
    } finally {
      dispatch(setFetchingIntegrationLoading(false));
    }
  };
};

export const integrateNow = (
  credentials: null | string | number | any = null,
  syncEventUpdatedInThePast?: any,
) => {
  return async (dispatch: any, getState: any) => {
    const selectedIntegrationSoftware =
      getState().integration.selectedIntegrationSoftware;
    const deviceAddress = getState().auth.deviceAddress;
    const currentBranchIds = getState().calendar.current_branches.map(
      (e: any) => e.value,
    );

    dispatch(setFetchingIntegrationLoading(true));
    const reqBody = {
      credentials,
      withCredentials: Boolean(credentials),
      ipaddress: deviceAddress,
      timezone: getState().settings?.settingValues?.timezone,
      branches: currentBranchIds.join('|'),
      syncEventUpdatedInThePast,
    };
    try {
      const response = await axios.post(
        `/integrations/${selectedIntegrationSoftware}`,
        reqBody,
      );

      if (response?.data?.question) {
        dispatch({
          type: IntegrationActionTypes.SET_THERA_QUESTIONS_AND_ANSWERS,
          payload: response.data,
        });
        return;
      }

      if (response?.data?.msg) {
        toast.success(response?.data?.msg);
      } else {
        toast.success('Successfully integrated');
      }

      dispatch({
        type: IntegrationActionTypes.SET_INTEGRATION_AUTH_TYPE,
        integrationAuthType: null,
      });
      dispatch({
        type: IntegrationActionTypes.SET_INTEGRATION_MODAL,
        integrationLoginModal: false,
      });

      dispatch({
        type: IntegrationActionTypes.SET_THERA_QUESTIONS_AND_ANSWERS,
        payload: null,
      });
    } catch (error) {
      const err = error as AxiosError;
      const errorData = err?.response?.data as any;
      const status = err?.response?.status;

      if (status === 400 && Array.isArray(errorData) && errorData?.length) {
        errorData.forEach((e) => {
          toast.error(e.errorMessage ?? 'Something went wrong. Try again!');
        });
      }
      if (errorData) {
        toast.error(errorData);
      } else {
        toast.error('Something went wrong. Try again!');
      }

      if (status !== 400) {
        dispatch({
          type: IntegrationActionTypes.SET_INTEGRATION_AUTH_TYPE,
          integrationAuthType: 'integration',
        });
      }
      if (credentials?.QuestionID == null) {
        dispatch({
          type: IntegrationActionTypes.SET_THERA_QUESTIONS_AND_ANSWERS,
          payload: null,
        });
      }
    } finally {
      dispatch(setFetchingIntegrationLoading(false));
    }
  };
};
