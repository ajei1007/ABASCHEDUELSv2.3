const moment = require('moment');
const moment2 = require('moment-timezone');
const rule_RRule = require('rrule');
const timezoneUsesDLS = require('./timezoneUsesDLS');
const isDateInDST = require('./isDateInDST');
const { getDays } = require('./schedulerUtils');

// WARNING: function mutates resourceAvailabilities object
const formatAvailabilityForScheduler = ({
  resourceAvailabilities,
  availability,
  currentTimezoneUsesDLS,
  startCalendar,
  endCalendar,
  type,
  timezone
}) => {
  const availabilityCreatedTZUseDLS = availability.timezone
    ? timezoneUsesDLS(availability.timezone)
    : true;

  const availabilityId = availability.id;
  let color = 'yellow';
  const onCall = availability.oncall;
  const onCallBranchId = availability.branchId;
  const branch = availability?.branch ?? null;

  const resourceId = availability[type].dataValues.id;
  let locationId = [];
  if (availability?.location2?.[0]?.color) {
    color = availability.location2[0].color;
    locationId = [availability.location2[0].id];
  } else if (availability?.location2?.[0]?.color) {
    color = availability.location2[0].color;
    locationId = [availability.location2[0].id];
  } else if (availability?.location2?.[0]) {
    locationId = [availability.location2[0].id];
  }

  const interval = availability.interval || 1;
  const frequency = availability?.frequency?.toUpperCase() ?? 'WEEKLY';

  const status = availability.status;

  // For simple recurrence cases dtstart can be startCalendar or av.startRange (little optimization trick)
  const dtstart =
    frequency === 'WEEKLY' && interval === 1
      ? moment
          .max(
            moment(startCalendar),
            moment(availability.startRange).subtract(1, 'days'),
          )
          .toDate()
      : new Date(moment(availability.startRange).format('YYYY-MM-DD'));

  // For simple recurrence cases until can be endCalendar or av.endRange (little optimization trick)
  const until =
    frequency === 'WEEKLY' && interval === 1
      ? moment
          .min(
            moment(endCalendar),
            moment(availability.endRange).subtract(1, 'day'),
          )
          .toDate()
      : new Date(
          moment(availability.endRange)
            .subtract(1, 'second')
            .format('YYYY-MM-DD'),
        );

  const days = getDays(availability);
  const byweekday = days.map((t) => (t == 0 ? 6 : t - 1));

  let rruleDates = [];
  const rruleObject = {
    interval,
    freq: rule_RRule.RRule[frequency],
    wkst: rule_RRule.RRule.SU,
    byweekday,
    dtstart,
    until,
  };
  if (frequency == 'MONTHLY') {
    const bysetpos = availability.bysetpos ? Number(availability.bysetpos) : 1;
    rruleObject.byweekday.forEach((day) => {
      const rule = new rule_RRule.RRule({
        ...rruleObject,
        byweekday: [day],
        bysetpos,
      });
      rruleDates = [
        ...rruleDates,
        ...rule.between(startCalendar, endCalendar, true),
      ];
    });
  } else {
    const rule = new rule_RRule.RRule(rruleObject);
    rruleDates = rule.between(startCalendar, endCalendar, true);
  }

  rruleDates.forEach((date) => {
    const dd = new Date(date);
    dd.setUTCHours(12, 0, 0, 0);
    const formattedDate = moment(dd).format();

    const _startTime = moment2.tz(availability.startTime, timezone);
    const _endTime = moment2.tz(availability.endTime, timezone);

    let startHere = _startTime
      .set('year', moment(formattedDate).year())
      .set('month', moment(formattedDate).month())
      .set('date', moment(formattedDate).date());

    let endHere = _endTime
      .set('year', moment(formattedDate).year())
      .set('month', moment(formattedDate).month())
      .set('date', moment(formattedDate).date());

    // if the availability is created on DLS using timezone
    // then it must be displayed at same time for whole year
    // but for other non DLS users the displayment should be
    // switched according to the constant displayment for DLS users
    // Example:
    // In Denver show availability at 2PM-4PM whole year
    // In Phoneix show availability :
    //    *) At 2PM-4PM between 4th November - 9th March
    //    *) At 1PM-3PM between 9th March - 4th November
    //       (becuase in this timerange Denver is UTC -6)
    //       (and Phoneix is UCT -7)
    if (!currentTimezoneUsesDLS && availabilityCreatedTZUseDLS) {
      let currentDateInDLS = isDateInDST(dd);
      let availabilityStartDateInDLS = isDateInDST(availability.startTime);
      if (availabilityStartDateInDLS != currentDateInDLS) {
        if (currentDateInDLS) {
          startHere = moment2.tz(startHere, timezone).subtract(1, 'h');
          endHere = moment2.tz(endHere, timezone).subtract(1, 'h');
        } else {
          startHere = moment2.tz(startHere, timezone).add(1, 'h');
          endHere = moment2.tz(endHere, timezone).add(1, 'h');
        }
      }
    }

    // if the availability is created on non-DLS using timezone
    // then it must be displayed at same time for whole year
    // but for other DLS users the displayment should be
    // switched according to the constant displayment for non-DLS users
    // Example:
    // In Phoneix show availability at 2PM-4PM whole year
    // In Denver show availability :
    //    *) At 2PM-4PM between 4th November - 9th March
    //    *) At 3PM-5PM between 9th March - 4th November
    //       (Phoneix in this timerange Denver is UTC -7)
    //       (and Denver is UCT -6)

    if (currentTimezoneUsesDLS && !availabilityCreatedTZUseDLS) {
      let currentDateInDLS = isDateInDST(dd);
      let availabilityStartDateInDLS = isDateInDST(availability.startTime);
      if (availabilityStartDateInDLS != currentDateInDLS) {
        if (currentDateInDLS) {
          startHere = moment2.tz(startHere, timezone).add(1, 'h');
          endHere = moment2.tz(endHere, timezone).add(1, 'h');
        } else {
          startHere = moment2.tz(startHere, timezone).subtract(1, 'h');
          endHere = moment2.tz(endHere, timezone).subtract(1, 'h');
        }
      }
    }

    startHere = startHere.format();
    endHere = endHere.format();

    if (availability.available) {
      resourceAvailabilities[resourceId]['av'].push([
        startHere,
        endHere,
        color,
        locationId,
        availabilityId,
        status,
        onCall,
        onCallBranchId,
        availability.startRange,
        availability.endRange,
        branch,
      ]);
    } else {
      resourceAvailabilities[resourceId]['unav'].push([
        startHere,
        endHere,
        color,
        locationId,
        availabilityId,
        status,
        onCall,
        onCallBranchId,
        availability.startRange,
        availability.endRange,
        branch,
      ]);
    }
  });

  return resourceAvailabilities;
};

module.exports = formatAvailabilityForScheduler;
