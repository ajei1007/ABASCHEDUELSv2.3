import moment from 'moment';
import daysOfWeek from 'constants/daysOfWeek';
import { isDateRangeRecurring } from 'utils/isDateRangeRecurring';
import type { TApiEventUpdateType, TApiEventUpdateLevel } from 'types/api';

export function prepareToBeUpdatedEvents({
  events,
  updateType,
  updateLevel,
  calendarStartDate,
  calendarEndDate,
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
  cancellationUpdate = false,
  sandboxUpdate = false,
  useCalendarDateRangeForFuture = false,
}: {
  events: {
    newEvent: any;
    oldEvent: any;
  }[];
  updateType: TApiEventUpdateType;
  updateLevel: TApiEventUpdateLevel;
  calendarStartDate: string | Date;
  calendarEndDate: string | Date;
  timezone?: string;
  cancellationUpdate?: boolean;
  sandboxUpdate?: boolean;
  useCalendarDateRangeForFuture?: boolean;
}) {
  let items = events;
  let newUpdateType = updateType;

  // ONLY will be on:
  //   - When ONLY selected for recurring events
  //   - When non recurring event is being updated
  // Changes are the same for recurring and non-recurring events
  // Coveres the case for updating non-recurring event updated from calendar week and month view
  if (updateType === 'ONLY') {
    items = events.map(({ newEvent, oldEvent }) => {
      if (
        updateLevel === 'SIMPLE' ||
        !isDateRangeRecurring(newEvent.endRecur, newEvent.startRecur)
      ) {
        // ATTENTION: might be timezone issue here
        const weekday = moment(newEvent.startRecur).weekday();
        newEvent = {
          ...newEvent,
          daysOfWeek: [daysOfWeek[weekday].value],
          frequency: [
            {
              value: 'Weekly',
            },
          ],
          bysetpos: [
            {
              value: 1,
            },
          ],
          interval: [
            {
              value: 1,
            },
          ],
        };
      }

      return {
        oldEvent,
        newEvent,
      };
    });
  }

  // FUTURE will be on:
  //   - When FUTURE selected for recurring events
  if (updateLevel === 'SIMPLE' && updateType === 'FUTURE') {
    const startRecur = moment(calendarStartDate)
      .tz(timezone)
      .startOf('day')
      .format('YYYY-MM-DD');

    items = events.map(({ newEvent, oldEvent }) => {
      return {
        oldEvent,
        newEvent: {
          ...newEvent,
          startRecur: useCalendarDateRangeForFuture
            ? startRecur
            : moment(newEvent.start).tz(timezone).format('YYYY-MM-DD'),
        },
      };
    });
  }

  // PARTLY will be on:
  //   - When user on calendar's week view and PARTLY selected for recurring events
  if (updateType === 'PARTLY') {
    const startRecur = moment(calendarStartDate)
      .tz(timezone)
      .startOf('day')
      .format('YYYY-MM-DD');
    const endRecur = moment(calendarEndDate)
      .tz(timezone)
      .startOf('day')
      .format('YYYY-MM-DD');

    items = events.map(({ newEvent, oldEvent }) => {
      return {
        oldEvent,
        newEvent: {
          ...newEvent,
          startRecur,
          endRecur,
        },
      };
    });
  }

  if (updateLevel === 'RRULE') {
    newUpdateType = 'ALL';
  }

  return {
    items,
    updateType: newUpdateType,
    updateLevel,
    cancellationUpdate,
    sandboxUpdate,
  };
}
