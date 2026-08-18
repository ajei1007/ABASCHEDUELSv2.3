export type companyPlanTypes = 'basic' | 'standard' | 'pro';

const basicFeatures = {
  smartSolutionGenerator: true,
  customActivities: true,
  customColorsForClientsEmployeesAndActivities: true,
  sandboxMode: true,
  lockSchedule: true,
  reports: true,
  detailedGraphsAndCharts: true,
  authorizationTracking: true,
  cancelationReport: true,
  createCustomRoles: true,
  customRolePermission: true,
  quickViewStatistics: true,
  copyAndPaste: true,
  liveEvents: true,
  undoRedo: true,
  isolateAndCancel: true,
  pdfView: true,
  appWithPushNotifications: true,
  matchingAndUnmatchingUsers: true,
  multiselect: true,
  blockScheduling: true,
  recurringAppointments: true,
  severalDifferentViewsWithFilter: true,
  bulkDeleting: true,
  availabilityWithDateRanges: true,
  addTimeOff: true,
  accessToLMSAndTrainingLibrary: true,
  integrationCapability: true,
  abilityToMakeGroupsAndTags: true,
  // Features exclusive to Standard or Pro
  flagging: false,
  requests: false,
  customConstraintBuilder: false,
  calculationOfDriveTime: false,
  // Pro features
  optimizer: false,
};
const standartFeatures = {
  ...basicFeatures,
  // Additional features in Standard
  flagging: true, // process.env.REACT_APP_FLAGGING_ENABLED ? process.env.REACT_APP_FLAGGING_ENABLED === 'true' : false,
  requests: true,
  customConstraintBuilder: true,
  calculationOfDriveTime: true,
};

interface featureTypes {
  basic: any;
  standard: any;
  pro: any;
}
const features: featureTypes = {
  basic: basicFeatures,
  standard: standartFeatures,
  pro: {
    ...standartFeatures,
    // Pro exclusive features
    optimizer: true,
    chat: false,
  },
};

export default features;
