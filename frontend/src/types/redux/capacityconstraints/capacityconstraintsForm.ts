export interface CapacityconstraintsFormState {
  findLoading: boolean;
  saveLoading: boolean;
  record: null | any;
}

export interface user1State {
  birthday: null;
  id: string;
  capacity: null;
  firstName: 'Admin';
  lastName: null;
  phoneNumber: null;
  email: 'Admin@mail.com';
  email1: null;
  email2: null;
  titleCustom: null;
  codeCustom: null;
  role: 'admin';
  disabled: boolean;
  needroom: boolean;
  needseat: boolean;
  overlap: boolean;
  emailVerified: boolean;
  password: string | any;
  emailVerificationToken: null;
  emailVerificationTokenExpiresAt: null;
  disabledAt: null;
  passwordResetTokenExpiresAt: null;
  passwordResetToken: null;
  provider: null;
  gender: null;
  customAddressId: null;
  alias: null;
  customPayorClientId: null;
  otherEmails: null;
  otherPhones: null;
  longitude: null;
  address: null;
  latitude: null;
  active: boolean;
  minHours: null;
  maxHours: null;
  color: null;
  borderColor: null;
  mobiletoken: null;
  address2: null;
  address2Default: boolean;
  billable: boolean;
  notWorking: boolean;
  auth: boolean;
  allBranches: boolean;
  paid: boolean;
  idCustom: null;
  idCustom2: null;
  waitlisted: boolean;
  calendarhide: boolean;
  priority: null;
  employeeratio: null;
  clientratio: null;
  hourlyrate: null;
  salary: null;
  supervision: boolean;
  hourlyrevenue: null;
  productivityInclude: boolean;
  productivityExclude: boolean;
  importHash: null;
  siblingGroupId: string;
  supervisionRateInclude: boolean;
  createdAt: Date | number | any;
  updatedAt: Date | number | any;
  deletedAt: null;
  parentId: null;
  colorsId: string;
  resourceId: null;
  companyId: string;
  locationTypeId: null;
  siblingUserId: null;
  address1RelationshipId: null;
  address2RelationshipId: null;
  createdById: string | any;
  updatedById: string | any;
}

export interface roles1State {
  id: string;
  name: string;
  dataAccess: null;
  statistics: string | any;
  constraints: string | any;
  events: string | any;
  subgroups: string | any;
  scheduler: string | any;
  availabilities: string | any;
  branches: null;
  cancellations: string | any;
  cancellationtypes: null;
  capacityconstraints: null;
  clock: null;
  distanceconstraints: null;
  eventpair: null;
  groupings: null;
  matches: null;
  nogapsconstraint: null;
  priorities: null;
  relationships: null;
  roles: null;
  settings: null;
  settingscompany: null;
  statusevents: null;
  timeconstraints: null;
  timeoff: null;
  timeofftypes: null;
  users: null;
  createEvent: boolean;
  openshift: boolean;
  editEvent: boolean;
  deleteEvent: boolean;
  createUser: boolean;
  editUser: boolean;
  deleteUser: boolean;
  createCancelation: boolean;
  deleteCancelation: boolean;
  createAvailability: boolean;
  editAvailability: boolean;
  deleteAvailability: boolean;
  viewReport: boolean;
  viewRole: boolean;
  createRole: boolean;
  editRole: boolean;
  deleteRole: boolean;
  viewUser: boolean;
  viewAvailability: boolean;
  viewCancelation: boolean;
  createBranch: boolean;
  editBranch: boolean;
  deleteBranch: boolean;
  viewBranch: boolean;
  createConstraint: boolean;
  editConstraint: boolean;
  deleteConstraint: boolean;
  viewConstraint: boolean;
  createSubgroup: boolean;
  editSubgroup: null;
  deleteSubgroup: boolean;
  viewSubgroup: boolean;
  editSubgroups: boolean;
  adminPushNotification: boolean;
  editStaffTrackerSettings: boolean;
  requestCancelation: boolean;
  requestTimeoff: boolean;
  requestAvailability: boolean;
  requestConfirmation: boolean;
  importHash: null;
  canEditEventSchedulerLocked: boolean;
  optimizerFeature: boolean;
  flaggingFeature: boolean;
  requestsFeature: boolean;
  productivityInclude: boolean;
  enableRequestNotifications: boolean;
  integrationFeature: boolean;
  canLockScheduler: boolean;
  createActivity: boolean;
  editActivity: boolean;
  supportRequest: boolean;
  createdAt: Date | number | any;
  updatedAt: Date | number | any;
  deletedAt: null;
  parentId: string | any;
  colorsId: null;
  dataAccessGroupId: null;
  branchTypeId: null;
  createdById: string | any;
  updatedById: null;
}
export interface CapacityConstraintsRecordState {
  id: string;
  min1: number;
  max1: number;
  min2: null | any;
  max2: null | any;
  min3: null | any;
  max3: null | any;
  min4: null | any;
  max4: null | any;
  priority: null;
  min5: null | any;
  max5: null | any;
  locationDisabled: boolean;
  disabled: boolean;
  rooms: boolean;
  importHash: null | any;
  createdAt: Date | number | any;
  updatedAt: Date | number | any;
  deletedAt: null;
  user1Id: string;
  user2Id: null;
  role1Id: string;
  role2Id: null;
  role3Id: null;
  role4Id: null;
  subgroup1Id: null;
  subgroup2Id: null;
  subgroup3Id: null;
  subgroup4Id: null;
  role5Id: null;
  subgroup5Id: null;
  createdById: string;
  updatedById: string;
  user1: user1State;
  user2: null | any;
  role1: roles1State;
  role2: null | any;
  role3: null | any;
  role4: null | any;
  subgroup1: null | any;
  subgroup2: null | any;
  subgroup3: null | any;
  subgroup4: null | any;
  role5: null | any;
  subgroup5: null | any;
}

export enum CapacityconstraintsFormActionTypes {
  CAPACITYCONSTRAINTS_FORM_RESET = 'CAPACITYCONSTRAINTS_FORM_RESET',
  CAPACITYCONSTRAINTS_FORM_FIND_STARTED = 'CAPACITYCONSTRAINTS_FORM_FIND_STARTED',
  CAPACITYCONSTRAINTS_FORM_FIND_SUCCESS = 'CAPACITYCONSTRAINTS_FORM_FIND_SUCCESS',
  CAPACITYCONSTRAINTS_FORM_FIND_ERROR = 'CAPACITYCONSTRAINTS_FORM_FIND_ERROR',
  CAPACITYCONSTRAINTS_FORM_CREATE_STARTED = 'CAPACITYCONSTRAINTS_FORM_CREATE_STARTED',
  CAPACITYCONSTRAINTS_FORM_CREATE_SUCCESS = 'CAPACITYCONSTRAINTS_FORM_CREATE_SUCCESS',
  CAPACITYCONSTRAINTS_FORM_CREATE_ERROR = 'CAPACITYCONSTRAINTS_FORM_CREATE_ERROR',
  CAPACITYCONSTRAINTS_FORM_UPDATE_STARTED = 'CAPACITYCONSTRAINTS_FORM_UPDATE_STARTED',
  CAPACITYCONSTRAINTS_FORM_UPDATE_SUCCESS = 'CAPACITYCONSTRAINTS_FORM_UPDATE_SUCCESS',
  CAPACITYCONSTRAINTS_FORM_UPDATE_ERROR = 'CAPACITYCONSTRAINTS_FORM_UPDATE_ERROR',
}

interface CapacityconstraintsFormReset {
  type: CapacityconstraintsFormActionTypes.CAPACITYCONSTRAINTS_FORM_RESET;
}

interface CapacityconstraintsFormFindStarted {
  type: CapacityconstraintsFormActionTypes.CAPACITYCONSTRAINTS_FORM_FIND_STARTED;
}

interface CapacityconstraintsFormFindSuccess {
  type: CapacityconstraintsFormActionTypes.CAPACITYCONSTRAINTS_FORM_FIND_SUCCESS;
  payload: CapacityConstraintsRecordState;
}

interface CapacityconstraintsFormFindError {
  type: CapacityconstraintsFormActionTypes.CAPACITYCONSTRAINTS_FORM_FIND_ERROR;
}

interface CapacityconstraintsFormCreateStarted {
  type: CapacityconstraintsFormActionTypes.CAPACITYCONSTRAINTS_FORM_CREATE_STARTED;
}

interface CapacityconstraintsFormCreateSuccess {
  type: CapacityconstraintsFormActionTypes.CAPACITYCONSTRAINTS_FORM_CREATE_SUCCESS;
}

interface CapacityconstraintsFormCreateError {
  type: CapacityconstraintsFormActionTypes.CAPACITYCONSTRAINTS_FORM_CREATE_ERROR;
}

interface CapacityconstraintsFormUpdateStarted {
  type: CapacityconstraintsFormActionTypes.CAPACITYCONSTRAINTS_FORM_UPDATE_STARTED;
}

interface CapacityconstraintsFormUpdateSuccess {
  type: CapacityconstraintsFormActionTypes.CAPACITYCONSTRAINTS_FORM_UPDATE_SUCCESS;
}

interface CapacityconstraintsFormUpdateError {
  type: CapacityconstraintsFormActionTypes.CAPACITYCONSTRAINTS_FORM_UPDATE_ERROR;
}

export type CapacityconstraintsFormAction =
  | CapacityconstraintsFormReset
  | CapacityconstraintsFormFindStarted
  | CapacityconstraintsFormFindSuccess
  | CapacityconstraintsFormFindError
  | CapacityconstraintsFormCreateStarted
  | CapacityconstraintsFormCreateSuccess
  | CapacityconstraintsFormCreateError
  | CapacityconstraintsFormUpdateStarted
  | CapacityconstraintsFormUpdateSuccess
  | CapacityconstraintsFormUpdateError;
