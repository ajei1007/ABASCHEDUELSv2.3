import moment from 'moment';
import { isDateRangeRecurring } from 'utils/isDateRangeRecurring';

export const deleteMultipleEvents = ({
  deletingEvents,
  selectedDeleteOption,
  timezone,
  calendarStart,
  calendarEnd,
  allRecurringSelected = false,
}) => {
  timezone = timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const calendarStartDate = moment(calendarStart)
    .tz(timezone)
    .startOf('day')
    .format('YYYY-MM-DD');
  const calendarEndDate = moment(calendarEnd)
    .tz(timezone)
    .startOf('day')
    .format('YYYY-MM-DD');
  const isWeekView =
    moment(calendarEndDate).diff(calendarStartDate, 'days') === 7;

  const toBeUpdated = [];
  const toBeAdded = [];
  const toBeDeleted = [];

  deletingEvents.forEach((event) => {
    const isRecurring = isDateRangeRecurring(event.endRecur, event.startRecur);
    const startDate = moment(event.start);
    const startDate_plus1 = moment(event.start).add(1, 'days');

    const weekViewMultiSelectTheSameEvent = allRecurringSelected && isWeekView;
    if (isRecurring) {
      if (selectedDeleteOption === 1) {
        // Delete All
        toBeDeleted.push(event);
      } else if (selectedDeleteOption === 0) {
        // Delete Only
        // update past recurring events
        if (
          moment(startDate.format('YYYY-MM-DD')).isSame(event.startRecur) ===
          false
        ) {
          toBeAdded.push({
            ...event,
            endRecur: weekViewMultiSelectTheSameEvent
              ? calendarStartDate
              : startDate.format('YYYY-MM-DD'),
          });
        }
        // add future recurring events
        if (isDateRangeRecurring(event.endRecur, startDate.format('YYYY-MM-DD'))) {
          toBeAdded.push({
            ...event,
            startRecur: weekViewMultiSelectTheSameEvent
              ? calendarEndDate
              : startDate_plus1.format('YYYY-MM-DD'),
          });
        }
        // Delete
        toBeDeleted.push(event);
      } else if (selectedDeleteOption === 2) {
        // Delete Future
        toBeUpdated.push({
          newEvent: {
            ...event,
            endRecur: weekViewMultiSelectTheSameEvent
              ? calendarEndDate
              : startDate_plus1.format('YYYY-MM-DD'),
          },
          oldEvent: event,
        });
      } else if (selectedDeleteOption === 3) {
        // Delete Past
        toBeUpdated.push({
          newEvent: {
            ...event,
            startRecur: weekViewMultiSelectTheSameEvent
              ? calendarStartDate
              : startDate.format('YYYY-MM-DD'),
          },
          oldEvent: event,
        });
      }
    } else {
      toBeDeleted.push(event);
    }
  });

  return {
    toBeAdded,
    toBeUpdated,
    toBeDeleted,
  };
};

export const updateMultipleEvents = (
  updatingEvents,
  selectedUpdateOption,
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
) => {
  const toBeUpdated = [];
  const toBeAdded = [];

  updatingEvents.forEach((ev) => {
    const { newEvent, oldEvent } = ev;
    const isRecurring = isDateRangeRecurring(
      oldEvent.endRecur,
      oldEvent.startRecur,
    );
    const startDate = moment(newEvent.start).tz(timezone);
    const endDate = moment(newEvent.end).tz(timezone);
    const startDatePlusOneDay = moment(newEvent.start)
      .tz(timezone)
      .add(1, 'days');
    const endDatePlusOneDay = moment(newEvent.end).tz(timezone).add(1, 'days');

    if (isRecurring) {
      if (selectedUpdateOption.value === '1') {
        // Update All
        toBeUpdated.push({
          newEvent,
          oldEvent,
        });
      } else if (selectedUpdateOption.value === '0') {
        // Update Only
        // if the startRecur and today's date are not equal
        // Add past recurring events
        if (
          moment(startDate.format('YYYY-MM-DD')).isSame(oldEvent.startRecur) ===
          false
        ) {
          toBeAdded.push({
            ...oldEvent,
            endRecur: startDate.format('YYYY-MM-DD'),
          });
        }
        // add future recurring events
        if (
          isDateRangeRecurring(oldEvent.endRecur, startDate.format('YYYY-MM-DD'))
        ) {
          toBeAdded.push({
            ...oldEvent,
            startRecur: startDatePlusOneDay.format('YYYY-MM-DD'),
          });
        }
        // update event for today
        toBeUpdated.push({
          newEvent: {
            ...newEvent,
            startRecur: startDate.format('YYYY-MM-DD'),
            endRecur: endDatePlusOneDay.format('YYYY-MM-DD'),
          },
          oldEvent: oldEvent,
        });
      } else if (selectedUpdateOption.value === '2') {
        // Update Future
        // update future recurring events
        toBeUpdated.push({
          newEvent: {
            ...newEvent,
            startRecur: startDate.format('YYYY-MM-DD'),
          },
          oldEvent: oldEvent,
        });
        // create past and current day events
        if (startDate.format('YYYY-MM-DD') !== newEvent.startRecur) {
          toBeAdded.push({
            ...oldEvent,
            endRecur: startDate.format('YYYY-MM-DD'),
          });
        }
      } else if (selectedUpdateOption.value === '3') {
        // Update Past
        // update past events
        toBeUpdated.push({
          newEvent: {
            ...newEvent,
            endRecur: startDatePlusOneDay.format('YYYY-MM-DD'),
          },
          oldEvent: oldEvent,
        });
        // add current day and future event
        toBeAdded.push({
          ...oldEvent,
          startRecur: startDatePlusOneDay.format('YYYY-MM-DD'),
        });
      }
    } else {
      // If event is being updated to the new date
      if (
        moment(startDate.format('YYYY-MM-DD')).isSame(newEvent.startRecur) ===
        false
      ) {
        newEvent.startRecur = startDate.format('YYYY-MM-DD');
        newEvent.endRecur = endDate.add(1, 'day').format('YYYY-MM-DD');
      }
      toBeUpdated.push({
        newEvent,
        oldEvent,
      });
    }
  });

  return {
    toBeAdded,
    toBeUpdated,
    toBeDeleted: null,
  };
};
