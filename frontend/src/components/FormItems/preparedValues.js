import moment from 'moment';

const PreparedValues = (fields, record = {}) => {
  const preparedArray = {};
  Object.keys(fields).forEach(field => {
    const type = fields[field].type;
    const value = record[field] ?? '';

    let preparedValue = '';
    switch (type) {
      case 'date':
        preparedValue = value
          ? moment(value, 'YYYY-MM-DD').toDate()
          : null;
        break;

      case 'user_many':
      case 'relation_many':
        if (!value || !value.length) {
          preparedValue = [];
        } else {
          preparedValue = value.map((item) => item.id || item.value);
        }
        break;
      
      case 'relation_many_many':
        if (value && value.length && value?.[0]?.length) {
          preparedValue = value.map((arr) => {
            return arr.map(obj => obj.id || obj.value)
          });
        } else {
          preparedValue = [];
        }
        break;

      case 'user_one':
      case 'relation_one':
        preparedValue = value ? (value.id || value.value) : null;
        break;
      
      case 'enum':
        if (typeof value === 'string') {
          preparedValue = value || null;
        } else {
          preparedValue = value ? (value.id || value.value) : null;
        }
        break;

      default:
        preparedValue = value;
    }
    preparedArray[field] = preparedValue;
  });
  return preparedArray;
}

export default PreparedValues;
