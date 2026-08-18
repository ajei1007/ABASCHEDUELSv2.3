
const capacityconstraintsFields = {
  id: { type: 'id', label: 'ID' },

  user1: { type: 'relation_one', label: 'Activity' },

  role1: { type: 'relation_one', label: 'Role 1' },

  role2: { type: 'relation_one', label: 'Role 2' },

  role3: { type: 'relation_one', label: 'Role 3' },

  role4: { type: 'relation_one', label: 'Role 4' },

  role5: { type: 'relation_one', label: 'Role 5'},
  
  min1: { type: 'int', label: 'Min 1', default: 1 },

  max1: { type: 'int', label: 'Max 1', default: 1 },

  min2: { type: 'int', label: 'Min 2', default: 1 },

  max2: { type: 'int', label: 'Max 2', default: 1 },

  min3: { type: 'int', label: 'Min 3', default: 1 },

  max3: { type: 'int', label: 'Max 3', default: 1 },

  min4: { type: 'int', label: 'Min 4', default: 1 },
  
  max4: { type: 'int', label: 'Max 4', default: 1 },
  
  min5: { type: 'int', label: 'Min 5', default: 1 },

  max5: { type: 'int', label: 'Max 5', default: 1 },

  // priority: { type: 'int', label: 'Priority',
  //   options: [
  //     { value: 'value', label: 'value' },
  //   ]
  // },

  subgroup1: { type: 'relation_one', label: 'Tag 1',
    options: [
      { value: 'value', label: 'value' },
    ]
  },

  subgroup2: { type: 'relation_one', label: 'Tag 2',
    options: [
      { value: 'value', label: 'value' },
    ]
  },

  subgroup3: { type: 'relation_one', label: 'Tag 3',
    options: [
      { value: 'value', label: 'value' },
    ]
  },

  subgroup4: { type: 'relation_one', label: 'Tag 4',
    options: [
      { value: 'value', label: 'value' },
    ]
  },

  subgroup5: { type: 'relation_one', label: 'Tag 5',
    options: [
      { value: 'value', label: 'value' },
    ]
  },

  locationDisabled: { type: 'boolean', label: 'Location Disabled',
    options: [
      { value: 'value', label: 'value' },
    ]
  },

  disabled: { type: 'boolean', label: 'Inactive',
    options: [
      { value: 'value', label: 'value' },
    ]
  },
}

export default capacityconstraintsFields;
