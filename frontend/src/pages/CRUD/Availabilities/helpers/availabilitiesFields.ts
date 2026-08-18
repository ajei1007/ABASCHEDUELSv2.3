const availabilitiesFields = {
  id: { type: 'id', label: 'ID' },
  user: { type: 'relation_one', label: 'Users' },
  startTime: { type: 'datetime', label: 'Start Time' },
  endTime: { type: 'datetime', label: 'End Time' },
  days: { type: 'relation_many', label: 'Days' },
  timezone: { type: 'relation_one', label: 'Timezone' },
  interval: { type: 'relation_one', label: 'Interval' },
  frequency: { type: 'relation_one', label: 'Frequency' },
  bysetpos: { type: 'relation_one', label: 'Bysetpos' },
  roleLocation: { type: 'relation_many', label: 'Location' },
  available: { type: 'boolean', label: 'Available' },
  startRange: { type: 'date', label: 'Start Range' },
  endRange: { type: 'date', label: 'End Range' },
  disabled: {
    type: 'boolean',
    label: 'Inactive',
    options: [{ value: 'value', label: 'value' }],
  },
  location2: {
    type: 'relation_many',
    label: 'Location',
    options: [{ value: 'value', label: 'value' }],
  },
  M: {
    type: 'boolean',
    label: 'M',
    options: [{ value: 'value', label: 'value' }],
  },
  T: {
    type: 'boolean',
    label: 'T',

    options: [{ value: 'value', label: 'value' }],
  },
  W: {
    type: 'boolean',
    label: 'W',
    options: [{ value: 'value', label: 'value' }],
  },
  R: {
    type: 'boolean',
    label: 'R',
    options: [{ value: 'value', label: 'value' }],
  },
  F: {
    type: 'boolean',
    label: 'F',
    options: [{ value: 'value', label: 'value' }],
  },
  S: {
    type: 'boolean',
    label: 'S',
    options: [{ value: 'value', label: 'value' }],
  },
  U: {
    type: 'boolean',
    label: 'U',
    options: [{ value: 'value', label: 'value' }],
  },
  status: {
    type: 'enum',
    label: 'Status',

    options: [
      { value: 'Approved', label: 'Approved' },

      { value: 'Pending', label: 'Pending' },

      { value: 'Declined', label: 'Declined' },
    ],
  },
  oncall: { type: 'boolean', label: 'Oncall' },
  branch: { type: 'relation_one', label: 'Branch' },
  forever: { type: 'boolean', label: 'Forever' },
  allDay: { type: 'boolean', label: 'All Day' },
  everyDay: { type: 'boolean', label: 'Every Day' },
};

export default availabilitiesFields;
