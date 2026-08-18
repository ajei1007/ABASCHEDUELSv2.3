import moment from 'moment';

export function prepareFormatEventOptionDateParams({
  timezone,
  calendarStart,
  calendarEnd,
}) {
  timezone = timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const startDate = moment(calendarStart)
    .tz(timezone)
    .startOf('day')
    .format('YYYY-MM-DD');
  const endDate = moment(calendarEnd)
    .tz(timezone)
    .startOf('day')
    .format('YYYY-MM-DD');

  return {
    endDate,
    startDate,
    timezone,
  };
}

export function formatEventOptions({
  eventOptions,
  includeWeekOptions = false,
  updateLevel = '',
}) {
  if (updateLevel === 'RRULE') {
    return eventOptions.filter((item) => item.value === '2');
  }

  if (includeWeekOptions) {
    return eventOptions.filter((item) => !['0', '3'].includes(item.value));
  } else {
    return eventOptions.filter((item) => !['1', '4'].includes(item.value));
  }
}