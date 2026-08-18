const subgroupsFields = {
  id: { type: 'id', label: 'ID' },

  name: { type: 'string', label: 'Name' },

  group: { type: 'relation_one', label: 'Group' },

  user: { type: 'relation_many', label: 'Users' },

  iconName: { type: 'relation_one', label: 'IconName' },

  branch: {
    type: 'relation_one',
    label: 'Branch',

    options: [{ value: 'value', label: 'value' }],
  },

  branches: {
    type: 'relation_many',
    label: 'Branches',

    options: [{ value: 'value', label: 'value' }],
  },

  allbranches: {
    type: 'boolean',
    label: 'All Branches',

    options: [{ value: 'value', label: 'value' }],
  },

  subgroup: {
    type: 'relation_many',
    label: 'Subgroup',

    options: [{ value: 'value', label: 'value' }],
  },

  subgroup3: {
    type: 'relation_many',
    label: 'Subgroup 3',

    options: [{ value: 'value', label: 'value' }],
  },

  noTag: {
    type: 'boolean',
    label: 'No Tag',

    options: [{ value: 'value', label: 'value' }],
  },
};

export default subgroupsFields;
