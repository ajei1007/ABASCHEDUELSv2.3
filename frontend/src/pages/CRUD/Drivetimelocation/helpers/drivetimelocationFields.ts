const drivetimelocationFields = {
  id: { type: 'id', label: 'ID' },

  location1: {
    type: 'relation_one',
    label: 'Location 1',
    options: [{ value: 'value', label: 'value' }],
  },
  location2: {
    type: 'relation_one',
    label: 'Location 2',
    options: [{ value: 'value', label: 'value' }],
  },
  time: {
    type: 'int',
    label: 'Time',
    options: [{ value: 'value', label: 'value' }],
  },
};

export default drivetimelocationFields;
