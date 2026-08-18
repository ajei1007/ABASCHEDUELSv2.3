export interface SettingValuesType {
  rolesDefault: Array<any>;
  statsDefault: Array<any>;
  statsViewEnabled: boolean;
  defaultActivity: any;
  onboardingSelection: any[];
  isOnboarding: boolean;
  defaultLocation: any;
  noGaps: boolean;
  driveTime: boolean;
  weekends: boolean;
  blocks: boolean;
  orange: boolean;
  overbooking: boolean;
  emptyAvailability: boolean;
  notAvailableBusy: boolean;
  differentBranch: boolean;
  hideCancelations: boolean;
  subgroupsFilter: Array<any>;
  roleFilter: Array<any>;
  quickStatFilter: Array<string>;
  isolatedResources: Array<any>;
  businessStartTime: Date;
  businessEndTime: Date;
  backgroundColorRole: any;
  borderColorRole: any;
  timezone: string;
  selectedBranches: any;
  initialized: boolean;
  subgroupsFilterLabels: any;
  resourceFilterLabels: any;
  isolateCanceled: boolean;
  timeConstraintUpperBuffer: any;
  timeConstraintLowerBuffer: any;
  timeconstraints: any;
  teamSeparation: any;
  driveDistanceMax: boolean;
  driveDistanceMaxQuantity: number;
  driveDistanceMaxUnit: string;
  driveTimeQuantity: number;
  locationQuantity: number;
  branchDefault: any;
  branchDefaultName: string;
  totalCustom: string;
  timeInterval: number;
  driveTimeUnit: string;
  highlightRecentlyChanged: boolean;
  highlightRecentlyChangedHideOtherEvents: boolean;
  highlightRecentlyChangedTimeWindow: string | null;
  /** When true, group calendar resources by matching role key; otherwise use resource type */
  groupResourcesByRole?: boolean;
  hideUsersWithNoAvailability: boolean;
}

export interface SettingsState {
  isModalOpen: boolean;
  settingValues: SettingValuesType;
  settingsCompany: any;
  settingsCompanyLoading: boolean;
  schedulerLocked: boolean;
  lockedParentBranches: Array<any>;
  settingsLoading: boolean;
}

export enum SettingsActionTypes {
  OPEN_SETTING_MODAL = 'OPEN_SETTING_MODAL',
  SET_SETTINGS_LOADING = 'SET_SETTINGS_LOADING',
  CLOSE_SETTING_MODAL = 'CLOSE_SETTING_MODAL',
  UPDATE_TIMEZONE = 'UPDATE_TIMEZONE',
  SETTING_VALUES = 'SETTING_VALUES',
  SET_SETTINGS_COMPANY_LOADING = 'SET_SETTINGS_COMPANY_LOADING',
  SET_SETTINGS_COMPANY = 'SET_SETTINGS_COMPANY',
  SET_SCHEDULER_LOCKED = 'SET_SCHEDULER_LOCKED',
  UPDATE_ALIAS_SUCCESS = 'UPDATE_ALIAS_SUCCESS',
}

interface OpenSettingsModalAction {
  type: typeof SettingsActionTypes.OPEN_SETTING_MODAL;
}

interface CloseSettingsModalAction {
  type: typeof SettingsActionTypes.CLOSE_SETTING_MODAL;
}

interface UpdateTimezoneAction {
  type: typeof SettingsActionTypes.UPDATE_TIMEZONE;
  payload: string;
}

interface SettingValueAction {
  type: typeof SettingsActionTypes.SETTING_VALUES;
  settingValues: SettingValuesType;
}
interface SetSettingsCompanyLoading {
  type: typeof SettingsActionTypes.SET_SETTINGS_COMPANY_LOADING;
  payload: boolean;
}
interface SetSettingsCompany {
  type: typeof SettingsActionTypes.SET_SETTINGS_COMPANY;
  settingsCompany: any;
}
interface SetSchedulerLocked {
  type: typeof SettingsActionTypes.SET_SCHEDULER_LOCKED;
  schedulerLocked: any;
  lockedParentBranches?: any;
}
interface SetSettingsLoading {
  type: typeof SettingsActionTypes.SET_SETTINGS_LOADING;
  settingsLoading: any;
}
interface UpdateAliasSuccess {
  type: typeof SettingsActionTypes.UPDATE_ALIAS_SUCCESS;
  alias: boolean;
  aliasFormatType?: string | null;
}
export type SettingsAction =
  | OpenSettingsModalAction
  | CloseSettingsModalAction
  | UpdateTimezoneAction
  | SettingValueAction
  | SetSettingsCompanyLoading
  | SetSettingsCompany
  | SetSchedulerLocked
  | SetSettingsLoading
  | UpdateAliasSuccess;
