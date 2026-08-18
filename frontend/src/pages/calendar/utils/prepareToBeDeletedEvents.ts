import moment from 'moment';
import type { TApiEventDeleteType } from 'types/api';

export function prepareToBeDeletedEvents({
  events,
  deleteType,
  calendarStartDate,
  calendarEndDate,
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
  useCalendarDateRangeForFuture = false,
}: {
  events: any[];
  deleteType: TApiEventDeleteType;
  calendarStartDate: string | Date;
  calendarEndDate: string | Date;
  timezone?: string;
  useCalendarDateRangeForFuture?: boolean;
}) {
  let items = events;

  // ONLY will be on:
  //   - When ONLY selected for recurring events
  //   - When non recurring event is being updated
  // Changes are the same for recurring and non-recurring events
  if (deleteType === 'ONLY') {
    items = events.map((event) => {
      const eventStartDate = moment(event.start).tz(timezone);
      const eventStartDatePlusOneDay = eventStartDate.clone().add(1, 'days');
      return {
        ...event,
        startRecur: eventStartDate.format('YYYY-MM-DD'),
        endRecur: eventStartDatePlusOneDay.format('YYYY-MM-DD'),
      };
    });
  }

  // FUTURE will be on:
  //   - When FUTURE selected for recurring events
  if (deleteType === 'FUTURE') {
    const startRecur = moment(calendarStartDate)
      .tz(timezone)
      .startOf('day')
      .format('YYYY-MM-DD');

    items = events.map((event) => ({
      ...event,
      startRecur: useCalendarDateRangeForFuture
        ? startRecur
        : moment(event.start).tz(timezone).format('YYYY-MM-DD'),
    }));
  }

  // PARTLY will be on:
  //   - When user on calendar's week view and PARTLY selected for recurring events
  if (deleteType === 'PARTLY') {
    const startRecur = moment(calendarStartDate)
      .tz(timezone)
      .startOf('day')
      .format('YYYY-MM-DD');
    const endRecur = moment(calendarEndDate)
      .tz(timezone)
      .startOf('day')
      .format('YYYY-MM-DD');

    items = events.map((event) => ({
      ...event,
      startRecur,
      endRecur,
    }));
  }

  return {
    items,
    deleteType,
  };
}
