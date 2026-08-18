const userGroupingsFields = {
  id: { type: 'id', label: 'ID' },
  label: { type: 'string', label: 'Name' },
  subgroup: { type: 'relation_one', label: 'Subgroup' },
  required: { type: 'boolean', label: 'Required'}
};

export default userGroupingsFields;
