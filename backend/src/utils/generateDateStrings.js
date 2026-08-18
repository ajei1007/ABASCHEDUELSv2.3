const moment = require('moment'); 

function generateDateStrings(startDateStr, endDateStr) {
  const startDate = moment.utc(startDateStr);
  const endDate = moment.utc(endDateStr);
  const dateArray = [];

  let currentDate = startDate.clone();
  while (currentDate.isBefore(endDate, 'day')) {
    dateArray.push(currentDate.format('YYYY-MM-DD'));
    currentDate.add(1, 'day');
  }

  return dateArray;
}

module.exports = generateDateStrings;
