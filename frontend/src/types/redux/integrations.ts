export interface IntegrationState {
  fetchingIntegrationLoading: boolean,
  integrationLoginModal: boolean,
  selectedIntegrationSoftware: any,
  integrationAuthType: any, // null | 'sync' | 'integration'
  syncedUsers: Array<any>,
  failedUsers: Array<any>,
  theraQuestionAndAnswers: any,
}

export enum IntegrationActionTypes {
  SET_THERA_QUESTIONS_AND_ANSWERS = 'SET_THERA_QUESTIONS_AND_ANSWERS',
  SET_INTEGRATION_AUTH_TYPE = 'SET_INTEGRATION_AUTH_TYPE',
  SET_SYNCED_USERS = 'SET_SYNCED_USERS',
  SET_INTEGRATION_MODAL = 'SET_INTEGRATION_MODAL',
  SET_FETCHING_INTEGRATION_LOADING = 'SET_FETCHING_INTEGRATION_LOADING',
  SET_SELECTED_INTEGRATION_SOFTWARE = 'SET_SELECTED_INTEGRATION_SOFTWARE'
}

interface SetFetchingIntegrationLoadingAction {
  type: typeof IntegrationActionTypes.SET_FETCHING_INTEGRATION_LOADING
  fetchingIntegrationLoading: boolean
}

interface SetIntegrationModalAction {
  type: typeof IntegrationActionTypes.SET_INTEGRATION_MODAL
  integrationLoginModal: boolean
}

interface SetSetectedIntegrationSoftwareAction {
  type: typeof IntegrationActionTypes.SET_SELECTED_INTEGRATION_SOFTWARE
  selectedIntegrationSoftware: any
}

interface SetIntegrationAuthTypeAction {
  type: typeof IntegrationActionTypes.SET_INTEGRATION_AUTH_TYPE
  integrationAuthType: any
}

interface SetTheraQuestionsAndAnswersAction {
  type: typeof IntegrationActionTypes.SET_THERA_QUESTIONS_AND_ANSWERS
  payload: {
    theraQuestionAndAnswers: any; 
  };
}

interface SetSyncedUserAction {
  type: typeof IntegrationActionTypes.SET_SYNCED_USERS
  payload: {
    syncedUsers: Array<any>;
    failedUsers: Array<any>;
  };
}

export type IntegrationAction =
  | SetFetchingIntegrationLoadingAction
  | SetIntegrationModalAction
  | SetSetectedIntegrationSoftwareAction
  | SetIntegrationAuthTypeAction
  | SetTheraQuestionsAndAnswersAction
  | SetSyncedUserAction