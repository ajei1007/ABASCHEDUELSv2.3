import { type IntegrationAction, IntegrationActionTypes, type IntegrationState } from 'types/redux/integrations';

const initialState: IntegrationState = {
  fetchingIntegrationLoading: false,
  integrationLoginModal: false,
  selectedIntegrationSoftware: null,
  integrationAuthType: null, // null | 'sync' | 'integration'
  syncedUsers: [],
  failedUsers: [],
  theraQuestionAndAnswers: null,
};

export default function integrationReducer(
  state = initialState,
  action: IntegrationAction,
): IntegrationState {
  switch (action.type) {
    case IntegrationActionTypes.SET_FETCHING_INTEGRATION_LOADING:
      return {
        ...state,
        fetchingIntegrationLoading: action.fetchingIntegrationLoading,
      };
    case IntegrationActionTypes.SET_INTEGRATION_MODAL:
      return {
        ...state,
        integrationLoginModal: action.integrationLoginModal,
      };
    case IntegrationActionTypes.SET_SELECTED_INTEGRATION_SOFTWARE:
      return {
        ...state,
        selectedIntegrationSoftware: action.selectedIntegrationSoftware,
      };
    case IntegrationActionTypes.SET_INTEGRATION_AUTH_TYPE:
      return {
        ...state,
        integrationAuthType: action.integrationAuthType,
      };
    case IntegrationActionTypes.SET_SYNCED_USERS:
      return {
        ...state,
        syncedUsers: action.payload?.syncedUsers ?? [],
        failedUsers: action.payload?.failedUsers ?? [],
      };
    case IntegrationActionTypes.SET_THERA_QUESTIONS_AND_ANSWERS:
      return {
        ...state,
        theraQuestionAndAnswers: action.payload ?? null,
      };
    default:
      return state;
  }
}
