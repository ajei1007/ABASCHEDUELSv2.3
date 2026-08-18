import moment from 'moment';
import { weekdayOptions } from 'constants/recurrenceOptions';
import { isDateRangeRecurring } from 'utils/isDateRangeRecurring';

function getWeekdays(start, end) {
  let current = start.clone(); // Clone to avoid mutating the original start
  let weekdays = [];

  while (current.isBefore(end)) {
    weekdays.push(weekdayOptions[current.day()]?.value);
    current.add(1, 'days');
  }

  return weekdays;
}

function getWeekdayMatchingDateBetweenDates({ dateOnWeek, weekday }) {
  // We need to find start and end dates of the provided date's week
  const startOfWeek = dateOnWeek.clone().startOf('week');
  const endOfWeek = dateOnWeek
    .clone()
    .endOf('week')
    .add(1, 'day')
    .startOf('day');
  for (
    let date = startOfWeek.clone();
    date.isBefore(endOfWeek);
    date.add(1, 'days')
  ) {
    if (date.day() === weekday) {
      return date.clone();
    }
  }
  return null;
}

function getUpdatedRecurDates({
  event,
  calendarStart: calendarStartStr,
  calendarEnd: calendarEndStr,
  timezone,
}) {
  const calendarStart = moment(calendarStartStr);
  const calendarEnd = moment(calendarEndStr);
  const startRecur = moment(event.startRecur);
  const endRecur = moment(event.endRecur);

  const diffDays = calendarEnd.diff(calendarStart, 'days');
  if (diffDays <= 1) {
    return {
      startRecur: calendarStartStr,
      endRecur: calendarEndStr,
      daysOfWeek: getWeekdays(calendarStart, calendarEnd),
    };
  }

  if (
    calendarStart.isBetween(startRecur, endRecur, null, '[]') &&
    calendarEnd.isBetween(startRecur, endRecur, null, '[]')
  ) {
    return {
      startRecur: calendarStartStr,
      endRecur: calendarEndStr,
      daysOfWeek: event.daysOfWeek,
    };
  }

  const virtualStartRecur = moment(
    moment(event.start).tz(timezone).format('YYYY-MM-DD'),
  );
  const virtualEndRecur = virtualStartRecur
    .clone()
    .endOf('week')
    .add(1, 'day')
    .startOf('day');

  const startWeekday = (() => {
    if (!virtualStartRecur.isSame(startRecur, 'week')) {
      return virtualStartRecur.day();
    }
    return startRecur.day();
  })();
  const endWeekday = (() => {
    if (virtualEndRecur.isSameOrBefore(endRecur)) {
      return virtualEndRecur.clone().subtract(1, 'day').day();
    }
    return endRecur.clone().subtract(1, 'day').day();
  })();

  const updatedStartRecur = getWeekdayMatchingDateBetweenDates({
    dateOnWeek: calendarStart,
    weekday: startWeekday,
  });

  const updatedEndRecur = getWeekdayMatchingDateBetweenDates({
    dateOnWeek: calendarStart,
    weekday: endWeekday,
  })?.add(1, 'day');

  if (!updatedStartRecur || !updatedEndRecur) {
    return null;
  }

  const possibleDayOfWeek = getWeekdays(updatedStartRecur, updatedEndRecur);
  const dayOfWeek = event.daysOfWeek.filter((item) =>
    possibleDayOfWeek.includes(item),
  );

  return {
    startRecur: updatedStartRecur.format('YYYY-MM-DD'),
    endRecur: updatedEndRecur.format('YYYY-MM-DD'),
    daysOfWeek: dayOfWeek,
  };
}

function getUpdatedSingleDates({
  event,
  calendarStart: calendarStartStr,
  calendarEnd: calendarEndStr,
}) {
  const calendarStart = moment(calendarStartStr);
  const calendarEnd = moment(calendarEndStr);
  const startRecur = moment(event.startRecur);

  const diffDays = calendarEnd.diff(calendarStart, 'days');
  if (diffDays <= 1) {
    return {
      startRecur: calendarStartStr,
      endRecur: calendarEndStr,
      daysOfWeek: getWeekdays(calendarStart, calendarEnd),
    };
  }

  const startRecurWeekday = startRecur.day();
  const updatedStartRecur = getWeekdayMatchingDateBetweenDates({
    dateOnWeek: calendarStart,
    weekday: startRecurWeekday,
  });
  if (!updatedStartRecur) {
    return null;
  }

  const updatedEndRecur = updatedStartRecur.clone().add(1, 'days');
  return {
    startRecur: updatedStartRecur.format('YYYY-MM-DD'),
    endRecur: updatedEndRecur.format('YYYY-MM-DD'),
    daysOfWeek: getWeekdays(updatedStartRecur, updatedEndRecur),
  };
}

const preparePasteEvents = ({
  events,
  calendarStart,
  calendarEnd,
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
}) => {
  let toBeAdded = [];
  for (const event of events) {
    const result = isDateRangeRecurring(event.endRecur, event.startRecur)
      ? getUpdatedRecurDates({
          event,
          calendarStart,
          calendarEnd,
          timezone,
        })
      : getUpdatedSingleDates({
          event,
          calendarStart,
          calendarEnd,
        });

    if (result) {
      const { daysOfWeek, startRecur, endRecur } = result;
      toBeAdded = [
        ...toBeAdded,
        {
          ...event,
          daysOfWeek,
          startRecur,
          endRecur,
        },
      ];
    }
  }
  return toBeAdded;
};

export default preparePasteEvents;
