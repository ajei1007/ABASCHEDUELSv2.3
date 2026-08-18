import moment from 'moment';
import moment2 from 'moment-timezone';
import { weekdayOptions } from 'constants/recurrenceOptions';

export const eventExtractFormatter = (ev) => {
  let drag_user = ev.extendedProps.drag_users
    ? ev.extendedProps.drag_users
    : [];

  const usersNames = [
    ...(ev?.extendedProps?.roles_list?.Employee || []),
    ...(ev?.extendedProps?.roles_list?.Client || []),
  ].map((name) => `${name}`.trim());

  const evStart = ev.start ?? ev.extendedProps.start_real;
  const evEnd = ev.end ?? ev.extendedProps.end_real;
  let startTZ = evStart;
  let endTZ = evEnd;
  const timezone = ev.extendedProps?.timezone;
  if (timezone) {
    startTZ = moment2.tz(evStart, timezone).format();
    endTZ = moment2.tz(evEnd, timezone).format();
  }

  const eventStart = startTZ ?? ev.extendedProps.start_real;
  const eventEnd = endTZ ?? ev.extendedProps.end_real;
  const currentWeekDay = weekdayOptions[moment(eventStart).day()]?.value;
  return {
    id: ev.id,
    eventGroupId: ev.extendedProps.eventGroupId,
    // Time
    start: eventStart,
    end: eventEnd,
    eventIdCustom: ev.extendedProps.eventIdCustom,
    // Recurring
    startRecur: ev.extendedProps.startRecur1
      ? ev.extendedProps.startRecur1
      : moment(eventStart).format('YYYY-MM-DD'),
    endRecur: ev.extendedProps.endRecur1
      ? ev.extendedProps.endRecur1
      : moment(eventStart).add(1, 'days').format('YYYY-MM-DD'),
    allDay: ev.allDay,
    sandboxMode: ev?.extendedProps?.sandboxMode ?? false,
    daysOfWeek: ev.extendedProps.daysOfWeek_real
      ? ev.extendedProps.daysOfWeek_real
          .map((p) => weekdayOptions[p].value)
          .filter((d) => d !== currentWeekDay)
          .concat([currentWeekDay])
      : [currentWeekDay],
    frequency: ev.extendedProps.frequency
      ? [{ value: ev.extendedProps.frequency }]
      : [{ value: 'Weekly' }],
    bysetpos: ev.extendedProps.bysetpos
      ? [{ value: ev.extendedProps.bysetpos }]
      : [{ value: '1' }],
    interval: ev.extendedProps.interval
      ? [{ value: ev.extendedProps.interval }]
      : [{ value: 1 }],
    // Users
    users: ev.extendedProps.users
      ? ev.extendedProps.users.map((p) => ({ value: p })).concat(drag_user)
      : ev._def.resourceIds.map((p) => ({ value: p })).concat(drag_user),
    // Adding usersNames information for showing on changeAffected modal
    usersNames,
    // Others
    desc: ev.extendedProps.notes,
    address: ev.extendedProps.address,
    latitude: ev.extendedProps?.latitude ?? null,
    longitude: ev.extendedProps?.longitude ?? null,
    visible: ev.extendedProps.visible,
    activity0Id: ev.extendedProps.activity0Id,
    location0Id: ev.extendedProps.location0Id,
    timezone: ev.extendedProps.timezone || null,
    // Canellations
    canceled: ev.extendedProps.canceled ?? false,
    reason_canceled: ev.extendedProps.canceled
      ? ev.extendedProps.reason_canceled &&
        ev.extendedProps.reason_canceled &&
        ev.extendedProps.reason_canceled[0] &&
        ev.extendedProps.reason_canceled.length > 0
        ? ev.extendedProps.reason_canceled[0].value ||
          ev.extendedProps.reason_canceled ||
          null
        : null
      : null,
    user_canceled: ev.extendedProps.canceled
      ? ev.extendedProps.user_canceled &&
        ev.extendedProps.user_canceled[0] &&
        ev.extendedProps.user_canceled.length > 0
        ? ev.extendedProps.user_canceled[0].value ||
          ev.extendedProps.user_canceled ||
          null
        : null
      : null,

    supervisionId: ev.extendedProps.supervisionId,
    supervisionActivity: ev.extendedProps.supervisionActivity,
    supervisionUsers: ev.extendedProps.supervisionUsers,
    supervisionStartTime: ev.extendedProps.supervisionStartTime,
    supervisionEndTime: ev.extendedProps.supervisionEndTime,
    supervisionEvent_canceled: ev.extendedProps.supervisionEvent_canceled,
    supervisionEvent_userCanceled: ev.extendedProps.supervisionEvent_canceled
      ? ev.extendedProps.supervisionEvent_userCanceled
      : null,
    supervisionEvent_reasonCanceled: ev.extendedProps.supervisionEvent_canceled
      ? ev.extendedProps.supervisionEvent_reasonCanceled
      : null,

    converted: ev.extendedProps.converted ?? false,
    startActual: ev.extendedProps.startActual,
    endActual: ev.extendedProps.endActual,
    deletedAt: ev.extendedProps.deletedAt || null,
  };
};
