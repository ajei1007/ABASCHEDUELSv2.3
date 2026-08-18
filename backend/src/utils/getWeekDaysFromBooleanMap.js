const dayIds = require('../constants/days');

const getWeekDaysFromBooleanMap = (data) => {
  const days = [];
  if (data.U == 1) {
    days.push({
      id: dayIds.sunday_id,
      name: 'Sunday',
    });
  }
  if (data.M == 1) {
    days.push({
      id: dayIds.monday_id,
      name: 'Monday',
    });
  }
  if (data.T == 1) {
    days.push({
      id: dayIds.tuesday_id,
      name: 'Tuesday',
    });
  }
  if (data.W == 1) {
    days.push({
      id: dayIds.wednesday_id,
      name: 'Wednesday',
    });
  }
  if (data.R == 1) {
    days.push({
      id: dayIds.thursday_id,
      name: 'Thursday',
    });
  }
  if (data.F == 1) {
    days.push({
      id: dayIds.friday_id,
      name: 'Friday',
    });
  }
  if (data.S == 1) {
    days.push({
      id: dayIds.saturday_id,
      name: 'Saturday',
    });
  }
  return days;
};

module.exports = getWeekDaysFromBooleanMap;
