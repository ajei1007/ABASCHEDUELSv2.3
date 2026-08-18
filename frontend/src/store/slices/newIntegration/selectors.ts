import type { RootState } from '../../';

export const newIntegrationSoftwareSelector = (state: RootState) =>
  state.newIntegration.software;

export const newIntegrationShownLoginModalSelector = (state: RootState) =>
  state.newIntegration.shownLoginModal;

export const newIntegrationShownIntegrationModalSelector = (state: RootState) =>
  state.newIntegration.shownIntegrationModal;

export const newIntegrationCheckingCredentialsSelector = (state: RootState) =>
  state.newIntegration.checkingCredentials;
