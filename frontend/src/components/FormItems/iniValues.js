import moment from 'moment';

const IniValues = (fields, record = {}) => {
  const iniArray = {};
  if (fields) {
    Object.keys(fields).forEach((field) => {
      const type = fields[field].type;
      const value = record[field] ?? '';

      let showValue = '';
      switch (type) {
        case 'boolean':
          if (field === 'available' && (value === undefined || value === '')) {
            showValue = true;
          } else {
            showValue = value;
          }
          break;
        case 'enum':
          if (field === 'status' && (value === undefined || value === '')) {
            showValue = 'Approved';
          } else {
            showValue = value;
          }
          break;

        case 'date':
          showValue = value ? moment(value, 'YYYY-MM-DD').toDate() : '';
          break;

        case 'dateRange':
          if (!value || !value.length) {
            showValue = [];
          } else {
            showValue = value.map((item) =>
              item ? moment(item, 'YYYY-MM-DD').toDate() : '',
            );
          }
          break;

        case 'datetime':
          showValue = value ? moment(value).toDate() : '';
          break;

        case 'datetimeRange':
          if (!value || !value.length) {
            showValue = [];
          } else {
            showValue = value.map((item) =>
              item ? moment(item).toDate() : '',
            );
          }
          break;

        case 'decimal':
          showValue = value;
          break;

        case 'decimalRange':
          showValue = value || [];
          break;

        case 'files':
          showValue = value;
          break;

        case 'images':
          showValue = value;
          break;

        case 'int':
          showValue = value;
          break;

        case 'intRange':
          showValue = value;
          break;

        case 'relation_many':
          showValue = value;
          break;

        case 'relation_one':
          showValue = value;
          break;

        case 'user_many':
          showValue = value;
          break;

        case 'user_one':
          showValue = value;
          break;

        case 'stringArray':
          if (!value) {
            showValue = [];
          } else if (Array.isArray(value)) {
            showValue = value;
          } else {
            showValue = [value];
          }
          break;

        case 'string':
          showValue = value;
          break;

        default:
          showValue = value;
      }
      iniArray[field] = showValue;
    });
  }
  return iniArray;
};

export default IniValues;
