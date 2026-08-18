// Packages
const moment = require('moment');
const rule_RRule = require('rrule');
// Utils

const getEventsForDateRange = require('./getEventsForDateRange');
const getUsersAccordingBranchRoleSubgroup = require('./getUsersAccordingBranchRoleSubgroup');
const getAvailabilitiesForDateRange = require('./getAvailabilitiesForDateRange');
const TotaltypesDBApi = require('../../db/api/totaltypes');
const { getDays } = require('../../utils/schedulerUtils')
const isDateInDST = require('../../utils/isDateInDST');


// Configs

const calculateMinutesBetweenTimesIgnoreDates = (end, begin) => {
  const beginTime = moment.utc(begin).format('HH:mm');
  const endTime = moment.utc(end).format('HH:mm');

  let diffInMinutes = moment
    .utc(endTime, 'HH:mm')
    .diff(moment.utc(beginTime, 'HH:mm'), 'minutes');

  //in case the ending and beginning on different dates then the difference will be 1440 minutes less than actual
  if (diffInMinutes < 0) {
    diffInMinutes += 1440;
  }
  return diffInMinutes;
};

function calculateUnionLengthOfIntervals(arr) {
  if (arr.length === 0) {
    return 0;
  }

  arr.sort((a, b) => a[0] - b[0]);

  let result = 0;
  let currentStart = arr[0][0];
  let currentEnd = arr[0][1];
  // Iterate over the pairs and update the current start and end
  // points of the union as needed
  for (let i = 1; i < arr.length; i++) {
    const [start, end] = arr[i];
    if (start > currentEnd) {
      result += currentEnd - currentStart + 1;
      currentStart = start;
      currentEnd = end;
    } else if (end > currentEnd) {
      currentEnd = end;
    }
  }

  // Add the length of the last segment to the result
  result += currentEnd - currentStart + 1;
  return result;
}

function findIntervalsNotInArray2(array1, array2) {
  for (let i = 0; i < array1.length; ) {
    let interval1 = array1[i];
    const start1 = interval1[0];
    const end1 = interval1[1];
    let trimmed = false;
    for (const interval2 of array2) {
      const start2 = interval2[0];
      const end2 = interval2[1];

      if (start1 < end2 && end1 > start2) {
        let partlyTrimmed = false;
        // Check if interval1 starts before interval2
        if (start1 < start2) {
          array1.push([interval1[0], interval2[0] - 1]);
          partlyTrimmed = true;
          trimmed = true;
        }

        // Check if interval1 ends after interval2
        if (end1 > end2) {
          array1.push([interval2[1] + 1, interval1[1]]);
          partlyTrimmed = true;
          trimmed = true;
        }

        if (!partlyTrimmed) {
          trimmed = true;
        }
      }

      if (trimmed) {
        break;
      }
    }

    if (trimmed) {
      array1.splice(i, 1);
    } else {
      i++;
    }
  }

  return array1;
}

const getUserActivityTableDuringDateRange = async (
  startInUTC,
  endInUTC,
  companyID,
  branches,
  subgroups,
  roles,
  users,
  type,
) => {
  let totalMinuteNumber = moment(endInUTC).diff(moment(startInUTC), 'minutes');

  const totalTypes = await TotaltypesDBApi.findAll({
    companyId: companyID,
  });

  let totalTypeActivities = new Array();
  for (let tt = 0; tt < totalTypes.rows.length; tt++) {
    totalTypeActivities.push({
      id: totalTypes.rows[tt].dataValues.id,
      name: totalTypes.rows[tt].dataValues.name,
      activityIds: totalTypes.rows[tt].dataValues.activities.map(
        (activity) => activity.dataValues.id,
      ),
    });
  }

  let columnData = [];
  let userStatsPerActivity = [];

  // Fetch from backend
  const eventListData = await getEventsForDateRange(
    startInUTC,
    endInUTC,
    companyID,
    branches,
    roles,
    subgroups,
    users,
    false,
  );

  let eventsForDateRange = eventListData.data;
  let cancelledEvents = eventListData.cancelledEvents;

  // Fetch from backend
  const usersAfterFilterList = await getUsersAccordingBranchRoleSubgroup(
    companyID,
    branches,
    subgroups,
    roles,
    users,
    false,
    false,
  );

  let usersAfterFilter = usersAfterFilterList.data;
  // Fetch from backend
  const availabilitiesListData = await getAvailabilitiesForDateRange(
    startInUTC,
    endInUTC,
    companyID,
    branches,
    subgroups,
    roles,
    users,
    true,
  );

  let availabilitiesForDateRange = availabilitiesListData.data;

  const activitiesList = await getUsersAccordingBranchRoleSubgroup(
    companyID,
    [],
    [],
    ['Activity'],
    [],
    false,
    false,
  );

  let activities = activitiesList.data;

  // generate activity list for calculating the activity table
  let activityListMap = new Map();
  for (let m = 0; m < activities.count; m++) {
    const color = activities.rows[m]?.color ?? 'black';
    activityListMap.set(activities.rows[m].id, {
      id: activities.rows[m].id,
      name: activities.rows[m].firstName,
      color,
      total: 0,
      disabled: activities.rows[m].disabled,
    });
  }

  //generate user list for calculating the activity table
  let userList = new Map();
  let calculateUserProductivity = new Map();
  for (let m = 0; m < usersAfterFilter.count; m++) {
    userList.set(usersAfterFilter.rows[m].id, {
      firstName: usersAfterFilter.rows[m].firstName,
      lastName: usersAfterFilter.rows[m].lastName,
      email: usersAfterFilter.rows[m].email,
      total: 0,
      totalPerActivity: new Map(),
      totalPerTotalType: new Map(),
      availableLine: Array(),
      notavailableLine: Array(),
      busyLine: Array(),
      billableLine: Array(),
      nonBillableLine: Array(),
      productiveLine: Array(),
      shouldBeBusyProductivLine: Array(),
      eventNumber: 0,
      cancelNumber: 0,
      mustCalculatedSupervisionDuration: 0,
      supervisedDuration: 0,
    });

    let currentUser = userList.get(usersAfterFilter.rows[m].id);
    for (let m = 0; m < activities.count; m++) {
      currentUser.totalPerActivity.set(activities.rows[m].id, {
        total: 0,
        eventLine: new Array(),
      });
    }

    for (let s = 0; s < totalTypeActivities.length; s++) {
      currentUser.totalPerTotalType.set(totalTypeActivities[s].id, {
        total: 0,
        name: totalTypeActivities[s].name,
        eventLine: new Array(),
      });
    }

    let calculateCurrentUserProductivity = false;
    for (let p = 0; p < usersAfterFilter.rows[m].roles.length; p++) {
      if (usersAfterFilter.rows[m].roles[p].productivityInclude) {
        calculateCurrentUserProductivity = true;
        break;
      }
    }

    calculateUserProductivity.set(
      usersAfterFilter.rows[m].id,
      calculateCurrentUserProductivity,
    );
  }

  let eventDurationMap = new Map();
  for (let p = 0; p < eventsForDateRange.count; p++) {
    let duration = calculateMinutesBetweenTimesIgnoreDates(
      eventsForDateRange.rows[p].end,
      eventsForDateRange.rows[p].start,
    );
    eventDurationMap.set(eventsForDateRange.rows[p].id, duration);
  }

  // loop through events for calculating the info
  for (let i = 0; i < eventsForDateRange.count; i++) {
    let event = eventsForDateRange.rows[i];

    // generate the rule of event
    const startRule = moment
      .utc(
        event.startRecur + ' ' + moment.utc(event.start).format('HH:mm'),
        'YYYY-MM-DD HH:mm',
      )
      .format();
    const endRule = moment.utc(event.endRecur).format('YYYY-MM-DD');
    let weekDaysOfEvent = [];

    if (event.M) {
      weekDaysOfEvent.push(0);
    }
    if (event.T) {
      weekDaysOfEvent.push(1);
    }
    if (event.W) {
      weekDaysOfEvent.push(2);
    }
    if (event.R) {
      weekDaysOfEvent.push(3);
    }
    if (event.F) {
      weekDaysOfEvent.push(4);
    }
    if (event.S) {
      weekDaysOfEvent.push(5);
    }
    if (event.U) {
      weekDaysOfEvent.push(6);
    }

    if (weekDaysOfEvent.length === 0) {
      continue;
    }

    const fr = event?.frequency?.toUpperCase() ?? 'WEEKLY';
    let rruleObject = {
      freq: rule_RRule.RRule[fr],
      interval: event.interval,
      byweekday: weekDaysOfEvent,
      dtstart: new Date(startRule),
      until: new Date(endRule),
    };

    if (event.bysetpos !== null) {
      rruleObject = {
        ...rruleObject,
        bysetpos: Number(event.bysetpos),
      };
    }

    let rule = new rule_RRule.RRule(rruleObject);

    // get all recurring events
    let allEventsWithRule = rule.all();
    let supervisedDurationOfEvent = 0;
    let mustSupervisedEvent = false;
    if (event.supervisionId && eventDurationMap.has(event.supervisionId)) {
      supervisedDurationOfEvent = eventDurationMap.get(event.supervisionId);
    }

    if (event.activity0.supervisionRateInclude) {
      mustSupervisedEvent = true;
    }

    for (let p = 0; p < allEventsWithRule.length; p++) {
      let duration = calculateMinutesBetweenTimesIgnoreDates(
        event.end,
        event.start,
      );

      let isTheEndingInside = false;
      let isTheBeginningInside = false;
      let isItValidEvent = false;
      //check if the event lies in our range
      let s;
      let e;
      s = allEventsWithRule[p];
      e = moment.utc(allEventsWithRule[p]).add(duration, 'minutes').toDate();

      let eventCreatedDate = moment.utc(event.start).startOf('day').toDate();

      let createdInDaylightSaving = isDateInDST(moment.utc(eventCreatedDate).toDate());
      let currentDateInDaylightSaving = isDateInDST(moment.utc(s).toDate());

      if (currentDateInDaylightSaving !== createdInDaylightSaving) {
        if (currentDateInDaylightSaving) {
          s = moment.utc(s).add(-1, 'hours').toDate();
          e = moment.utc(e).add(-1, 'hours').toDate();
        } else {
          s = moment.utc(s).add(1, 'hours').toDate();
          e = moment.utc(e).add(1, 'hours').toDate();
        }
      }

      if (s >= startInUTC && s < endInUTC) {
        isItValidEvent = true;
        isTheBeginningInside = true;
        if (e <= endInUTC) {
          isTheEndingInside = true;
        } else {
          duration = moment.utc(endInUTC).diff(moment.utc(s), 'minutes');
        }
      }

      if (e > startInUTC && e <= endInUTC && !isTheBeginningInside) {
        isTheEndingInside = true;
        isItValidEvent = true;
        duration = moment.utc(e).diff(moment.utc(startInUTC), 'minutes');
      }

      //if it lies increase our i
      if (isItValidEvent) {
        // increase the total duration of user and per activity
        for (let i = 0; i < event.users.length; i++) {
          let userInfo = userList.get(event.users[i].id);
          let userDurationPerActivity = userInfo.totalPerActivity.get(
            event.activity0.id,
          );
          let activityInfoFromMap = activityListMap.get(event.activity0.id);

          userInfo.eventNumber++;
          activityInfoFromMap.total += duration;
          userInfo.supervisedDuration += supervisedDurationOfEvent;
          if (!isTheBeginningInside) {
            userInfo.busyLine.push([1, duration]);
            userDurationPerActivity.eventLine.push([1, duration]);

            // add productivity numerator
            if (event.activity0.productivityInclude) {
              userInfo.productiveLine.push([1, duration]);
            }

            // add productivity denominator
            if (!event.activity0.productivityExclude) {
              userInfo.shouldBeBusyProductivLine.push([1, duration]);
            }

            // collect billable vs non billable hours
            if (event.activity0.billable) {
              userInfo.billableLine.push([1, duration]);
            } else {
              userInfo.nonBillableLine.push([1, duration]);
            }

            continue;
          }

          if (!isTheEndingInside) {
            userInfo.busyLine.push([
              totalMinuteNumber + 1 - duration,
              totalMinuteNumber,
            ]);
            userDurationPerActivity.eventLine.push([
              totalMinuteNumber + 1 - duration,
              totalMinuteNumber,
            ]);

            // add productivity numerator
            if (event.activity0.productivityInclude) {
              userInfo.productiveLine.push([
                totalMinuteNumber + 1 - duration,
                totalMinuteNumber,
              ]);
            }

            // add productivity denominator
            if (!event.activity0.productivityExclude) {
              userInfo.shouldBeBusyProductivLine.push([
                totalMinuteNumber + 1 - duration,
                totalMinuteNumber,
              ]);
            }

            // collect billable vs non billable hours
            if (event.activity0.billable) {
              userInfo.billableLine.push([
                totalMinuteNumber + 1 - duration,
                totalMinuteNumber,
              ]);
            } else {
              userInfo.nonBillableLine.push([
                totalMinuteNumber + 1 - duration,
                totalMinuteNumber,
              ]);
            }
            continue;
          }

          if (mustSupervisedEvent) {
            userInfo.mustCalculatedSupervisionDuration += duration;
          }

          // if fully inside
          let distanceOfStartingWithBeginning = moment
            .utc(s)
            .diff(moment.utc(startInUTC), 'minutes');

          userInfo.busyLine.push([
            distanceOfStartingWithBeginning + 1,
            distanceOfStartingWithBeginning + duration,
          ]);

          userDurationPerActivity.eventLine.push([
            distanceOfStartingWithBeginning + 1,
            distanceOfStartingWithBeginning + duration,
          ]);

          // add productivity numerator
          if (event.activity0.productivityInclude) {
            userInfo.productiveLine.push([
              distanceOfStartingWithBeginning + 1,
              distanceOfStartingWithBeginning + duration,
            ]);
          }

          // add productivity denominator
          if (!event.activity0.productivityExclude) {
            userInfo.shouldBeBusyProductivLine.push([
              distanceOfStartingWithBeginning + 1,
              distanceOfStartingWithBeginning + duration,
            ]);
          }

          // collect billable vs non billable hours
          if (event.activity0.billable) {
            userInfo.billableLine.push([
              distanceOfStartingWithBeginning + 1,
              distanceOfStartingWithBeginning + duration,
            ]);
          } else {
            userInfo.nonBillableLine.push([
              distanceOfStartingWithBeginning + 1,
              distanceOfStartingWithBeginning + duration,
            ]);
          }
        }
      }
    }
  }

  // loop through events for cancellation statistics
  for (let i = 0; i < cancelledEvents.count; i++) {
    let event = cancelledEvents.rows[i];

    // generate the rule of event
    const startRule = moment
      .utc(
        event.startRecur + ' ' + moment.utc(event.start).format('HH:mm'),
        'YYYY-MM-DD HH:mm',
      )
      .format();
    const endRule = moment.utc(event.endRecur).format('YYYY-MM-DD');
    let weekDaysOfEvent = [];

    if (event.M) {
      weekDaysOfEvent.push(0);
    }
    if (event.T) {
      weekDaysOfEvent.push(1);
    }
    if (event.W) {
      weekDaysOfEvent.push(2);
    }
    if (event.R) {
      weekDaysOfEvent.push(3);
    }
    if (event.F) {
      weekDaysOfEvent.push(4);
    }
    if (event.S) {
      weekDaysOfEvent.push(5);
    }
    if (event.U) {
      weekDaysOfEvent.push(6);
    }

    if (weekDaysOfEvent.length === 0) {
      continue;
    }

    const fr = event?.frequency?.toUpperCase() ?? 'WEEKLY';
    let rruleObject = {
      freq: rule_RRule.RRule[fr],
      interval: event.interval,
      byweekday: weekDaysOfEvent,
      dtstart: new Date(startRule),
      until: new Date(endRule),
    };

    if (event.bysetpos !== null) {
      rruleObject = {
        ...rruleObject,
        bysetpos: Number(event.bysetpos),
      };
    }

    let rule = new rule_RRule.RRule(rruleObject);

    // get all recurring events
    let allEventsWithRule = rule.all();

    for (let p = 0; p < allEventsWithRule.length; p++) {
      let duration = calculateMinutesBetweenTimesIgnoreDates(
        event.end,
        event.start,
      );

      let isItValidEvent = false;
      //check if the event lies in our range
      let s;
      let e;
      s = allEventsWithRule[p];
      e = moment.utc(allEventsWithRule[p]).add(duration, 'minutes').toDate();

      if (s < endInUTC && e > startInUTC) {
        isItValidEvent = true;
      }

      //if it lies increase our i
      if (isItValidEvent) {
        for (let i = 0; i < event.users.length; i++) {
          let userInfo = userList.get(event.users[i].id);
          userInfo.eventNumber++;
        }
        if (userList.has(event.cancellerId)) {
          let u = userList.get(event.cancellerId);
          u.cancelNumber++;
        }
      }
    }
  }

  //loop thotigh availabilities for calculating the efficieny
  for (let j = 0; j < availabilitiesForDateRange.count; j++) {
    let availability = availabilitiesForDateRange.rows[j];
    // generate the rule of event
    const startRule = moment
      .utc(
        availability.startRange +
          ' ' +
          moment.utc(availability.startTime).format('HH:mm'),
        'YYYY-MM-DD HH:mm',
      )
      .toDate();
    const endRule = new Date(
      moment.utc(availability.endRange).format('YYYY-MM-DD'),
    );

    let start = new Date(startRule);
    let end = new Date(endRule);

    // if the range is so big trim it for 2 weeks (atmost)
    const oneWeekBefore = moment
      .utc(
        startInUTC.toISOString().split('T')[0] +
          ' ' +
          moment.utc(availability.startTime).format('HH:mm'),
        'YYYY-MM-DD HH:mm',
      )
      .add(-7, 'days')
      .toDate();
    const oneWeekLater = moment
      .utc(endInUTC.toISOString().split('T')[0], 'YYYY-MM-DD')
      .add(7, 'days')
      .toDate();

    if (start < oneWeekBefore) {
      start = oneWeekBefore;
    }

    if (end > oneWeekLater) {
      end = oneWeekLater;
    }

    // set the weekdays of rule
    const weekDaysOfAvailability = getDays(availability).map((d) =>
      d == 0 ? 6 : d - 1,
    );
    const interval = availability?.interval || 1;
    const freq = availability?.frequency?.toUpperCase() ?? 'WEEKLY'

    // For simple recurrence cases dtstart can be startCalendar or av.startRange (little optimization trick)
    const dtstart =
      freq === 'WEEKLY' && interval === 1
        ? moment.max(moment(start), moment(startRule)).toDate()
        : startRule;

    // For simple recurrence cases until can be endCalendar or av.endRange (little optimization trick)
    const until =
      freq === 'WEEKLY' && interval === 1
        ? moment.min(moment(end), moment(endRule)).toDate()
        : endRule;
    
    // get all recurring availablities
    let allAvailabilitiesWithRule = [];
    const rruleObject = {
      interval,
      freq: rule_RRule.RRule[freq],
      wkst: rule_RRule.RRule.SU,
      byweekday: weekDaysOfAvailability,
      dtstart,
      until,
    };
    if (freq == 'MONTHLY') {
      const bysetpos = availability.bysetpos
        ? Number(availability.bysetpos)
        : 1;
      rruleObject.byweekday.forEach((day) => {
        const rule = new rule_RRule.RRule({
          ...rruleObject,
          byweekday: [day],
          bysetpos,
        });
        allAvailabilitiesWithRule = [
          ...allAvailabilitiesWithRule,
          ...rule.between(start, end, true),
        ];
      });
    } else {
      const rule = new rule_RRule.RRule(rruleObject);
      allAvailabilitiesWithRule = rule.between(start, end, true);
    }

    for (let p = 0; p < allAvailabilitiesWithRule.length; p++) {
      let duration = calculateMinutesBetweenTimesIgnoreDates(
        availability.endTime,
        availability.startTime,
      );

      let isItValidAvailability = false;
      let isTheEndingInside = false;
      let isTheBeginningInside = false;
      //check if the event lies in our range
      let s;
      let e;
      s = allAvailabilitiesWithRule[p];
      e = moment
        .utc(allAvailabilitiesWithRule[p])
        .add(duration, 'minutes')
        .toDate();

      let availabilityCreatedDate = moment
        .utc(availability.startTime)
        .startOf('day')
        .toDate();

      let createdInDaylightSaving = moment(availabilityCreatedDate).isDST();
      let currentDateInDaylightSaving = moment(s).isDST();

      if (currentDateInDaylightSaving !== createdInDaylightSaving) {
        if (currentDateInDaylightSaving) {
          s = moment.utc(s).add(-1, 'hours').toDate();
          e = moment.utc(e).add(-1, 'hours').toDate();
        } else {
          s = moment.utc(s).add(1, 'hours').toDate();
          e = moment.utc(e).add(1, 'hours').toDate();
        }
      }

      if (s >= startInUTC && s < endInUTC) {
        isItValidAvailability = true;
        isTheBeginningInside = true;
        if (e <= endInUTC) {
          isTheEndingInside = true;
        } else {
          duration = moment.utc(endInUTC).diff(moment.utc(s), 'minutes');
        }
      }

      if (e > startInUTC && e <= endInUTC && !isTheBeginningInside) {
        isTheEndingInside = true;
        isItValidAvailability = true;
        duration = moment.utc(e).diff(moment.utc(startInUTC), 'minutes');
      }

      //if it lies increase our i
      if (isItValidAvailability) {
        let userInfo = userList.get(availability.user.id);
        // if the only ending in range
        if (!isTheBeginningInside) {
          //fill the user available duration
          if (availability.available) {
            userInfo.availableLine.push([1, duration]);
          } else {
            userInfo.notavailableLine.push([1, duration]);
          }
          continue;
        }

        // if the only beginning in range
        if (!isTheEndingInside) {
          //fill the user available duration
          if (availability.available) {
            userInfo.availableLine.push([
              totalMinuteNumber + 1 - duration,
              totalMinuteNumber,
            ]);
          } else {
            userInfo.notavailableLine.push([
              totalMinuteNumber + 1 - duration,
              totalMinuteNumber,
            ]);
          }
        }

        // if fully inside
        let distanceOfStartingWithBeginning = moment
          .utc(s)
          .diff(moment.utc(startInUTC), 'minutes');
        if (availability.available) {
          userInfo.availableLine.push([
            distanceOfStartingWithBeginning + 1,
            distanceOfStartingWithBeginning + duration,
          ]);
        } else {
          userInfo.notavailableLine.push([
            distanceOfStartingWithBeginning + 1,
            distanceOfStartingWithBeginning + duration,
          ]);
        }
      }
    }
  }

  //format the userInfo
  for (let [id, u] of userList) {
    //calculate the effciency
    let totalAvailableTime = calculateUnionLengthOfIntervals(
      findIntervalsNotInArray2(u.availableLine, u.notavailableLine),
    );
    let totalActiveTime = calculateUnionLengthOfIntervals(u.busyLine);
    let totalBillableTime = calculateUnionLengthOfIntervals(u.billableLine);
    let totalNonBillableTime = calculateUnionLengthOfIntervals(
      u.nonBillableLine,
    );
    let totalProductiveTime = calculateUnionLengthOfIntervals(u.productiveLine);
    let totalShouldBeProductiveTime = calculateUnionLengthOfIntervals(
      u.shouldBeBusyProductivLine,
    );

    let eff = 0;
    let prd = 0;
    let cancelRate = 0;
    let supervisionRate = 0;
    let totalBillable = 0;
    let totalNonBillable = 0;
    if (totalActiveTime > 0) {
      u.total = Number((totalActiveTime / 60).toFixed(2));
      if (totalAvailableTime > 0) {
        //set efficiency level
        eff = Number(((totalActiveTime / totalAvailableTime) * 100).toFixed(2));
        if (eff > 100) {
          eff = 100;
        }
      } else {
        eff = 100;
      }
    }

    if (totalShouldBeProductiveTime > 0) {
      //set productivity level
      prd = Number(
        ((totalProductiveTime / totalShouldBeProductiveTime) * 100).toFixed(2),
      );
    }

    //set prd = 0 if that users is not going to be productivity calculated
    if (!calculateUserProductivity.get(id)) {
      prd = 0;
    }

    if (u.cancelNumber > 0) {
      cancelRate = Number(((u.cancelNumber / u.eventNumber) * 100).toFixed(2));
    }

    if (u.mustCalculatedSupervisionDuration > 0) {
      supervisionRate = Number(
        (
          (u.supervisedDuration / u.mustCalculatedSupervisionDuration) *
          100
        ).toFixed(2),
      );
    }

    //convert the minutes to hours on each actiity and user and in total
    for (let [_, actTotal] of u.totalPerActivity) {
      let currentActivityTotalTime = calculateUnionLengthOfIntervals(
        actTotal.eventLine,
      );
      actTotal.total = currentActivityTotalTime;
      if (actTotal.total > 0) {
        actTotal.total = Number((actTotal.total / 60).toFixed(2));
      }
    }

    // fill the totalPerTotaltypeOfEachUser
    for (let [id, actTotal] of u.totalPerActivity) {
      for (let h = 0; h < totalTypeActivities.length; h++) {
        if (totalTypeActivities[h].activityIds.includes(id)) {
          let tt = u.totalPerTotalType.get(totalTypeActivities[h].id);
          tt.eventLine.push(...actTotal.eventLine);
        }
      }
    }

    //convert the minutes to hours on each totalType of user
    for (let [_, totalTypeTotal] of u.totalPerTotalType) {
      let currentTotalTypeTotalTime = calculateUnionLengthOfIntervals(
        totalTypeTotal.eventLine,
      );
      totalTypeTotal.total = currentTotalTypeTotalTime;
      if (totalTypeTotal.total > 0) {
        totalTypeTotal.total = Number((totalTypeTotal.total / 60).toFixed(2));
      }
    }

    // set total billable / non-billable duration
    if (totalBillableTime > 0) {
      totalBillable = Number((totalBillableTime / 60).toFixed(2));
    }

    if (totalNonBillableTime > 0) {
      totalNonBillable = Number((totalNonBillableTime / 60).toFixed(2));
    }

    let userData = {
      user: {
        id: id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
      },
      total: u.total,
      efficiency: eff,
      productivity: prd,
      totalBillable: totalBillable,
      totalNonBillable: totalNonBillable,
      cancellationRate: cancelRate,
      supervisionRate: supervisionRate,
    };
    const obj = Object.fromEntries(u.totalPerActivity);
    userData = {
      ...userData,
      ...obj,
    };

    const obj2 = Object.fromEntries(u.totalPerTotalType);
    userData = {
      ...userData,
      ...obj2,
    };

    // console.log(obj2)

    userStatsPerActivity.push(userData);
  }
  //format the columnData
  for (let [_, act] of activityListMap) {
    if (!act.disabled || act.total > 0) {
      columnData.push({
        id: act.id,
        name: act.name,
        color: act.color,
        total: act.total,
      });
    }
  }

  /* Basically before implementing totalTypes to statistics
     tables, there were 2 types of columns :
     1. Static columns like efficiency, productivity, ..
     2. Dynamic columns (any activity)
     But now the totalTypes are also in dynamic category.
     So I add them to columnData and I add the total of 
     each totalType with key=<totalTypeId> and value={total: ...}
     uuids matching is almost impossible so do not worry about coinciding
     some activityId with totalTypeId

     I set total=10000000 for just making this columns displayed at the beginning of activity columns.
     it doesn't matter the total of them on columns, frontend just 
     checks if it is zero or not, if it is frontend just doesn't display it */
  for (let g = 0; g < totalTypeActivities.length; g++) {
    columnData.push({
      id: totalTypeActivities[g].id,
      name: totalTypeActivities[g].name,
      color: 'black',
      total: 10000000,
    });
  }

  columnData.sort((a, b) => b.total - a.total);

  return {
    columnData,
    userStatsPerActivity,
  };
};

module.exports = getUserActivityTableDuringDateRange;
