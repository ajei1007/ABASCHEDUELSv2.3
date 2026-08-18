// Options
export enum ConstraintTypesValueTypes {
  MATCHING = 'matching',
  UNMATCHING = 'unmatching',
  USER_TO_USER = 'usertouser',
  USER_TO_SESSION = 'usertosession',
  TIME = 'time',
  GAPS = 'gaps',
  DRIVE = 'drive',
  GROUPING = 'grouping',
  BACKTOBACK = 'backToBack',
  BREAKQUANTITY = 'breakQuantity',
  PRIORITY = 'priority',
  AUTHORIZATION = 'authorization',
  DISTANCE = 'distance',
  SESSION_LENGTH = 'sessionlength',
  SUPERVISION = 'supervisionrate',
  SIBLING_BRANCH = 'siblingbranch',
}

export enum TagValueTypes {
  HEALTH_AND_SAFETY = 'HealthAndSafety',
  SHIELD = 'Shield',
  SHIELD_OUTLINED = 'ShieldOutlined',
}

export const CONSTRAINT_TYPES = [
  { label: 'Matching', value: ConstraintTypesValueTypes.MATCHING },
  { label: 'Unmatching', value: ConstraintTypesValueTypes.UNMATCHING },
  { label: 'Session Length', value: ConstraintTypesValueTypes.SESSION_LENGTH },
  { label: 'Authorization', value: ConstraintTypesValueTypes.AUTHORIZATION },
  {
    label: 'User to User(s) Frequency',
    value: ConstraintTypesValueTypes.USER_TO_USER,
  },
  {
    label: 'User Session Frequency',
    value: ConstraintTypesValueTypes.USER_TO_SESSION,
  },
  { label: 'Time', value: ConstraintTypesValueTypes.TIME },
  { label: 'Gaps', value: ConstraintTypesValueTypes.GAPS },
  { label: 'Drive', value: ConstraintTypesValueTypes.DRIVE },
  { label: 'Distance', value: ConstraintTypesValueTypes.DISTANCE },
  { label: 'Group', value: ConstraintTypesValueTypes.GROUPING },
  { label: 'Back to Back', value: ConstraintTypesValueTypes.BACKTOBACK },
  { label: 'Break Quantity', value: ConstraintTypesValueTypes.BREAKQUANTITY },
  { label: 'Priority', value: ConstraintTypesValueTypes.PRIORITY },
  { label: 'Supervision', value: ConstraintTypesValueTypes.SUPERVISION },
  { label: 'Sibling Branch', value: ConstraintTypesValueTypes.SIBLING_BRANCH },
];

export enum AntecedentAndConsequenceTypeTypes {
  SPECIFIC_USER = 'specific',
  ROLES_OR_SUBGROUPS = 'type',
}
export const ANTECEDENT_AND_CONSEQUENCE_TYPES = [
  {
    label: 'Specific Users',
    value: AntecedentAndConsequenceTypeTypes.SPECIFIC_USER,
  },
  {
    label: 'Roles',
    value: AntecedentAndConsequenceTypeTypes.ROLES_OR_SUBGROUPS,
  },
];

export const ROLES_TAGS_BRANCHES = [
  {
    label: 'Roles',
    value: 'Roles',
  },
  {
    label: 'Tags',
    value: 'Tags',
  },
  {
    label: 'Branches',
    value: 'Branches',
  },
];

export enum DaySelectionTypes {
  ALL_DAY = 'alldays',
  CERTAIN_DAYS = 'notalldays',
}
export const DAY_SELECTION_OPTIONS = [
  {
    label: 'All Day',
    value: DaySelectionTypes.ALL_DAY,
  },
  {
    label: 'Certain Days',
    value: DaySelectionTypes.CERTAIN_DAYS,
  },
];

export const FREQUENCY_OPTIONS = [
  { label: 'per Day', value: 'day' },
  { label: 'per Week', value: 'week' },
  { label: 'per Session', value: 'session' },
];

export enum UnitOptionsTypes {
  DISTANCE = 'distance',
  TIME = 'time',
  UNIT = 'unit',
  PERCENTAGE = '%',
}
export const UNITS_OPTIONS = [
  // distance
  { label: 'Miles', value: 'miles', type: UnitOptionsTypes.DISTANCE },
  { label: 'Kilometers', value: 'kilometers', type: UnitOptionsTypes.DISTANCE },
  // time
  { label: 'Seconds', value: 'seconds', type: UnitOptionsTypes.TIME },
  { label: 'Minutes', value: 'minutes', type: UnitOptionsTypes.TIME },
  { label: 'Hours', value: 'hours', type: UnitOptionsTypes.TIME },
  { label: 'Days', value: 'days', type: UnitOptionsTypes.TIME },
  { label: 'Weeks', value: 'weeks', type: UnitOptionsTypes.TIME },
  { label: 'Months', value: 'months', type: UnitOptionsTypes.TIME },
  { label: 'Years', value: 'years', type: UnitOptionsTypes.TIME },
  // 15min
  { label: 'Unit', value: 'unit', type: UnitOptionsTypes.UNIT },

  // percentage
  {
    label: 'Percentage',
    value: 'percentage',
    type: UnitOptionsTypes.PERCENTAGE,
  },
];

export enum EachOrAllTypes {
  ALL = 'all',
  EACH = 'each',
}
export const EACH_OR_ALL_OPTIONS = [
  { label: 'Apply to all Users (collective)', value: EachOrAllTypes.ALL },
  { label: 'Apply to Each User (individual)', value: EachOrAllTypes.EACH },
];
