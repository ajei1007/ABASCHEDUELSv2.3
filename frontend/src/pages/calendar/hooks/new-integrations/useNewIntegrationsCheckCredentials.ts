import { useCallback } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  setSoftware,
  setCheckingCredentials,
  setShownLoginModal,
  setShownIntegrationModal,
} from 'store/slices/newIntegration/actions';
import { newIntegrationSoftwareSelector } from 'store/slices/newIntegration/selectors';
import type { TIntegrationSoftware } from 'types';

export function useNewIntegrationsCheckCredentials() {
  const dispatch = useAppDispatch();
  const newIntegrationSoftware = useAppSelector(newIntegrationSoftwareSelector);

  const handleNewIntegrate = useCallback(
    async (software: TIntegrationSoftware) => {
      if (newIntegrationSoftware) {
        return;
      }

      dispatch(setCheckingCredentials(true));
      dispatch(setSoftware(software));
      try {
        const response = await axios.get(
          `/integrations/check-login-credentials/${software}`,
        );

        if (response.data.result) {
          dispatch(setShownIntegrationModal(true));
        } else {
          dispatch(setShownLoginModal(true));
        }
      } catch (error: any) {
        dispatch(setSoftware(null));
        const msg = error?.response?.data;
        if (msg) {
          toast.error(msg);
        } else {
          toast.error('Something went wrong. Try again!');
        }
      } finally {
        dispatch(setCheckingCredentials(false));
      }
    },
    [newIntegrationSoftware, dispatch],
  );

  return {
    handleNewIntegrate,
  };
}
