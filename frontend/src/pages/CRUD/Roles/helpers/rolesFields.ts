const rolesFields = {
  id: { type: 'id', label: 'ID' },
  name: { type: 'string', label: 'Name' },
  parent: { type: 'relation_one', label: 'Parent' },
  colors: { type: 'relation_one', label: 'Color' },
  dataAccess: {
    type: 'enum',
    label: 'Data Access',
    options: [
      { value: 'All', label: 'All' },
      { value: 'Branch', label: 'Branch' },
      { value: 'User', label: 'User' },
    ],
  },
  statistics: {
    type: 'enum',
    label: 'Statistics',

    options: [
      { value: 'E', label: 'E' },

      { value: 'V', label: 'V' },

      { value: 'NA', label: 'NA' },
    ],
  },

  constraints: {
    type: 'enum',
    label: 'Constraints',

    options: [
      { value: 'E', label: 'E' },

      { value: 'V', label: 'V' },

      { value: 'NA', label: 'NA' },
    ],
  },

  events: {
    type: 'enum',
    label: 'Events',

    options: [
      { value: 'E', label: 'E' },

      { value: 'V', label: 'V' },

      { value: 'NA', label: 'NA' },
    ],
  },

  subgroups: {
    type: 'enum',
    label: 'Subgroups',
    options: [
      { value: 'E', label: 'E' },

      { value: 'V', label: 'V' },

      { value: 'NA', label: 'NA' },
    ],
  },

  availabilities: {
    type: 'enum',
    label: 'Availabilities',

    options: [
      { value: 'E', label: 'E' },

      { value: 'V', label: 'V' },

      { value: 'NA', label: 'NA' },
    ],
  },

  branches: {
    type: 'enum',
    label: 'Branches',

    options: [
      { value: 'E', label: 'E' },

      { value: 'V', label: 'V' },

      { value: 'NA', label: 'NA' },
    ],
  },

  cancellations: {
    type: 'enum',
    label: 'Cancellations',

    options: [
      { value: 'E', label: 'E' },

      { value: 'V', label: 'V' },

      { value: 'NA', label: 'NA' },
    ],
  },

  cancellationtypes: {
    type: 'enum',
    label: 'Cancellation Types',

    options: [
      { value: 'E', label: 'E' },

      { value: 'V', label: 'V' },

      { value: 'NA', label: 'NA' },
    ],
  },

  capacityconstraints: {
    type: 'enum',
    label: 'Capacity Constraints',

    options: [
      { value: 'E', label: 'E' },

      { value: 'V', label: 'V' },

      { value: 'NA', label: 'NA' },
    ],
  },

  clock: {
    type: 'enum',
    label: 'Clock',

    options: [
      { value: 'E', label: 'E' },

      { value: 'V', label: 'V' },

      { value: 'NA', label: 'NA' },
    ],
  },

  distanceconstraints: {
    type: 'enum',
    label: 'Distance Constraints',

    options: [
      { value: 'E', label: 'E' },

      { value: 'V', label: 'V' },

      { value: 'NA', label: 'NA' },
    ],
  },

  eventpair: {
    type: 'enum',
    label: 'Event Pair',

    options: [
      { value: 'E', label: 'E' },

      { value: 'V', label: 'V' },

      { value: 'NA', label: 'NA' },
    ],
  },

  groupings: {
    type: 'enum',
    label: 'Groupings',

    options: [
      { value: 'E', label: 'E' },

      { value: 'V', label: 'V' },

      { value: 'NA', label: 'NA' },
    ],
  },

  matches: {
    type: 'enum',
    label: 'Matches',

    options: [
      { value: 'E', label: 'E' },

      { value: 'V', label: 'V' },

      { value: 'NA', label: 'NA' },
    ],
  },

  nogapsconstraint: {
    type: 'enum',
    label: 'No Gaps Constraint',

    options: [
      { value: 'E', label: 'E' },

      { value: 'V', label: 'V' },

      { value: 'NA', label: 'NA' },
    ],
  },

  priorities: {
    type: 'enum',
    label: 'Priorities',

    options: [
      { value: 'E', label: 'E' },

      { value: 'V', label: 'V' },

      { value: 'NA', label: 'NA' },
    ],
  },

  relationships: {
    type: 'enum',
    label: 'Relationships',

    options: [
      { value: 'E', label: 'E' },

      { value: 'V', label: 'V' },

      { value: 'NA', label: 'NA' },
    ],
  },

  roles: {
    type: 'enum',
    label: 'Roles',

    options: [
      { value: 'E', label: 'E' },

      { value: 'V', label: 'V' },

      { value: 'NA', label: 'NA' },
    ],
  },

  settings: {
    type: 'enum',
    label: 'Settings',

    options: [
      { value: 'E', label: 'E' },

      { value: 'V', label: 'V' },

      { value: 'NA', label: 'NA' },
    ],
  },

  settingscompany: {
    type: 'enum',
    label: 'Settings Company',

    options: [
      { value: 'E', label: 'E' },

      { value: 'V', label: 'V' },

      { value: 'NA', label: 'NA' },
    ],
  },

  statusevents: {
    type: 'enum',
    label: 'Status Events',

    options: [
      { value: 'E', label: 'E' },

      { value: 'V', label: 'V' },

      { value: 'NA', label: 'NA' },
    ],
  },

  timeconstraints: {
    type: 'enum',
    label: 'Time Constraints',

    options: [
      { value: 'E', label: 'E' },

      { value: 'V', label: 'V' },

      { value: 'NA', label: 'NA' },
    ],
  },

  timeoff: {
    type: 'enum',
    label: 'Timeoff',

    options: [
      { value: 'E', label: 'E' },

      { value: 'V', label: 'V' },

      { value: 'NA', label: 'NA' },
    ],
  },

  timeofftypes: {
    type: 'enum',
    label: 'Timeoff Types',

    options: [
      { value: 'E', label: 'E' },

      { value: 'V', label: 'V' },

      { value: 'NA', label: 'NA' },
    ],
  },

  users: {
    type: 'enum',
    label: 'Users',
    options: [
      { value: 'E', label: 'E' },
      { value: 'V', label: 'V' },
      { value: 'NA', label: 'NA' },
    ],
  },
  scheduler: {
    type: 'enum',
    label: 'Scheduler',
    options: [
      { value: 'E', label: 'E' },
      { value: 'V', label: 'V' },
      { value: 'NA', label: 'NA' },
    ],
  },
  dataAccessGroup: {
    type: 'relation_one',
    label: 'Data Access Group',
  },
  dataAccessGroups: {
    type: 'relation_many',
    label: 'Data Access Groups',
  },
  dataAccessGroupsReal: {
    type: 'relation_many',
    label: 'Data Access Groups Real',
  },
  createEvent: {
    type: 'boolean',
    label: 'Create Event',
  },
  editEvent: {
    type: 'boolean',
    label: 'Edit Event',
  },
  deleteEvent: {
    type: 'boolean',
    label: 'Delete Event',
  },
  createUser: {
    type: 'boolean',
    label: 'Create User',
  },
  editUser: {
    type: 'boolean',
    label: 'Edit User',
  },
  deleteUser: {
    type: 'boolean',
    label: 'Delete User',
  },
  createCancelation: {
    type: 'boolean',
    label: 'Create Cancellation',
  },
  deleteCancelation: {
    type: 'boolean',
    label: 'Delete Cancellation',
  },
  createAvailability: {
    type: 'boolean',
    label: 'Create Availability',
  },
  editAvailability: {
    type: 'boolean',
    label: 'Edit Availability',
  },
  deleteAvailability: {
    type: 'boolean',
    label: 'Delete Availability',
  },
  viewReport: {
    type: 'boolean',
    label: 'View Report',
  },
  viewRole: {
    type: 'boolean',
    label: 'View Role',
  },
  createRole: {
    type: 'boolean',
    label: 'Create Role',
  },
  editRole: {
    type: 'boolean',
    label: 'Edit Role',
  },
  deleteRole: {
    type: 'boolean',
    label: 'Delete Role',
  },
  viewUser: {
    type: 'boolean',
    label: 'View User',
  },
  viewAvailability: {
    type: 'boolean',
    label: 'View Availability',
  },
  viewCancelation: {
    type: 'boolean',
    label: 'View Cancellation',
  },
  createBranch: {
    type: 'boolean',
    label: 'Create Branch',
  },
  editBranch: {
    type: 'boolean',
    label: 'Edit Branch',
  },
  deleteBranch: {
    type: 'boolean',
    label: 'Delete Branch',
  },
  viewBranch: {
    type: 'boolean',
    label: 'View Branch',
  },
  createConstraint: {
    type: 'boolean',
    label: 'Create Constraint',
  },
  editConstraint: {
    type: 'boolean',
    label: 'Edit Constraint',
  },
  deleteConstraint: {
    type: 'boolean',
    label: 'Delete Constraint',
  },
  viewConstraint: {
    type: 'boolean',
    label: 'View Constraint',
  },
  createSubgroup: {
    type: 'boolean',
    label: 'Create Subgroup',
  },
  editSubgroup: {
    type: 'string',
    label: 'Edit Subgroup',
  },
  deleteSubgroup: {
    type: 'boolean',
    label: 'Delete Subgroup',
  },
  viewSubgroup: {
    type: 'boolean',
    label: 'View Subgroup',
  },
  editSubgroups: {
    type: 'boolean',
    label: 'Edit Subgroups',
  },
  branchType: {
    type: 'relation_one',
    label: 'Branch Type',
  },
  standardRoles: {
    type: 'relation_one',
    label: 'Standard Role',
  },
  adminPushNotification: {
    type: 'boolean',
    label: 'Admin Push Notification',
  },
  canEditEventSchedulerLocked: {
    type: 'boolean',
    label: 'Edit Locked Scheduler',
  },
  enableRequestNotifications: {
    type: 'boolean',
    label: 'Receive Notifications on Request Updates',
  },
  integrationFeature: {
    type: 'boolean',
    label: 'Integration Feature',
  },
  requestCancelation: {
    type: 'boolean',
    label: 'Request Cancellation on Mobile',
  },
  requestTimeoff: {
    type: 'boolean',
    label: 'Request Timeoff on Mobile',
  },
  requestAvailability: {
    type: 'boolean',
    label: 'Request Availability on Mobile',
  },
  requestConfirmation: {
    type: 'boolean',
    label: 'Request Confirmation on Mobile',
  },
  optimizerFeature: {
    type: 'boolean',
    label: 'Optimizer Feature',
  },
  flaggingFeature: {
    type: 'boolean',
    label: 'Flagging Feature',
  },
  requestsFeature: {
    type: 'boolean',
    label: 'Approvals Feature',
  },
  productivityInclude: {
    type: 'boolean',
    label: 'Productivity Include',
  },
  canLockScheduler: {
    type: 'boolean',
    label: 'Can Lock Scheduler',
  },
  clockInOut: {
    type: 'boolean',
    label: 'Can Clock In/Out',
  },
  createActivity: {
    type: 'boolean',
    label: 'Create Activity',
  },
  editActivity: {
    type: 'boolean',
    label: 'Edit Activity',
  },
  supportRequest: {
    type: 'boolean',
    label: 'Support Request',
  },
  viewOnboardingChecklist: {
    type: 'boolean',
    label: 'View Onboarding Checklist',
  },
  toggleOnboardingChecklist: {
    type: 'boolean',
    label: 'Toggle Onboarding Checklist',
  },
  chatFeature: {
    type: 'boolean',
    label: 'Chat Feature',
  },
  supervisor: { type: 'boolean', label: 'Supervisor' },
  allowAlias: { type: 'boolean', label: 'Allow Alias' },
};

export default rolesFields;
