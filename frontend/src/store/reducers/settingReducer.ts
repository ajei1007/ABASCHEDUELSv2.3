import generateTodaysStartTime from 'pages/calendar/utils/generateTodaysStartTime';
import {
  SettingsActionTypes,
  type SettingsAction,
  type SettingsState,
} from './../../types/redux/settings';
import moment from 'moment';

const initialState: SettingsState = {
  settingsCompany: {
    company: {
      membership: 'basic',
    },
  },
  settingsCompanyLoading: false,
  schedulerLocked: false,
  lockedParentBranches: [],
  isModalOpen: false,
  settingValues: {
    initialized: false,
    selectedBranches: [],
    subgroupsFilterLabels: null,
    resourceFilterLabels: null,
    hideCancelations: true,
    isolateCanceled: false,
    rolesDefault: [],
    timeConstraintUpperBuffer: null,
    timeConstraintLowerBuffer: null,
    timeconstraints: false,
    noGaps: true,
    driveTime: true,
    weekends: false,
    teamSeparation: 1,
    blocks: false,
    // Orange must be always true (BUGS-168)
    orange: true,
    driveDistanceMax: false,
    driveDistanceMaxQuantity: 30,
    driveDistanceMaxUnit: 'mi',
    driveTimeQuantity: 30,
    backgroundColorRole: null,
    borderColorRole: null,
    overbooking: true,
    emptyAvailability: true,
    notAvailableBusy: true,
    differentBranch: true,
    locationQuantity: 2,
    branchDefault: null,
    branchDefaultName: '',
    totalCustom: 'total',
    defaultActivity: {},
    onboardingSelection: [],
    isOnboarding: false,
    defaultLocation: {},
    timeInterval: 15,
    driveTimeUnit: 'Minutes',
    statsDefault: [],
    statsViewEnabled: false,
    subgroupsFilter: [],
    isolatedResources: [],
    roleFilter: [],
    businessStartTime: generateTodaysStartTime(),
    businessEndTime: moment(generateTodaysStartTime()).add(14, 'h').toDate(),
    quickStatFilter: ['Direct', 'Supervision', 'Drive'],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    highlightRecentlyChanged: false,
    highlightRecentlyChangedHideOtherEvents: false,
    highlightRecentlyChangedTimeWindow: null,
    groupResourcesByRole: false,
    hideUsersWithNoAvailability: false,
  },
  settingsLoading: true,
};

export default function settingReducer(
  state = initialState,
  action: SettingsAction,
): SettingsState {
  switch (action.type) {
    case SettingsActionTypes.OPEN_SETTING_MODAL:
      return { ...state, isModalOpen: true };
    case SettingsActionTypes.CLOSE_SETTING_MODAL:
      return { ...state, isModalOpen: false };
    case SettingsActionTypes.SET_SETTINGS_LOADING:
      return { ...state, settingsLoading: !state.settingsLoading };
    case SettingsActionTypes.UPDATE_TIMEZONE:
      return {
        ...state,
        settingValues: {
          ...state.settingValues,
          timezone: action.payload,
        },
      };
    case SettingsActionTypes.SETTING_VALUES:
      const updatedSettingValues = {
        ...state.settingValues,
        ...action.settingValues,
      };
      return {
        ...state,
        settingValues: updatedSettingValues,
        settingsLoading: false,
      };

    case SettingsActionTypes.SET_SETTINGS_COMPANY_LOADING:
      return {
        ...state,
        settingsCompanyLoading: action.payload,
      };
    case SettingsActionTypes.SET_SETTINGS_COMPANY:
      return {
        ...state,
        settingsCompany: action.settingsCompany,
      };
    case SettingsActionTypes.SET_SCHEDULER_LOCKED:
      const updatedState = {
        ...state,
        schedulerLocked: action.schedulerLocked,
      };
      if (action.lockedParentBranches) {
        updatedState.lockedParentBranches = action.lockedParentBranches;
      }
      return updatedState;
    case SettingsActionTypes.UPDATE_ALIAS_SUCCESS:
      return {
        ...state,
        settingsCompany: {
          ...state.settingsCompany,
          isAlias: action.alias,
          aliasFormatType:
            action.aliasFormatType ??
            state.settingsCompany.aliasFormatType ??
            null,
        },
      };
    default:
      return state;
  }
}
