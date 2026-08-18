const moment = require('moment');

const calculateMinutesBetweenTimesIgnoreDates = (end, begin) => {
  const beginTime = moment.utc(begin).format('HH:mm');
  const endTime = moment.utc(end).format('HH:mm');

  let diffInMinutes = moment
    .utc(endTime, 'HH:mm')
    .diff(moment.utc(beginTime, 'HH:mm'), 'minutes');
    
  // In case the ending and beginning are on different dates,
  // the difference will be 1440 minutes less than actual
  if (diffInMinutes < 0) {
    diffInMinutes += 1440;
  }

  return diffInMinutes;
};

module.exports = {
  calculateMinutesBetweenTimesIgnoreDates,
};
