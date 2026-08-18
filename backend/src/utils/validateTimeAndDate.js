const moment = require('moment');
const ValidationError = require('../services/notifications/errors/validation');

const validateTimeAndDate = (data, type) => {
  if (!data.startRecur || !data.endRecur || !data.start || !data.end){
    throw new ValidationError(`${type}.invalidDateFormat`);
  }

  if (!isValidDateString(data.start)){
    throw new ValidationError(`${type}.invalidDateFormat`);
  }

  if (!isValidDateString(data.end)){
    throw new ValidationError(`${type}.invalidDateFormat`);
  }

  if (!isValidDateString(data.startRecur)){
    throw new ValidationError(`${type}.invalidDateFormat`);
  }

  if (!isValidDateString(data.endRecur)){
    throw new ValidationError(`${type}.invalidDateFormat`);
  }

  if (moment(data.startRecur).isSameOrAfter(data.endRecur)) {
    //throw new ValidationError(`${type}.invalidDate`);
  }
  if (moment(data.start).isSameOrAfter(data.end)) {
    throw new ValidationError(`${type}.invalidStartEnd`);
  }

  // check if dates are in proper format
  if (
    'Invalid date' === moment(data.start).format('YYYY-MM-DD HH:mm:ss') ||
    '0000-00-00 00:00:00' === moment(data.start).format('YYYY-MM-DD HH:mm:ss')
  ) {
    throw new ValidationError(`${type}.invalidDateFormat`);
  }

  if (
    'Invalid date' === moment(data.end).format('YYYY-MM-DD HH:mm:ss') ||
    '0000-00-00 00:00:00' === moment(data.end).format('YYYY-MM-DD HH:mm:ss')
  ) {
    throw new ValidationError(`${type}.invalidDateFormat`);
  }

  if (
    'Invalid date' === moment(data.startRecur).format('YYYY-MM-DD HH:mm:ss') ||
    '0000-00-00 00:00:00' ===
      moment(data.startRecur).format('YYYY-MM-DD HH:mm:ss') ||
    '0000-00-00' === data.startRecur
  ) {
    throw new ValidationError(`${type}.invalidDateFormat`);
  }

  if (
    'Invalid date' === moment(data.endRecur).format('YYYY-MM-DD HH:mm:ss') ||
    '0000-00-00 00:00:00' ===
      moment(data.endRecur).format('YYYY-MM-DD HH:mm:ss') ||
    '0000-00-00' === data.endRecur
  ) {
    throw new ValidationError(`${type}.invalidDateFormat`);
  }
};

function isValidDateString(dateString) {
  // Check if the input is a string
  if (typeof dateString !== 'string') {
    return false;
  }

  // Define a regex that checks for YYYY-MM-DD format, allowing any characters to follow
  const regex = /^\d{4}-\d{2}-\d{2}/;

  // Check if the string matches the date format at the start
  if (!regex.test(dateString)) {
    return false;
  }

  // Extract the date part and create a Date object
  const datePart = dateString.slice(0, 10);
  const date = new Date(datePart);
  const timestamp = date.getTime();

  // Check for validity of the date object
  if (isNaN(timestamp)) {
    return false;
  }

  return true
}

module.exports = validateTimeAndDate;
