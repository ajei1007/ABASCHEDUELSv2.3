import moment from 'moment';

const getWeekdaysInRange = function(startDate: string, endDate: string) {
  const weekdays = ['U', 'M', 'T', 'W', 'R', 'F', 'S'];
  const result = [];

  const currentDate = moment(startDate);
  const end = moment(endDate);

  while (currentDate.isSameOrBefore(end, 'day')) {
    const weekdayLetter = weekdays[currentDate.day()];
    result.push(weekdayLetter);
    currentDate.add(1, 'day');
  }

  return result;
}

export default getWeekdaysInRange;