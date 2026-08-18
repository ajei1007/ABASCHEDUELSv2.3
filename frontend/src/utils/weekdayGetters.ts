import moment from 'moment';
import { weekdayOptions } from 'constants/recurrenceOptions';

export const getWeekDayOfDate = (date: any) => {
  const selectedDateWeekdayNumber = moment(date).weekday();
  const selectedDateWeekday = weekdayOptions.find(
    (w) => w.pos === selectedDateWeekdayNumber,
  );
  return selectedDateWeekday ?? weekdayOptions[1];
};

export const getWeekNumberOfMonth = (date: any) => {
  const _date = moment(date).date();
  return Math.ceil(_date / 7);
};

export const getDaysOfWeekBetweenDates = (sDate: any, eDate: any) => {
  const startDate = moment(sDate);
  const endDate = moment(eDate);
  endDate.add(1, 'day');

  const daysOfWeek = [];
  let i = 0;
  while (i < 7 && startDate < endDate) {
    daysOfWeek.push(startDate.day());
    startDate.add(1, 'day');
    i++;
  }
  return daysOfWeek;
};

export const getGivenDateOfMonth = (startDate: any, dayOfWeek: any, weekNumber: number) => {
  const startDateOfMonth = moment(startDate).startOf('month');
  const lastDateOfMonth = moment(startDate).endOf('month').format('YYYY-MM-DD');
  const firstDayOfWeek = startDateOfMonth.clone().weekday(dayOfWeek);

  if (firstDayOfWeek.month() !== startDateOfMonth.month()) {
    weekNumber++;
  }
  let nthDayOfWeek = firstDayOfWeek.add(weekNumber - 1, 'weeks').toDate();
  if (moment(nthDayOfWeek).isAfter(lastDateOfMonth)) {
    return moment(nthDayOfWeek).subtract(1, 'weeks').toDate();
  }
  // Return result
  return nthDayOfWeek;
};