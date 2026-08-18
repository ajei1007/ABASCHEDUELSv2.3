
// TODO Remove after removing components that are using this vars
const permission_list = [
  'createEvent',
  'editEvent',
  'deleteEvent',
  'createUser',
  'editUser',
  'deleteUser',
  'createCancelation',
  'deleteCancelation',
  'createAvailability',
  'editAvailability',
  'deleteAvailability',
  'viewReport',
  'viewRole',
  'createRole',
  'editRole',
  'deleteRole',
  'viewUser',
  'viewAvailability',
  'viewCancelation',
  'editSubgroups',
  'adminPushNotification',
  'createBranch',
  'editBranch',
  'deleteBranch',
  'viewBranch',
  'createConstraint',
  'editConstraint',
  'deleteConstraint',
  'viewConstraint',
  'createSubgroup',
  'deleteSubgroup',
  'viewSubgroup',
  'editSubgroup',
  'canEditEventSchedulerLocked',
  'canLockScheduler',
  'enableRequestNotifications',
  'flaggingFeature',
  'optimizerFeature',
  'requestsFeature',
  'requestCancelation',
  'requestTimeoff',
  'requestAvailability',
  'requestConfirmation',
  'productivityInclude',
];

let superAdminPermissions = {};
permission_list.forEach((t) => {
  superAdminPermissions = {
    ...superAdminPermissions,
    [t]: 1,
    dataAccess: 'All',
  };
});

const industries = {
  ABA: {
    permissions: {
      'Super Admin': superAdminPermissions,
    },
    users: [
      [
        {
          firstName: 'Direct 1:1',
          billable: true,
          roles: ['Activity'],
          color: "#6495ed", borderColor: "#00ffff" 
        },
        {
          firstName: 'Supervision',
          billable: true,
          roles: ['Activity'],
          color: "#f4a460", borderColor: "#bc8f8f" 
        },
        {
          firstName: 'Assessment',
          billable: true,
          roles: ['Activity'],
          color: "#bc8f8f", borderColor: "#a52a2a" 
        },
        {
          firstName: 'Parent Training',
          billable: true,
          roles: ['Activity'],
          color: "#ffd700", borderColor: "#daa520" 
        },
        {
          firstName: 'OT',
          billable: true,
          roles: ['Activity'],
          color: "#8fbc8f", borderColor: "#556b2f"
        },
        {
          firstName: 'PT',
          billable: true,
          roles: ['Activity'],
          color: "#00ced1", borderColor: "#7fffd4" 
        },
        {
          firstName: 'ST',
          billable: true,
          roles: ['Activity'],
          color: "#ee82ee", borderColor: "#c71585" 
        },
        {
          firstName: 'Lunch',
          roles: ['Activity'],
          color: "#9370d8", borderColor: "#ba55d3"
        },
        {
          firstName: 'Break',
          roles: ['Activity'],
          color: "#66cdaa", borderColor: "#20b2aa"
        },
        {
          firstName: 'Drive',
          roles: ['Activity'],
          color: "#b0e0e6", borderColor: "#4169e1" 
        },
        {
          firstName: 'Nap',
          roles: ['Activity'],
          color: "#f08080", borderColor: "#cd5c5c"
        },
        {
          firstName: 'Admin',
          roles: ['Activity'],
          color: "#d87093", borderColor: "#c71585" 
        },
        // Funder
        {
          firstName: 'Medicaid',
          roles: ['Funder'],
        },
        {
          firstName: 'Tricare',
          roles: ['Funder'],
        },
        {
          firstName: 'Aetna',
          roles: ['Funder'],
        },
        {
          firstName: 'BCBS',
          roles: ['Funder'],
        },
        {
          firstName: 'UHC',
          roles: ['Funder'],
        },
      ],
    ],
    roles: [
      [{ name: 'Resource', required: true }],
      [
        { name: 'Person', parent: 'Resource', required: true },
        {
          name: 'Location',
          parent: 'Resource',
          color: 'brown',
          required: true,
        },
        { name: 'Block', parent: 'Resource', color: 'orange', required: true },
        {
          name: 'Activity',
          parent: 'Resource',
          color: 'black',
          required: true,
        },
        { name: 'Funder', parent: 'Resource', color: 'red', required: true },
      ],
      [
        { name: 'Employee', parent: 'Person', color: 'green', required: true },
        { name: 'Client', parent: 'Person', color: 'blue', required: true },
        { name: 'Home', parent: 'Location', labelRequired: true },
        { name: 'Clinic', parent: 'Location' },
        { name: 'School', parent: 'Location' },
        { name: 'Community', parent: 'Location' },
      ],
      [
        { name: 'Room', parent: 'Clinic' },
        { name: 'Super Admin', parent: 'Employee', required: true },
        { name: 'RBT', parent: 'Employee' },
        { name: 'BT', parent: 'Employee' },
        { name: 'BCBA', parent: 'Employee' },
        { name: 'BCABA', parent: 'Employee' },
        { name: 'Director', parent: 'Employee' },
        { name: 'Admin', parent: 'Employee' },
        { name: 'OT', parent: 'Client' },
        { name: 'SP', parent: 'Client' },
        { name: 'PT', parent: 'Client' },
        { name: 'ABA', parent: 'Client', required: true },
      ],
    ],
    cancellationtypes: [[{ name: 'Sick' }, { name: 'Doctor Appointment' }]],
    timeofftypes: [
      { name: 'Holiday' },
      { name: 'Vacation' },
      { name: 'Personal' },
    ],
    relationships: [
      { name: 'Mother' },
      { name: 'Father' },
      { name: 'Grandmother' },
      { name: 'Grandfather' },
      { name: 'Guardian' },
    ],
    branches: [
      [{ name: 'Organization', parent: '' }],
      [{ name: 'Market', parent: 'Organization' }],
      [{ name: 'Region', parent: 'Market' }],
      [{ name: 'Neighborhood', parent: 'Region' }],
      [{ name: 'Center', parent: 'Neighborhood' }],
      // [{ name: 'Team', parent: 'Center' }],
    ],
    capacityconstraints: [
      { user1Id: 'Admin', role1Id: 'Employee', min1: 1, max1: 1, locationDisabled: true },
      {
        user1Id: 'Direct 1:1',
        role1Id: 'RBT',
        min1: 1,
        max1: 1,
        role2Id: 'ABA',
        min2: 1,
        max2: 1,
        locationDisabled: true
      },
      { user1Id: 'Lunch', role1Id: 'Employe', min1: 1, max1: 1, locationDisabled: false },
    ],
    groupings: [
      {
        name: 'Unmatch',
        min: 0,
        max: 0,
        roles1: ['Resource'],
        roles2: ['Resource'],
      },
      {
        name: 'Severity',
        min: 1,
        max: 10000,
        roles1: ['Employee'],
        roles2: ['Client'],
      },
      {
        name: 'Funders',
        min: 1,
        max: 10000,
        roles1: ['Employee'],
        roles2: ['Client'],
      },
      //  {name: 'Rooms', min: 1, max: 10000, roles1:['Room'], roles2: ['Person']},
      {
        name: 'Teams',
        min: 1,
        max: 10000,
        roles1: ['Employee'],
        roles2: ['Client'],
      },
      {
        name: 'Languages',
        min: 1,
        max: 10000,
        roles1: ['Employee'],
        roles2: ['Client'],
      },
      {
        name: 'Allergies',
        min: 0,
        max: 0,
        roles1: ['Employee'],
        roles2: ['Client'],
      },
      {
        name: 'RBT REQ',
        min: 1,
        max: 1,
        roles1: ['Employee'],
        roles2: ['Funder'],
      },
      // {name: 'Home', min: 1, max: 1, roles1:['Activity'], roles2: ['Home']},
      //  {name: 'Not Male', min: 0, max: 0, roles1:['Male'], roles2: ['Gender']},
      //  {name: 'Not Female', min: 0, max: 0, roles1:['Female'], roles2: ['Gender']},
    ],
    eventpair: [],
    settingscompany: [
      { cancellationdeadline: 86400000, timeoffdeadline: 259200000 },
    ],
    subgroups: [
      { name: 'RBT REQ', groupId: 'RBT REQ' },
      { name: 'Dogs', groupId: 'Allergies' },
      { name: 'Team Blue', groupId: 'Teams' },
      { name: 'Team Red', groupId: 'Teams' },
      { name: 'Team Yellow', groupId: 'Teams' },
      { name: 'Team Green', groupId: 'Teams' },
      { name: 'Medicaid', groupId: 'Funders' },
      { name: 'BCBS', groupId: 'Funders' },
      { name: 'Gardner', groupId: 'Funders' },
      { name: 'Private Pay', groupId: 'Funders' },
      { name: 'High Severity', groupId: 'Severity' },
      { name: 'Low Severity', groupId: 'Severity' },
      { name: 'English', groupId: 'Languages' },
      { name: 'Spanish', groupId: 'Languages' },
    ],
  },
};

export default industries;
