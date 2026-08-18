
const distanceMatrixFields = {
  id: { type: 'id', label: 'ID' },
  user1: { type: 'relation_one', label: 'User 1' },
  user2: { type: 'relation_one', label: 'User 2' },
  address1: { type: 'string', label: 'Address 1' },
  address2: { type: 'string', label: 'Address 2' },
  distance: { type: 'int', label: 'Distance'},
  duration: { type: 'int', label: 'Duration'},
  duration_early: { type: 'int', label: 'Duration Early'},
  duration_late: { type: 'int', label: 'Duration Late'},
}

export default distanceMatrixFields;
