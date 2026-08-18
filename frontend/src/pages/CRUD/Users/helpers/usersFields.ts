const usersFields = {
  id: { type: 'id', label: 'ID' },
  roomparent: { type: 'relation_many', label: 'Room Parent' },
  rooms: { type: 'relation_many', label: 'Rooms' },
  user: { type: 'relation_one', label: 'Users' },
  capacity: { type: 'int', label: 'Capacity' },
  parent: { type: 'relation_one', label: 'Parent' },
  colors: { type: 'relation_one', label: 'Color' },
  firstName: { type: 'string', label: 'First Name' },
  name: { type: 'string', label: 'Name' },
  lastName: { type: 'string', label: 'Last Name' },
  phoneNumber: { type: 'string', label: 'Phone Number' },
  email: { type: 'string', label: 'E-mail' },
  email1: { type: 'string', label: 'E-mail (additional 1)' },
  email2: { type: 'string', label: 'E-mail (additional 2)' },
  notes: { type: 'string', label: 'Notes' },

  role: {
    type: 'enum',
    label: 'Role',
    options: [
      { value: 'admin', label: 'admin' },
      { value: 'user', label: 'user' },
    ],
  },
  disabled: { type: 'boolean', label: 'Inactive' },
  supervision: { type: 'boolean', label: 'Supervision' },
  productivityInclude: { type: 'boolean', label: 'Productivity Include' },
  productivityExclude: { type: 'boolean', label: 'Productivity Exclude' },
  clientReq: { type: 'boolean', label: 'Client Required' },
  empNotReq: { type: 'boolean', label: 'Employee Not Required' },
  locReq: { type: 'boolean', label: 'Location Required' },
  supervisionRateInclude: {
    type: 'boolean',
    label: 'Supervision Rate Include',
  },
  avatar: { type: 'images', label: 'Avatar' },
  password: { type: 'string', label: 'Password' },
  passwordConfirm: { type: 'string', label: 'Confirm Password' },
  emailVerified: { type: 'boolean', label: 'Email Verified' },
  emailVerificationToken: { type: 'string', label: 'Verification Token' },
  emailVerificationTokenExpiresAt: {
    type: 'datetime',
    label: 'Verification Token Expiration',
  },
  passwordResetToken: { type: 'string', label: 'Password Reset Token' },
  passwordResetTokenExpiresAt: {
    type: 'datetime',
    label: 'Password Reset Token Expiration',
  },
  provider: { type: 'string', label: 'Provider' },
  funders: { type: 'relation_many', label: 'Funders' },
  gender: {
    type: 'enum',
    label: 'Gender',
    options: [
      { value: 'M', label: 'M' },
      { value: 'F', label: 'F' },
    ],
  },
  alias: { type: 'string', label: 'Alias' },
  codeCustom: { type: 'string', label: 'Code' },

  otherPhones: { type: 'string', label: 'Other Phones' },

  otherEmails: { type: 'string', label: 'Other Emails' },

  roles: { type: 'relation_one', label: 'Role' },

  resource: { type: 'relation_one', label: 'Resource' },

  company: { type: 'relation_one', label: 'Company' },

  branches: {
    label: 'Branches',
    type: 'relation_many',
    options: [{ value: 'value', label: 'value' }],
  },

  address: { type: 'string', label: 'Address' },

  longitude: { type: 'decimal', label: 'Longitude' },

  latitude: { type: 'decimal', label: 'Latitude' },

  locationType: { type: 'relation_one', label: 'Location Type' },

  active: { type: 'boolean', label: 'Active' },

  minHours: { type: 'decimal', label: 'Min Weekly Hours' },

  maxHours: { type: 'decimal', label: 'Max Weekly Hours' },

  color: { type: 'string', label: 'Color' },
  borderColor: { type: 'string', label: 'Color' },

  birthday: { type: 'date', label: 'Birthday' },

  relationshipUsers: {
    type: 'relation_many',
    label: 'Relationship Users',

    options: [{ value: 'value', label: 'value' }],
  },

  relationships: {
    type: 'relation_many',
    label: 'Relationships',

    options: [{ value: 'value', label: 'value' }],
  },

  mobiletoken: {
    type: 'string',
    label: 'Mobile Token',

    options: [{ value: 'value', label: 'value' }],
  },

  primarylocation: {
    type: 'relation_many',
    label: 'Primary Location',

    options: [{ value: 'value', label: 'value' }],
  },

  userdefaultlocation: {
    type: 'relation_many',
    label: 'User Default Location',

    options: [{ value: 'value', label: 'value' }],
  },

  userdefaultactivity: {
    type: 'relation_many',
    label: 'User Default Activity',

    options: [{ value: 'value', label: 'value' }],
  },

  mobiletokens: {
    type: 'relation_many',
    label: 'Mobiletokens',

    options: [{ value: 'value', label: 'value' }],
  },

  address2: {
    type: 'string',
    label: 'Address 2',

    options: [{ value: 'value', label: 'value' }],
  },

  address1Relationship: {
    type: 'relation_one',
    label: 'Address 1 Relationship',
    options: [{ value: 'value', label: 'value' }],
  },
  address2Relationship: {
    type: 'relation_one',
    label: 'Address 2 Relationship',
    options: [{ value: 'value', label: 'value' }],
  },
  address2Default: {
    type: 'boolean',
    label: 'Address 2 Default',
    options: [
      { value: '1', label: '1' },
      { value: '2', label: '2' },
    ],
  },
  billable: {
    type: 'boolean',
    label: 'Billable',
    options: [{ value: 'value', label: 'value' }],
  },
  allBranches: {
    type: 'boolean',
    label: 'All Branches',

    options: [{ value: 'value', label: 'value' }],
  },
  paid: {
    type: 'boolean',
    label: 'Paid',
    options: [{ value: 'value', label: 'value' }],
  },
  notWorking: {
    type: 'boolean',
    label: 'Not Working',
    options: [{ value: 'value', label: 'value' }],
  },
  auth: {
    type: 'boolean',
    label: 'Needs Authorization',
    options: [{ value: 'value', label: 'value' }],
  },
  idCustom: {
    type: 'string',
    label: 'ID',
    options: [{ value: 'value', label: 'value' }],
  },
  idCustom2: {
    type: 'string',
    label: 'ID2',
    options: [{ value: 'value', label: 'value' }],
  },
  tags: { type: 'relation_many', label: 'Tags' },
  credential: {
    type: 'relation_many',
    label: 'Credential',
    options: [{ value: 'value', label: 'value' }],
  },
  roster: {
    type: 'relation_many',
    label: 'Roster',
    options: [{ value: 'value', label: 'value' }],
  },
  calendarhide: {
    type: 'boolean',
    label: 'Hide on Calendar',
    options: [{ value: 'value', label: 'value' }],
  },
  credentialFunders: {
    type: 'relation_many',
    label: 'Credential Funders',
    options: [{ value: 'value', label: 'value' }],
  },
  totals: {
    type: 'relation_many',
    label: 'Totals',
    options: [{ value: 'value', label: 'value' }],
  },
  waitlisted: {
    type: 'boolean',
    label: 'Waitlisted',
    options: [{ value: 'value', label: 'value' }],
  },
  priority: {
    type: 'int',
    label: 'Priority',
    options: [{ value: 'value', label: 'value' }],
  },
  hourlyrate: {
    type: 'decimal',
    label: 'Hourlyrate',
    options: [{ value: 'value', label: 'value' }],
  },
  salary: {
    type: 'decimal',
    label: 'Salary',
    options: [{ value: 'value', label: 'value' }],
  },
  hourlyrevenue: {
    type: 'decimal',
    label: 'Hourly Revenue',
    options: [{ value: 'value', label: 'value' }],
  },
  siblingGroupId: {
    label: 'Sibling Group',
    type: 'relation_one',
    options: [{ value: 'value', label: 'value' }],
  },
  defaultDuration: {
    label: 'Default Duration',
    type: 'int',
    options: [
      { value: 15, label: '15 minutes' },
      { value: 30, label: '30 minutes' },
      { value: 45, label: '45 minutes' },
      { value: 60, label: '1 hour' },
      { value: 90, label: '1 hour 30 minutes' },
      { value: 120, label: '2 hours' },
      { value: 150, label: '2 hours 30 minutes' },
      { value: 180, label: '3 hours' },
      { value: 210, label: '3 hours 30 minutes' },
      { value: 240, label: '4 hours' },
    ],
  },
};

export default usersFields;
