import moment from 'moment'

export const isDateRangeRecurring = (start: any, end: any) => {
  const fridayToSunday = moment(start).isoWeekday() === 7 && moment(start).diff(end, 'days') === 2;
  const fridayToMonday = moment(start).isoWeekday() === 1 && moment(start).diff(end, 'days') === 3;
  return !(moment(start).diff(end, 'days') === 1) || fridayToSunday || fridayToMonday;
}
