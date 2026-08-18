const getFullName = require('./getFullName');
const distributeUsersFromEventsByRole = require('./distributeUsersFromEventsByRole');
const timezoneUsesDLS = require('./timezoneUsesDLS');
const isDateInDST = require('./isDateInDST');

const moment = require('moment');
const moment2 = require('moment-timezone');
const { getDays } = require('./schedulerUtils');
const rule_RRule = require('rrule');

// TODO update the logics (not implemented well)
const formatEventForScheduler = (
  event,
  req,
  roleHierarchy,
  isRealtime = false,
) => {
  const timezone = req.body?.timezone ?? 'America/Los_Angeles';
  const eventTimezone = event.timezone ?? 'America/Los_Angeles';
  const startCalendar = new Date(req.query.start);
  const endCalendar = new Date(req.query.end);
  const backgroundColorRole = req.body.backgroundColorRole;
  const borderColorRole = req.body.borderColorRole;

  // SOCKET CODE
  const io = req.app.get('socketio');

  let is_client = false;
  const user_role_names = req.currentUser.roles.map((t) => t.name);

  for (let index = 0; index < user_role_names.length; index++) {
    const role = user_role_names[index];
    if (roleHierarchy[role].includes('Client')) {
      is_client = true;
      break;
    }
  }

  const resources = event.users.map((emp) => {
    return {
      id: emp.dataValues.id,
      name: getFullName(emp.dataValues),
    };
  });
  const resourceIds = resources.map((e) => e.id);
  let roleNames = [
    'Client',
    'Employee',
    'Person',
    'Activity',
    'Location',
    'Resource',
  ];

  let usersDistributedByRole = distributeUsersFromEventsByRole(
    event.users,
    roleHierarchy,
    roleNames,
  );

  const clients_list = usersDistributedByRole
    .get('Client')
    .map((ty) => getFullName(ty.dataValues));
  const employees_list = usersDistributedByRole
    .get('Employee')
    .map((ty) => getFullName(ty.dataValues));

  const activities_l = usersDistributedByRole.get('Activity');
  const activity_priority =
    activities_l.length > 0 ? activities_l[0].dataValues.priority : null;
  const activities_list = activities_l.map((ty) => getFullName(ty.dataValues));

  const locations_list = usersDistributedByRole.get('Location');
  const locations_list2 = usersDistributedByRole
    .get('Location')
    .map((ty) => getFullName(ty.dataValues));
  const locationIds = usersDistributedByRole
    .get('Location')
    .map((ty) => ty.dataValues.id);

  let people_list = usersDistributedByRole.get('Person');
  const people_list_ids = usersDistributedByRole
    .get('Person')
    .map((ty) => ty.dataValues.id);

  let resource_list = usersDistributedByRole.get('Resource');
  const resource_list_ids = usersDistributedByRole
    .get('Resource')
    .map((ty) => ty.dataValues.id);

  const clients_list_ids = usersDistributedByRole
    .get('Client')
    .map((ty) => ty.dataValues.id);

  let filtered_clients_list = usersDistributedByRole.get('Client');

  if (is_client) {
    resource_list = resource_list.filter(
      (res) =>
        res.id == req.currentUser.id || !clients_list_ids.includes(res.id),
    );
    people_list = people_list.filter(
      (res) =>
        res.id == req.currentUser.id || !clients_list_ids.includes(res.id),
    );
    filtered_clients_list = filtered_clients_list.filter(
      (res) => res.id == req.currentUser.id,
    );
  }

  filtered_clients_list = filtered_clients_list.map((ty) =>
    getFullName(ty.dataValues),
  );

  people_list = people_list.map((ty) => getFullName(ty.dataValues));

  resource_list = resource_list.map((ty) => getFullName(ty.dataValues));

  const roles_list = {
    Employee: employees_list,
    Client: filtered_clients_list,
    Activity: activities_list,
  };
  const activity =
    usersDistributedByRole.get('Activity').length > 0
      ? usersDistributedByRole.get('Activity')[0]
      : null;

  // Colors
  if (backgroundColorRole && backgroundColorRole != 'Activity') {
    roleNames.push(backgroundColorRole);
  }

  if (borderColorRole && borderColorRole != 'Location') {
    roleNames.push(borderColorRole);
  }

  let actualBackgroundColorRole = backgroundColorRole;
  if (!actualBackgroundColorRole) {
    actualBackgroundColorRole = 'Activity';
  }
  const backgroundColorUsers = usersDistributedByRole.get(
    actualBackgroundColorRole,
  );
  let color = 'black';
  if (
    backgroundColorUsers?.length > 0 &&
    backgroundColorUsers[0].dataValues.color
  ) {
    color = backgroundColorUsers[0].dataValues.color;
  } else {
    color =
      activity && activity.dataValues.color
        ? activity.dataValues.color
        : 'black';
  }
  let locationColor = 'Black';
  let actualBorderColorRole = borderColorRole;
  if (!actualBorderColorRole) {
    actualBorderColorRole = 'Location';
  }
  const borderColorUsers = usersDistributedByRole.get(actualBorderColorRole);

  if (
    borderColorUsers?.length > 0 &&
    borderColorUsers[0].dataValues.borderColor
  ) {
    locationColor = borderColorUsers[0].dataValues.borderColor;
  } else if (locations_list?.length > 0) {
    locationColor = locations_list[0].dataValues?.color;
  }

  /* Time/Recurrance/Rrule */
  startCalendar.setUTCHours(0, 0, 0, 0);

  let startNow = moment2.tz(
    event.startRecur + ' ' + moment2.tz(event.start, timezone).format('HH:mm'),
    'YYYY-MM-DD HH:mm',
    timezone
  ).format();

  let endNow = moment2.tz(event.endRecur, timezone).format('YYYY-MM-DD');
  let eventStartReal = moment2.tz(event.start, timezone).toDate();
  const endReal = new Date(eventStartReal.getTime());
  endReal.setUTCHours(23, 59, 59, 999);

  const frequency = event.frequency ? event.frequency.toUpperCase() : 'WEEKLY';
  const days = getDays(event);
  const duration = moment2.tz(event.end, timezone).diff(moment2.tz(event.start, timezone), 'seconds');

  const dst1 = moment2.tz(eventStartReal, timezone).isDST();
  const dst2 = moment2.tz(event.start, timezone).isDST();
  if (dst1 != dst2) {
    if (dst1) {
      eventStartReal = moment2.tz(eventStartReal, timezone).add(-1, 'hours').toDate();
      startNow = moment2.tz(startNow, timezone).add(-1, 'hours').toDate();
    } else {
      eventStartReal = moment2.tz(eventStartReal, timezone).add(+1, 'hours').toDate();
      startNow = moment2.tz(startNow, timezone).add(+1, 'hours').toDate();
    }
  }

  let requestedTZUsesDLS = timezoneUsesDLS(timezone);
  let eventsTZUsesDLS = timezoneUsesDLS(eventTimezone);
  let eventStartIsInDLS = isDateInDST(moment.utc(event.start).toDate());

  if (eventsTZUsesDLS && !requestedTZUsesDLS) {
    if (!eventStartIsInDLS) {
      eventStartReal = moment2.tz(eventStartReal, timezone).subtract(1, 'hours').toDate();
      startNow = moment2.tz(startNow, timezone).subtract(1, 'hours').toDate();
    }
  }

  if (!eventsTZUsesDLS && requestedTZUsesDLS) {
    if (!eventStartIsInDLS) {
      eventStartReal = moment2.tz(eventStartReal, timezone).add(+1, 'hours').toDate();
      startNow = moment2.tz(startNow, timezone).add(+1, 'hours').toDate();
    }
  }

  let dtstart = moment2.tz(startNow, timezone).toDate();

  let rules = [];
  let until = new Date(endNow);
  let dateShiftingHandled = false;
  let byweekday = [...new Set([...days.map((t) => (t == 0 ? 6 : t - 1))])];
  if (until <= dtstart) {
    dateShiftingHandled = true;
    until = dtstart;
    byweekday = [...new Set([...days])];
  }

  const START_RECUR_DATE = moment.utc(event.startRecur).toDate();
  const DATE_PART_OF_DTSTART = new Date(
    moment.utc(dtstart).format('YYYY-MM-DD'),
  );

  let dateShiftingHandledForEventsEndRecurMinusStartRecurMoreThanDay = false
  if (DATE_PART_OF_DTSTART > START_RECUR_DATE && !dateShiftingHandled) {
    dtstart = moment2.tz(dtstart, timezone).add(-1, 'days').toDate();
    dateShiftingHandledForEventsEndRecurMinusStartRecurMoreThanDay = true
  }

  //let until = new Date(endNow) >= dtstart ? new Date(endNow) : dtstart;
  let rruleObject = {
    interval: event.interval || 1,
    byweekday: byweekday,
    freq: rule_RRule.RRule[frequency],
    dtstart,
    until: until,
  };
  if (frequency == 'MONTHLY') {
    rruleObject = {
      ...rruleObject,
      bysetpos: event.bysetpos ? Number(event.bysetpos) : 1,
    };
    rruleObject.byweekday.forEach((day) => {
      let rule = new rule_RRule.RRule({
        ...rruleObject,
        byweekday: [day],
      });
      rules = rules.concat(rule.between(startCalendar, endCalendar, true));
    });
  } else {
    let rule = new rule_RRule.RRule(rruleObject);
    rules = rule.between(startCalendar, endCalendar, true);
  }

  const formattedEvents = rules.map((ruleDate) => {
    let ruleStartDate = moment2.tz(ruleDate, timezone).format();

    let ruleEndDate = moment2.tz(ruleStartDate, timezone).add(duration, 'seconds').format();

    const dst1 = moment2.tz(ruleStartDate, timezone).isDST();
    const dst2 = moment2.tz(event.start, timezone).isDST();
    const dst3 = moment2.tz(event.startRecur, timezone).add(12, 'hours').isDST();
    if (
      (dst1 != dst2 || dst2 != dst3) &&
      !(dst1 == false && dst2 == true && dst3 == false) &&
      !(dst1 == true && dst2 == false && dst3 == true)
    ) {
      if (dst1) {
        ruleStartDate = moment2.tz(ruleStartDate, timezone).subtract(1, 'hours').format();
        startNow = moment2.tz(startNow, timezone).subtract(1, 'hours').format();
        ruleEndDate = moment2.tz(ruleEndDate, timezone).subtract(1, 'hours').toDate();
        endNow = moment2.tz(endNow, timezone).subtract(1, 'hours').toDate();
      } else {
        ruleStartDate = moment2.tz(ruleStartDate, timezone).add(1, 'hours').format();
        startNow = moment2.tz(startNow, timezone).add(1, 'hours').format();
        ruleEndDate = moment2.tz(ruleEndDate, timezone).subtract(1, 'hours').toDate();
        endNow = moment2.tz(endNow, timezone).subtract(1, 'hours').toDate();
      }
    }

    let currentDateIsInDLS = isDateInDST(moment.utc(ruleStartDate).toDate());
    if (requestedTZUsesDLS && !eventsTZUsesDLS) {
      if (!currentDateIsInDLS) {
        ruleStartDate = moment2.tz(ruleStartDate, timezone).subtract(1, 'hours').format();
        startNow = moment2.tz(startNow, timezone).subtract(1, 'hours').format();
        ruleEndDate = moment2.tz(ruleEndDate, timezone).subtract(1, 'hours').toDate();
        endNow = moment2.tz(endNow, timezone).subtract(1, 'hours').toDate();
      }
    }

    if (!requestedTZUsesDLS && eventsTZUsesDLS) {
      if (!currentDateIsInDLS) {
        ruleStartDate = moment2.tz(ruleStartDate, timezone).add(1, 'hours').format();
        startNow = moment2.tz(startNow, timezone).add(1, 'hours').format();
        ruleEndDate = moment2.tz(ruleEndDate, timezone).add(1, 'hours').toDate();
        endNow = moment2.tz(endNow, timezone).add(1, 'hours').toDate();
      }
    }

    if (dateShiftingHandledForEventsEndRecurMinusStartRecurMoreThanDay){
      // move it back
      ruleStartDate = moment2.tz(ruleStartDate, timezone).add(1, 'days').format();
    }

    let obj = {
      id: event.id,
      startTime: moment2.tz(event.start, timezone).format('HH:mm'),
      endTime: moment2.tz(event.end, timezone).format('HH:mm'),
      startUTC: moment2.tz(event.start, timezone).format(),
      endUTC: moment2.tz(event.end, timezone).format(),
      calendar: 'Personal',
      activity0Id: event.activity0Id,
      location0Id: event.location0Id,
      deletedAt: event.deletedAt,
      bysetpos: event.bysetpos,
      visible: event.visible,
      startRecur1: event.startRecur,
      endRecur1: event.endRecur,
      startRecur: event.startRecur,
      endRecur: event.endRecur,
      createdById: event.createdById,
      updatedById: event.updatedById,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      notes: event.notes,
      address: event.address,
      longitude: event?.longitude ?? null,
      latitude: event?.latitude ?? null,
      interval: event.interval,
      frequency: event.frequency,
      sandboxMode: event.sandboxMode,
      eventGroupId: event.eventGroupId,
      // Statusevents
      statuses: event.dataValues.statuses ?? null,
      eventStatusPendingCancellation: false,
      eventStatusPendingConfirmation: false,
      eventStatusConfirmed: false,
      eventStatusCancelled: false,
      supervisionId: event.supervisionId ?? null,
      timezone: eventTimezone,

      // Cancellations
      canceled: event.isCancelled,
      user_canceled: event.isCancelled ? event.cancelledByUserId : '',
      reason_canceled: event.isCancelled ? event.cancellationReasonId : '',
      cancelPending: [], // TODO Need statusevents

      // Other
      title: resource_list.filter((e) => e != undefined).join(' - '),
      roles_list: roles_list,
      activity: activity?.dataValues?.firstName,
      ap: activity_priority,
      resourceIds: resourceIds,
      actual_users: event.users.map((r) => {
        return {
          id: r.id,
          roles: r.roles,
        };
      }),
      users: [
        ...new Set([...people_list_ids, ...locationIds, ...resource_list_ids]),
      ],
      users_names: [
        ...new Set([...people_list, ...locations_list2, ...resource_list]),
      ],

      startNow,
      endNow,
      start_real: ruleStartDate,
      end_real: ruleEndDate,
      duration: { seconds: duration },
      duration_real: {
        seconds: moment2.tz(event.end, timezone).diff(moment2.tz(event.start, timezone), 'seconds'),
      },
      newColor: color,
      backgroundColor: color,
      borderLocationColor: locationColor,
      daysOfWeek: days,
      daysOfWeek_real: days,

      converted: event?.converted ?? false,
      startActual: event?.startActual ?? null,
      endActual: event?.endActual ?? null,
    };

    if (obj?.statuses?.length) {
      for (let z = 0; z < obj.statuses.length; z++) {
        let s = obj.statuses[z].status;
        switch (s) {
          case 'Confirmed':
            obj.eventStatusConfirmed = true;
            break;
          case 'Canceled':
            obj.eventStatusCancelled = true;
            break;
          case 'Pending Confirmation':
            obj.eventStatusPendingConfirmation = true;
            break;
          case 'Pending Cancelation':
            obj.eventStatusPendingCancellation = true;
            break;
          default:
            break;
        }
      }
    }
    return obj;
  });

  if (isRealtime && io) {
    for (const event of formattedEvents) {
      const userIds = event.users
      const payload = { o: event, rule: rruleObject };
  
      io.to(userIds).emit('receive_message', { data: [payload] });
    }
  }

  return formattedEvents;
};

module.exports = formatEventForScheduler;
