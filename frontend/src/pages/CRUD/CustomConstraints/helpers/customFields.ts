const customFields = {
  id: { type: 'id', label: 'ID' },
  constraintType: {
    type: 'enum',
    label: 'Constraint Type',
    options: [
      { value: 'matching', label: 'matching' },
      { value: 'unmatching', label: 'unmatching' },
      { value: 'sessionlength', label: 'sessionlength' },
      { value: 'usertouser', label: 'usertouser' },
      { value: 'usertosession', label: 'usertosession' },
      { value: 'time', label: 'time' },
      { value: 'grouping', label: 'grouping' },
      { value: 'drive', label: 'drive' },
      { value: 'distance', label: 'distance' },
      { value: 'backToBack', label: 'backToBack' },
      { value: 'breakQuantity', label: 'breakQuantity' },
      { value: 'priority', label: 'priority' },
      { value: 'authorization', label: 'authorization' },
    ],
  },
  description: {
    type: 'string',
    label: 'Description',
    options: [{ value: 'value', label: 'value' }],
  },
  antecedentType: {
    type: 'enum',
    label: 'Antecedent Type',
    options: [
      { value: 'specific', label: 'specific' },
      { value: 'type', label: 'type' },
    ],
  },
  consequenceType: {
    type: 'enum',
    label: 'Consequence Type',
    options: [
      { value: 'specific', label: 'specific' },
      { value: 'type', label: 'type' },
    ],
  },
  antecedentTypeUser: {
    type: 'relation_one',
    label: 'User',
  },
  consequenceTypeUser: {
    type: 'relation_one',
    label: 'User',
  },
  antecedentTypeLocation: {
    type: 'relation_one',
    label: 'User',
  },
  consequenceTypeLocation: {
    type: 'relation_one',
    label: 'User',
  },
  antecedentTypeActivity: {
    type: 'relation_one',
    label: 'User',
  },
  consequenceTypeActivity: {
    type: 'relation_one',
    label: 'User',
  },
  antecedentTypeRole: {
    type: 'relation_one',
    label: 'Role',
  },
  consequenceTypeRole: {
    type: 'relation_one',
    label: 'Role',
  },
  antecedentTypeSubgroup: {
    type: 'relation_one',
    label: 'Tag',
  },
  consequenceTypeSubgroup: {
    type: 'relation_one',
    label: 'Tag',
  },
  // antecedentTypeUsers: {
  //   type: 'relation_many_many',
  //   label: 'Antecedent Type Users',
  //   options: [{ value: 'value', label: 'value' }],
  // },
  // consequenceTypeUsers: {
  //   type: 'relation_many_many',
  //   label: 'Consequence Type Users',
  //   options: [{ value: 'value', label: 'value' }],
  // },
  // antecedentTypeRoles: {
  //   type: 'relation_many_many',
  //   label: 'Antecedent Type Roles',
  //   options: [{ value: 'value', label: 'value' }],
  // },
  // consequenceTypeRoles: {
  //   type: 'relation_many_many',
  //   label: 'Consequence Type Roles',
  //   options: [{ value: 'value', label: 'value' }],
  // },
  // antecedentTypeSubgroups: {
  //   type: 'relation_many_many',
  //   label: 'Antecedent Type Subgroups',
  //   options: [{ value: 'value', label: 'value' }],
  // },
  // consequenceTypeSubgroups: {
  //   type: 'relation_many_many',
  //   label: 'Consequence Type Subgroups',
  //   options: [{ value: 'value', label: 'value' }],
  // },
  // antecedentTypeBranches: {
  //   type: 'relation_many_many',
  //   label: 'Antecedent Type Branches',
  //   options: [{ value: 'value', label: 'value' }],
  // },
  // consequenceTypeBranches: {
  //   type: 'relation_many_many',
  //   label: 'Consequence Type Branches',
  //   options: [{ value: 'value', label: 'value' }],
  // },
  antecedentTypeDaySelection: {
    type: 'enum',
    label: 'Antecedent Type Day Selection',
    options: [
      { value: 'alldays', label: 'alldays' },
      { value: 'notalldays', label: 'notalldays' },
    ],
  },
  consequenceTypeDaySelection: {
    type: 'enum',
    label: 'Consequence Type Day Selection',
    options: [
      { value: 'alldays', label: 'alldays' },
      { value: 'notalldays', label: 'notalldays' },
    ],
  },
  grouping: {
    type: 'relation_one',
    label: 'Grouping',
  },
  min: {
    type: 'int',
    label: 'Min',
    options: [{ value: 'value', label: 'value' }],
  },
  max: {
    type: 'int',
    label: 'Max',
    options: [{ value: 'value', label: 'value' }],
  },
  offset: {
    type: 'int',
    label: 'Offset',
    options: [{ value: 'value', label: 'value' }],
  },
  weight: {
    type: 'int',
    label: 'Weight',
    options: [{ value: 'value', label: 'value' }],
  },
  frequency: {
    type: 'enum',
    label: 'Frequency',
    options: [
      { value: 'day', label: 'day' },
      { value: 'week', label: 'week' },
      { value: 'session', label: 'session' },
      { value: 'month', label: 'month' },
      { value: 'year', label: 'year' },
      { value: 'custom', label: 'custom' },
    ],
  },
  units: {
    type: 'enum',
    label: 'Units',
    options: [
      { value: 'seconds', label: 'seconds' },
      { value: 'minutes', label: 'minutes' },
      { value: 'hours', label: 'hours' },
      { value: 'days', label: 'days' },
      { value: 'weeks', label: 'weeks' },
      { value: 'months', label: 'months' },
      { value: 'years', label: 'years' },
      { value: 'unit', label: 'unit' },
    ],
  },
  alias: {
    type: 'string',
    label: 'Alias',
    options: [{ value: 'value', label: 'value' }],
  },
  consequenceTypeEachOrAll: {
    type: 'enum',
    label: 'Consequence Type Each Or All',
    options: [
      { value: 'each', label: 'each' },
      { value: 'all', label: 'all' },
    ],
  },
  antecedentTypeEachOrAll: {
    type: 'enum',
    label: 'Antecedent Type Each Or All',
    options: [
      { value: 'each', label: 'each' },
      { value: 'all', label: 'all' },
    ],
  },
  start: {
    type: 'date',
    label: 'Start',
    options: [{ value: 'value', label: 'value' }],
  },
  end: {
    type: 'date',
    label: 'End',
    options: [{ value: 'value', label: 'value' }],
  },
  disabled: {
    type: 'boolean',
    label: 'Inactive',
    options: [{ value: 'value', label: 'value' }],
  },
  soft: {
    type: 'boolean',
    label: 'Soft',
    options: [{ value: 'value', label: 'value' }],
  },
  all: {
    type: 'boolean',
    label: 'All',
    options: [{ value: 'value', label: 'value' }],
  },
  noLimit: {
    type: 'boolean',
    label: 'No Limit',
    options: [{ value: 'value', label: 'value' }],
  },
  rollover: {
    type: 'boolean',
    label: 'Rollover',
    options: [{ value: 'value', label: 'value' }],
  },
  fromHome: {
    type: 'boolean',
    label: 'From Home',
    options: [{ value: 'value', label: 'value' }],
  },
  tag1: {
    type: 'boolean',
    label: 'Tags',
    options: [{ value: 'value', label: 'value' }],
  },
  tag2: {
    type: 'boolean',
    label: 'Tags',
    options: [{ value: 'value', label: 'value' }],
  },
  forever: {
    type: 'boolean',
    label: 'Forever',
    options: [{ value: 'value', label: 'value' }],
  },
  branches: {
    type: 'relation_many',
    label: 'Branches',
  },
};

export default customFields;
