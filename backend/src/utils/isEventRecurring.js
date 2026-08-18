const moment = require('moment');

const isEventRecurring = (ev1, ev2) => {
  const fridayToSunday = moment(ev1).isoWeekday() === 7 && moment(ev1).diff(ev2, 'days') === 2;
  const fridayToMonday = moment(ev1).isoWeekday() === 1 && moment(ev1).diff(ev2, 'days') === 3;
  return !(moment(ev1).diff(ev2, 'days') === 1 || (fridayToSunday || fridayToMonday))
}

module.exports = isEventRecurring;