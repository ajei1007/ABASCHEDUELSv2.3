import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import day_ids from 'constants/days';

function calculateSupervisionStartEndTimes({
  event,
  oldEvent = null,
  fallbackTimezone,
}) {
  const timezone = event.timezone || fallbackTimezone;
  if (!oldEvent || !timezone) {
    const inTheGap =
      moment(event.supervisionStartTime).isSameOrAfter(event.start) &&
      moment(event.supervisionEndTime).isSameOrBefore(event.end);
    return {
      supervisionStartTime: inTheGap ? event.supervisionStartTime : event.start,
      supervisionEndTime: inTheGap ? event.supervisionEndTime : event.end,
    };
  }

  const eventStart = moment(event.start);
  const eventEnd = moment(event.end);

  // set same date as in newEvent start/end for valid comparison
  const oldEventStart = moment(oldEvent.start).set({
    year: eventStart.year(),
    month: eventStart.month(),
    date: eventStart.date(),
  });
  const startTime = moment(event.supervisionStartTime).set({
    year: eventStart.year(),
    month: eventStart.month(),
    date: eventStart.date(),
  });
  const endTime = moment(event.supervisionEndTime).set({
    year: eventEnd.year(),
    month: eventEnd.month(),
    date: eventEnd.date(),
  });

  // calculating shift for old and new event start/end times
  const supervisionStartTime = moment
    .max(startTime.add(eventStart.diff(oldEventStart)), eventStart)
    .tz(timezone);
  const supervisionEndTime = moment
    .min(endTime.add(eventStart.diff(oldEventStart)), eventEnd)
    .tz(timezone);

  // check for zero supervision event case
  if (supervisionStartTime.isSameOrAfter(supervisionEndTime)) {
    return {
      supervisionStartTime: event.start,
      supervisionEndTime: event.end,
    };
  }

  return {
    supervisionStartTime: supervisionStartTime.format(),
    supervisionEndTime: supervisionEndTime.format(),
  };
}

// ** Formatters
export const handleEvent = ({
  event,
  activityResources,
  locationResources,
  oldEvent = null,
  fallbackTimezone = null,
  optType = 'update',
  includeActivityLocationResources = false,
}) => {
  let activity = null;
  let location = null;
  const eventId = uuidv4();

  const eventUsers = event.users
    .filter((e) => e?.value !== '')
    .map((e) => {
      let i = '';
      if (e.value) {
        i = e.value;
        if (e.value.length === 37) {
          i = i.substring(0, e.value.length - 1);
          return i;
        } else return i;
      }
      if (e.id) {
        i = e.id;
        if (e.id && e.id.length === 37) {
          return i.substring(0, e.id.length - 1);
        } else return i;
      }
      return e;
    });
  let users = [...new Set(eventUsers)];
  activity = users.find((u) => activityResources.find((t) => t.id === u));
  location = users.find((u) => locationResources.find((t) => t.id === u));
  if (!activity && event.activity0Id) {
    activity = event.activity0Id;
  }
  if (!location && event.location0Id) {
    location = event.location0Id;
  }

  // Supervision
  let supervisionEvent = null;
  let supervisionId = event.supervisionId ? event.supervisionId : null;
  if (event.supervisionUsers?.length && event.supervisionActivity) {
    const eventUsers = users.filter(
      (user) => user !== activity && user !== location,
    );
    const uniqueUsers = [
      ...new Set([...eventUsers, ...event.supervisionUsers]),
    ];

    const { supervisionStartTime, supervisionEndTime } =
      calculateSupervisionStartEndTimes({
        event,
        oldEvent,
        fallbackTimezone,
      });

    if (optType === 'add') {
      supervisionId = uuidv4();
    }

    supervisionEvent = {
      id: supervisionId,
      activity0Id: event.supervisionActivity,
      users: uniqueUsers,
      start: supervisionStartTime,
      end: supervisionEndTime,
      isCancelled: event.supervisionEvent_canceled,
      cancellationReasonId: event.supervisionEvent_canceled
        ? event.supervisionEvent_reasonCanceled
        : null,
      cancelledByUserId: event.supervisionEvent_canceled
        ? event.supervisionEvent_userCanceled
        : null,
    };
  } else {
    supervisionEvent = null;
  }

  if (event.rooms?.length) {
    const roomIds = event.rooms.map((r) => r.value);
    users = [...users, ...roomIds];
  }
  if (!includeActivityLocationResources)
    users = users.filter((user) => user !== activity && user !== location);
  users = [...new Set(users)];
  return {
    id: eventId,
    data: {
      id: eventId,
      eventGroupId: event?.eventGroupId,
      sandboxMode: event.sandboxMode ?? false,
      activity0Id: activity,
      location0Id: location,
      eventIdCustom: event.eventIdCustom,
      start: event.start,
      end: event.end,
      users,
      notes: event.desc,
      address: event.address,
      latitude: event?.latitude ?? null,
      longitude: event?.longitude ?? null,
      distance: event.distance,
      driveDuration: event.driveDuration,
      allDay: event.allDay,
      visible: event.visible ? event.visible : false,
      frequency: event?.frequency?.[0]?.value ?? 'Weekly',
      bysetpos: event?.bysetpos?.[0]?.value ?? '1',
      interval: event?.interval?.[0]?.value ?? 1,
      startRecur: event.startRecur
        ? moment(event.startRecur).format('YYYY-MM-DD')
        : moment(event.start).format('YYYY-MM-DD'),
      endRecur: event.endRecur
        ? moment(event.endRecur).format('YYYY-MM-DD')
        : moment(event.end).format('YYYY-MM-DD'),
      daysOfWeek: event.daysOfWeek
        ? event.daysOfWeek
        : [Object.values(day_ids)[event.start.getDay()]],
      timezone: event.timezone || null,
      // New
      isCancelled: event.canceled ?? false,
      cancellationReasonId: event.canceled
        ? event.reason_canceled &&
          event.reason_canceled &&
          event.reason_canceled[0] &&
          event.reason_canceled.length > 0
          ? event.reason_canceled[0].value || event.reason_canceled || null
          : null
        : null,
      cancelledByUserId: event.canceled
        ? event.user_canceled &&
          event.user_canceled[0] &&
          event.user_canceled.length > 0
          ? event.user_canceled[0].value || event.user_canceled || null
          : null
        : null,
      // Supervision
      supervisionEvent,
      supervisionId,
      // Convert
      converted: event.converted ?? false,
      startActual: event.startActual ?? null,
      endActual: event.endActual ?? null,
      deletedAt: event.deletedAt ?? null,
    },
  };
};
export const generateTimeRangeParameter = (
  dateTime,
  timeZone = 'America/Los_Angeles',
  format = '',
) => {
  const timeZoneDateTime = moment(dateTime).tz(timeZone).format(format);
  return timeZoneDateTime;
};

export const checkIsCurrentBranchLevelHighest = (
  allBranches,
  currentBranchLevel,
) => {
  let highestLevel = 0;
  if (allBranches.length) {
    highestLevel = Math.max.apply(
      Math,
      allBranches
        .filter((b) => b.options.length)
        .map((b) => b.options[0].level),
    );
  }
  return highestLevel <= currentBranchLevel;
};
export const checkIsBranchLastTwoLowest = (allBranches, branchId) => {
  const branches = [...allBranches].reverse().slice(1, 3);
  return branches.some((group) =>
    group?.options?.some((branch) => branch?.value === branchId),
  );
};

const _toDate = (d) => (d ? new Date(d) : new Date(0));

function _mergeConstraint(existing, incoming, incomingDate, existingDate) {
  const latestWins =
    incomingDate >= existingDate ? { ...incoming } : { ...existing };

  const eitherBroken = existing.broken || incoming.broken;
  if (eitherBroken) latestWins.broken = true;

  if (existing.broken && incoming.broken) {
    const gaps = [...(existing.gaps || []), ...(incoming.gaps || [])];
    const seen = new Set();
    latestWins.gaps = gaps.filter((g) => {
      const key = `${g.startTime}|${g.endTime}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  const mergedDate = incomingDate >= existingDate ? incomingDate : existingDate;
  return { obj: latestWins, date: mergedDate };
}

function _mergeLatest(existing, incoming, incomingDate, existingDate) {
  return incomingDate >= existingDate
    ? { obj: incoming, date: incomingDate }
    : { obj: existing, date: existingDate };
}

const _constraintKey = (c) =>
  c?.id || `${c?.constraintType || ''}:${c?.description || ''}`;

const _emptyAvailKey = (e) => `${e?.startTime || ''}|${e?.endTime || ''}`;

const _notAvailKey = (e) => `${e?.startTime || ''}|${e?.endTime || ''}`;

const _overbookingKey = (o) => {
  const conflict = o?.conflict
    ? `${o.conflict.startTime || ''}|${o.conflict.endTime || ''}`
    : '';
  const evIds = (o?.events || [])
    .map((ev) => ev.id || '')
    .sort()
    .join(',');
  return `${conflict}|${evIds}`;
};

const _siblingKey = (s) => s?.id || JSON.stringify(s || {});

export const formatFlagginData = (arr = []) => {
  const userMap = new Map();

  arr.forEach((userRow) => {
    const {
      userId,
      firstName,
      lastName,
      date,
      constraints = [],
      overbookings = [],
      emptyAvailabilities = [],
      notAvailableBusy = [],
      siblingBranchPeopleEvents = [],
    } = userRow;

    if (!userId) return;
    const rowDate = _toDate(date);

    if (!userMap.has(userId)) {
      userMap.set(userId, {
        userId,
        firstName,
        lastName,
        date,
        constraintsMap: new Map(),
        overbookingsMap: new Map(),
        emptyAvailMap: new Map(),
        notAvailMap: new Map(),
        siblingMap: new Map(),
      });
    }

    const agg = userMap.get(userId);
    if (_toDate(agg.date) < rowDate) agg.date = date;

    constraints.forEach((c) => {
      const key = _constraintKey(c);
      if (!key) return;
      if (agg.constraintsMap.has(key)) {
        const { obj: ex, date: exDate } = agg.constraintsMap.get(key);
        agg.constraintsMap.set(key, _mergeConstraint(ex, c, rowDate, exDate));
      } else {
        agg.constraintsMap.set(key, { obj: c, date: rowDate });
      }
    });

    overbookings.forEach((o) => {
      const key = _overbookingKey(o);
      if (!key) return;
      if (agg.overbookingsMap.has(key)) {
        const { obj: ex, date: exDate } = agg.overbookingsMap.get(key);
        agg.overbookingsMap.set(key, _mergeLatest(ex, o, rowDate, exDate));
      } else {
        agg.overbookingsMap.set(key, { obj: o, date: rowDate });
      }
    });

    emptyAvailabilities.forEach((ea) => {
      const key = _emptyAvailKey(ea);
      if (!key) return;
      if (agg.emptyAvailMap.has(key)) {
        const { obj: ex, date: exDate } = agg.emptyAvailMap.get(key);
        agg.emptyAvailMap.set(key, _mergeLatest(ex, ea, rowDate, exDate));
      } else {
        agg.emptyAvailMap.set(key, { obj: ea, date: rowDate });
      }
    });

    notAvailableBusy.forEach((na) => {
      const key = _notAvailKey(na);
      if (!key) return;
      if (agg.notAvailMap.has(key)) {
        const { obj: ex, date: exDate } = agg.notAvailMap.get(key);
        agg.notAvailMap.set(key, _mergeLatest(ex, na, rowDate, exDate));
      } else {
        agg.notAvailMap.set(key, { obj: na, date: rowDate });
      }
    });

    siblingBranchPeopleEvents.forEach((sb) => {
      const key = _siblingKey(sb);
      if (!key) return;
      if (agg.siblingMap.has(key)) {
        const { obj: ex, date: exDate } = agg.siblingMap.get(key);
        agg.siblingMap.set(key, _mergeLatest(ex, sb, rowDate, exDate));
      } else {
        agg.siblingMap.set(key, { obj: sb, date: rowDate });
      }
    });
  });

  const mergedUsers = Array.from(userMap.values()).map((agg) => ({
    userId: agg.userId,
    firstName: agg.firstName,
    lastName: agg.lastName,
    date: agg.date,
    constraints: Array.from(agg.constraintsMap.values()).map((v) => v.obj),
    overbookings: Array.from(agg.overbookingsMap.values()).map((v) => v.obj),
    emptyAvailabilities: Array.from(agg.emptyAvailMap.values()).map(
      (v) => v.obj,
    ),
    notAvailableBusy: Array.from(agg.notAvailMap.values()).map((v) => v.obj),
    siblingBranchPeopleEvents: Array.from(agg.siblingMap.values()).map(
      (v) => v.obj,
    ),
  }));

  let flags = [];
  mergedUsers.forEach((user) => {
    if (user.constraints?.length) {
      flags.push(
        ...user.constraints.map((v) => formatFlaggingConstraint(user, v)),
      );
    }
    if (user.overbookings?.length) {
      flags.push(
        ...user.overbookings.map((v) => formatFlaggingOverbooking(user, v)),
      );
    }
    if (user.emptyAvailabilities?.length) {
      flags.push(
        ...user.emptyAvailabilities.map((v) =>
          formatFlaggingEmptyAvailabilities(user, v),
        ),
      );
    }
    if (user.notAvailableBusy?.length) {
      flags.push(
        ...user.notAvailableBusy.map((v) =>
          formatFlaggingNotAvailableBusy(user, v),
        ),
      );
    }
    if (user.siblingBranchPeopleEvents?.length) {
      flags.push(
        ...user.siblingBranchPeopleEvents.map((v) =>
          formatFlaggingSiblingBranchPeople(user, v),
        ),
      );
    }
  });

  return flags;
};

export const formatFlaggingConstraint = (user, constraint) => {
  return {
    ...constraint,
    id: uuidv4(),
    constraintId: constraint.id,
    userId: user.userId,
    user: { firstName: user?.firstName, lastName: user?.lastName },
  };
};
export const formatFlaggingOverbooking = (user, overbooking) => {
  const { startTime, endTime } = overbooking.conflict;
  const description = `The event between <strong>${startTime}</strong> - <strong>${endTime}</strong> is overbooking another event`;
  return {
    id: uuidv4(),
    userId: user.userId,
    user: { firstName: user?.firstName, lastName: user?.lastName },
    constraintType: 'overbooking',
    constraintId: `overbooking|${startTime}|${endTime}`,
    description,
    broken: true,
  };
};

export const formatFlaggingSiblingBranchPeople = (
  user,
  siblingBranchPeople,
) => {
  const workedPeople = siblingBranchPeople.conflictedPeople.join(',');
  const description = `${siblingBranchPeople.description} But he worked with <strong>${workedPeople}</strong> in <strong>${siblingBranchPeople.activity}</strong>`;
  return {
    id: uuidv4(),
    userId: user.userId,
    user: { firstName: user?.firstName, lastName: user?.lastName },
    constraintType: 'siblingbranch',
    constraintId: `siblingbranch|${siblingBranchPeople.description}|${siblingBranchPeople.activity}`,
    description,
    broken: true,
  };
};

export const formatFlaggingEmptyAvailabilities = (user, availability) => {
  const { startTime, endTime } = availability;
  const userFullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`;
  const description = `Between <strong>${startTime}</strong> - <strong>${endTime}</strong> available time range, <strong>${userFullName}</strong> shouldn't have any event`;
  return {
    id: uuidv4(),
    userId: user.userId,
    user: { firstName: user?.firstName, lastName: user?.lastName },
    constraintType: 'emptyAvailability',
    constraintId: `emptyAvailability|${startTime}|${endTime}|${userFullName}`,
    description,
    broken: true,
  };
};
export const formatFlaggingNotAvailableBusy = (user, availability) => {
  const { startTime, endTime } = availability;
  const userFullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`;
  const description = `<strong>${userFullName}</strong> has event between <strong>${startTime}</strong> - <strong>${endTime}</strong> unavailable time range`;
  return {
    id: uuidv4(),
    userId: user.userId,
    user: { firstName: user?.firstName, lastName: user?.lastName },
    constraintType: 'notAvailableBusy',
    constraintId: `notAvailableBusy|${startTime}|${endTime}|${userFullName}`,
    description,
    broken: true,
  };
};
