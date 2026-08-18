const timeconstraintsFields = {
  id: { type: 'id', label: 'ID' },

  role1: { type: 'relation_one', label: 'Role' },
  subgroup: { type: 'relation_one', label: 'Subgroup' },
  user1: { type: 'relation_one', label: 'User 1' },
  user2: { type: 'relation_one', label: 'User 2' },
  min: { type: 'decimal', label: 'Min' },
  max: { type: 'decimal', label: 'Max' },
  unit: {
    type: 'enum',
    label: 'Unit',
    options: [
      { value: 'Hours', label: 'Hours' },
      { value: 'Minutes', label: 'Minutes' },
      { value: 'Seconds', label: 'Seconds' },
      { value: 'Units', label: 'Units' },
    ],
  },
  frequency: {
    type: 'enum',
    label: 'Frequency',
    options: [
      { value: 'Per Session', label: 'Per Session' },
      { value: 'Total', label: 'Total' },
      { value: 'Daily', label: 'Daily' },
      { value: 'Weekly', label: 'Weekly' },
      { value: 'Monthly', label: 'Monthly' },
      { value: 'Annually', label: 'Annually' },
    ],
  },
  start: { type: 'date', label: 'Start' },
  end: { type: 'date', label: 'End' },
  offset: {
    type: 'decimal',
    label: 'Offset',
    options: [{ value: 'value', label: 'value' }],
  },
  remaining: { type: 'int', label: 'Remaining',

      options: [

        { value: 'value', label: 'value' },

      ]

    },
};


export default timeconstraintsFields;
