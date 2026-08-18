const moment = require('moment');
const getWeekDayIdsFromWeekdayNumber = require('./getWeekDayIdsFromWeekdayNumber');

const getWeekDayIdsBetweenDates = (startDate, endDate) => {
  const weekdaySet = new Set();
  const currentDate = moment(startDate);
  const end = moment(endDate);

  if (currentDate.isAfter(end)) {
    return [];
  }

  // Loop through each day
  while (weekdaySet.size < 7 && currentDate.isBefore(end)) {
    const dayOfWeek = currentDate.day();

    // Add the day of week index to the Set (automatically handles duplicates)
    weekdaySet.add(dayOfWeek);

    // Move to the next day
    currentDate.add(1, 'days');
  }

  // Convert Set back to array
  return getWeekDayIdsFromWeekdayNumber(
    Array.from(weekdaySet).sort((a, b) => a - b),
  );
};

module.exports = getWeekDayIdsBetweenDates;
