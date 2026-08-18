export const userUnmatchingFields = {
  id: { type: 'id', label: 'ID' },
  label: { type: 'string', label: 'Name' },
  user: { type: 'relation_one', label: 'Users' },
  soft: { type: 'boolean', label: 'soft' }
}