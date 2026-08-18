// Packages
const express = require('express');
const moment = require('moment');
const rule_RRule = require('rrule');

// Utils
const getRoleHierarchy = require('../utils/statistcs/getRoleHierarchy');
const getDescendentBranches = require('../utils/statistcs/getBranchHierarchy');
const getEventsForDay = require('../utils/statistcs/getEventsForDay');
const getEventsForDateRange = require('../utils/statistcs/getEventsForDateRange');
const getEventsForWeek = require('../utils/statistcs/getEventsForWeek');
const getEmployeeClientNumber = require('../utils/statistcs/getEmployeeClientNumber');
const getUsersAccordingBranchRoleSubgroup = require('../utils/statistcs/getUsersAccordingBranchRoleSubgroup');
const getAvailabilitiesForDateRange = require('../utils/statistcs/getAvailabilitiesForDateRange');

const getAvailabilitiesForWeek = require('../utils/statistcs/getAvailabilitiesForWeek');
const NewconstraintgeneratorDBApi = require('../db/api/newconstraintgenerator');
const TotaltypesDBApi = require('../db/api/totaltypes');
const { getDays } = require('../utils/schedulerUtils')

const EventsDBApi = require('../db/api/events');

// Constants
const weekdayOptions = require('../constants/weekdayOptions');
const { timesArray, timesArray15minSlots } = require('../constants/timesArray');

// Configs
const BranchesDBApi = require('../db/api/branches');
const WEEKLY_DATE_RANGE_FORMAT = 'ddd, MM.DD';
const router = require('../utils/createRouter')();

/* Utils */

function getStartOfWeekOfDate(date) {
  let calledDate = moment.utc(date).toDate();

  let weekDayOfDate = calledDate.getDay();
  let addDayForReachingTheStart = 1 - weekDayOfDate;

  if (addDayForReachingTheStart > 0) {
    addDayForReachingTheStart -= 7;
  }

  // get the called date's week start date
  startOfWeek = moment
    .utc(date)
    .add(addDayForReachingTheStart, 'days')
    .toDate();

  return startOfWeek;
}

const calculateMinutesBetweenTimesIgnoreDates = (end, begin) => {
  // Extract HH:mm from the input times
  const beginTime = new Date(begin).toISOString().slice(11, 16);
  const endTime = new Date(end).toISOString().slice(11, 16);

  // Parse the times into hours and minutes
  const [beginHours, beginMinutes] = beginTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);

  // Convert times into minutes since start of the day
  const beginTotalMinutes = beginHours * 60 + beginMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  // Calculate the difference in minutes
  let diffInMinutes = endTotalMinutes - beginTotalMinutes;

  // Adjust for crossing midnight
  if (diffInMinutes < 0) {
    diffInMinutes += 1440; // Add a full day's worth of minutes
  }

  return diffInMinutes;
};

const getPositiveModulo = (dividend, divisor) => {
  return ((dividend % divisor) + divisor) % divisor;
};
function checkIntersection(arr1, arr2) {
  return arr1.some((item) => arr2.includes(item));
}
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

/* Actions */

async function getWeeksStatsForDashboard(
  startOfWeekInUTC,
  endOfWeekInUTC,
  companyID,
  branches,
  subgroups,
  roles,
  subgroupID,
) {
  let appointmentsCount = {
    series: [0, 0, 0, 0, 0, 0, 0],
    dates: [],
  };

  let activitiesDurations = {
    series: [],
    dates: [],
    colors: [],
  };

  let efficiency = {
    series: {
      productivity: {
        name: 'Productivity',
        data: [0, 0, 0, 0, 0, 0, 0],
      },
      efficiency: {
        name: 'Efficiency',
        data: [0, 0, 0, 0, 0, 0, 0],
      },
    },
    dates: [],
  };
  let capacity = {
    series: [],
    colors: [],
  };

  // if the startWeek and endWeek differs exactly 7 days then calculate the dashboard for a week
  if (
    moment(endOfWeekInUTC).diff(moment(startOfWeekInUTC), 'minutes') === 10080
  ) {
    // Fetch from backend
    const eventsOfWeekListData = await getEventsForWeek(
      startOfWeekInUTC,
      endOfWeekInUTC,
      companyID,
      branches,
      roles,
      subgroups,
    );

    let eventsOfWeek = eventsOfWeekListData.data;

    const availabilitiesForWeekList = await getAvailabilitiesForWeek(
      startOfWeekInUTC,
      endOfWeekInUTC,
      companyID,
      branches,
      subgroups,
      roles,
      [],
      true,
    );

    let availabilitiesForWeek = availabilitiesForWeekList.data;

    let locationCapacityList = new Map();

    let EventDurationPerActivityInWeek = new Map();

    const users = await getUsersAccordingBranchRoleSubgroup(
      companyID,
      branches,
      subgroups,
      roles,
      [],
      false,
    );
    //generate user list for calculating the efficiency
    let userListEfficciencyProductivity = new Map();
    let calculateUserProductivity = new Map();

    // I put shouldBeBusyProductivLine for calculating
    // denominator of productivity formula
    for (let m = 0; m < users.data.count; m++) {
      const weeklyData = new Array(7);
      for (let i = 0; i < 7; i++) {
        weeklyData[i] = {
          availableLine: [],
          notavailableLine: [],
          productiveLine: [],
          shouldBeBusyProductivLine: [],
          busyLine: [],
        };
      }

      let calculateCurrentUserProductivity = false;
      for (let p = 0; p < users.data.rows[m].roles.length; p++) {
        if (users.data.rows[m].roles[p].productivityInclude) {
          calculateCurrentUserProductivity = true;
          break;
        }
      }
      userListEfficciencyProductivity.set(users.data.rows[m].id, weeklyData);
      calculateUserProductivity.set(
        users.data.rows[m].id,
        calculateCurrentUserProductivity,
      );
    }

    //loop through events
    for (let j = 0; j < eventsOfWeek.count; j++) {
      let event = eventsOfWeek.rows[j];

      // generate the rule of event
      const startRuleAccordingEvent = moment
        .utc(
          event.startRecur + ' ' + moment.utc(event.start).format('HH:mm'),
          'YYYY-MM-DD HH:mm',
        )
        .toDate();
      const endRuleAccordingEvent = moment.utc(event.endRecur).toDate();

      let weekDaysOfEvent = [];
      // set the weekdays of rule

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

      let startRule = startRuleAccordingEvent;
      let endRule = endRuleAccordingEvent;

      const fr = event?.frequency?.toUpperCase() ?? 'WEEKLY';
      let rruleObject = {
        freq: rule_RRule.RRule[fr],
        interval: event.interval,
        byweekday: weekDaysOfEvent,
        dtstart: startRule,
        until: endRule,
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

        let copyDuration = calculateMinutesBetweenTimesIgnoreDates(
          event.end,
          event.start,
        );

        let copyDurationForEfficiency = calculateMinutesBetweenTimesIgnoreDates(
          event.end,
          event.start,
        );
        let isTheEndingInside = false;
        let isTheBeginningInside = false;
        //check if the event lies in our range
        let s = allEventsWithRule[p];
        let e = moment
          .utc(allEventsWithRule[p])
          .add(duration, 'minutes')
          .toDate();

        let eventCreatedDate = moment.utc(event.start).startOf('day').toDate();

        let createdInDaylightSaving = moment(eventCreatedDate).isDST();
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

        if (s >= startOfWeekInUTC && s < endOfWeekInUTC) {
          isTheBeginningInside = true;
          if (e <= endOfWeekInUTC) {
            isTheEndingInside = true;
          } else {
            duration = moment
              .utc(endOfWeekInUTC)
              .diff(moment.utc(s), 'minutes');
            copyDuration = moment
              .utc(endOfWeekInUTC)
              .diff(moment.utc(s), 'minutes');
            copyDurationForEfficiency = moment
              .utc(endOfWeekInUTC)
              .diff(moment.utc(s), 'minutes');
          }
        }

        if (!isTheBeginningInside) {
          if (e > startOfWeekInUTC && e <= endOfWeekInUTC) {
            isTheEndingInside = true;
            duration = moment
              .utc(e)
              .diff(moment.utc(startOfWeekInUTC), 'minutes');
            copyDuration = moment
              .utc(e)
              .diff(moment.utc(startOfWeekInUTC), 'minutes');
            copyDurationForEfficiency = moment
              .utc(e)
              .diff(moment.utc(startOfWeekInUTC), 'minutes');
          }
        }

        //if it lies increase our i
        if (isTheBeginningInside || isTheEndingInside) {
          // increase the duration per activity per day
          if (!EventDurationPerActivityInWeek.has(event.activity0.id)) {
            const color =
              event.activity0?.color ?? 'black';
            let activity = {
              name: event.activity0.firstName,
              color,
              data: Array(7).fill(0),
            };

            EventDurationPerActivityInWeek.set(event.activity0.id, activity);
          }

          let activityInfo = EventDurationPerActivityInWeek.get(
            event.activity0.id,
          );

          if (
            event.location0 &&
            !locationCapacityList.has(event.location0.id)
          ) {
            const color =
              event.location0?.color ?? 'black';
            let location = {
              name: event.location0.firstName,
              color,
              data: Array(672).fill(0),
            };

            locationCapacityList.set(event.location0.id, location);
          }

          let locationInfo;
          if (event.location0) {
            locationInfo = locationCapacityList.get(event.location0.id);
          }

          const userNumberOfEvent = event.users.length;

          // if the only ending in range
          if (!isTheBeginningInside) {
            //increase the appointment number and duration
            for (let k = 0; k < 7; k++) {
              if (duration > 1440) {
                activityInfo.data[k] += 1440;
                appointmentsCount.series[k]++;
                duration -= 1440;
                continue;
              }

              if (duration > 0) {
                activityInfo.data[k] += duration;
                appointmentsCount.series[k]++;
              }
              break;
            }

            // increase the capacity of location
            if (event.location0) {
              for (let k = 0; k < 672; k++) {
                if (copyDuration > 15) {
                  locationInfo.data[k] += userNumberOfEvent;
                  copyDuration -= 15;
                  continue;
                }
                if (copyDuration > 0) {
                  locationInfo.data[k] += userNumberOfEvent;
                  copyDuration = 0;
                }
                break;
              }
            }

            // increase the busyline of user
            for (let j = 0; j < userNumberOfEvent; j++) {
              // it can be possible if one of the user is disabled inside of events
              if (!userListEfficciencyProductivity.has(event.users[j].id)) {
                continue;
              }
              let userInfo = userListEfficciencyProductivity.get(
                event.users[j].id,
              );
              userInfo[0].busyLine.push([1, copyDurationForEfficiency]);

              // increase productivity per user
              if (event.activity0.productivityInclude) {
                userInfo[0].productiveLine.push([1, copyDurationForEfficiency]);
              }

              // increase shouldbeproductivebusy per user
              if (!event.activity0.productivityExclude) {
                userInfo[0].shouldBeBusyProductivLine.push([
                  1,
                  copyDurationForEfficiency,
                ]);
              }
            }
            continue;
          }

          // if the only beginning in range
          if (!isTheEndingInside) {
            for (let k = 6; k > -1; k--) {
              if (duration > 1440) {
                activityInfo.data[k] += 1440;
                appointmentsCount.series[k]++;

                duration -= 1440;
                continue;
              }

              if (duration > 0) {
                activityInfo.data[k] += duration;
                appointmentsCount.series[k]++;
              }
              break;
            }

            // increase the capacity of location
            if (event.location0) {
              for (let k = 671; k > -1; k--) {
                if (copyDuration > 15) {
                  locationInfo.data[k] += userNumberOfEvent;
                  copyDuration -= 15;
                  continue;
                }
                if (copyDuration > 0) {
                  locationInfo.data[k] += userNumberOfEvent;
                  copyDuration = 0;
                }
                break;
              }
            }

            // increase the busyline of user
            for (let j = 0; j < userNumberOfEvent; j++) {
              // it can be possible if one of the user is disabled inside of events
              if (!userListEfficciencyProductivity.has(event.users[j].id)) {
                continue;
              }
              let userInfo = userListEfficciencyProductivity.get(
                event.users[j].id,
              );
              userInfo[6].busyLine.push([
                1441 - copyDurationForEfficiency,
                1440,
              ]);
              // increase productivity per user
              if (event.activity0.productivityInclude) {
                userInfo[6].productiveLine.push([
                  1441 - copyDurationForEfficiency,
                  1440,
                ]);
              }

              // increase shouldbeproductivebusy per user
              if (!event.activity0.productivityExclude) {
                userInfo[6].shouldBeBusyProductivLine.push([
                  1441 - copyDurationForEfficiency,
                  1440,
                ]);
              }
            }
            continue;
          }

          // if fully inside
          let distanceOfStartingWithBeginning = moment
            .utc(s)
            .diff(moment.utc(startOfWeekInUTC), 'minutes');

          //location capacity
          if (event.location0) {
            let index = Math.floor(distanceOfStartingWithBeginning / 15);
            let firstPart = getPositiveModulo(
              -distanceOfStartingWithBeginning,
              15,
            );

            if (copyDuration <= firstPart) {
              locationInfo.data[index] += userNumberOfEvent;
            } else {
              if (firstPart > 0) {
                locationInfo.data[index] += userNumberOfEvent;
                copyDuration -= firstPart;
                index++;
              }

              for (let k = index; k < 672; k++) {
                if (copyDuration > 15) {
                  locationInfo.data[k] += userNumberOfEvent;
                  copyDuration -= 15;
                  continue;
                }

                if (copyDuration > 0) {
                  locationInfo.data[k] += userNumberOfEvent;
                }
                break;
              }
            }
          }

          let index = Math.floor(distanceOfStartingWithBeginning / 1440);
          let firstPart = getPositiveModulo(
            -distanceOfStartingWithBeginning,
            1440,
          );

          let beginningPointInsideOfDay = getPositiveModulo(
            distanceOfStartingWithBeginning,
            1440,
          );

          // increase the busyline of users
          for (let j = 0; j < userNumberOfEvent; j++) {
            // it can be possible if one of the user is disabled inside of events
            if (!userListEfficciencyProductivity.has(event.users[j].id)) {
              continue;
            }

            let userInfo = userListEfficciencyProductivity.get(
              event.users[j].id,
            );
            if (copyDurationForEfficiency <= firstPart) {
              userInfo[index].busyLine.push([
                beginningPointInsideOfDay + 1,
                beginningPointInsideOfDay + copyDurationForEfficiency,
              ]);

              // increase productivityline of user
              if (event.activity0.productivityInclude) {
                userInfo[index].productiveLine.push([
                  beginningPointInsideOfDay + 1,
                  beginningPointInsideOfDay + copyDurationForEfficiency,
                ]);
              }

              // increase shouldbeproductivebusy per user
              if (!event.activity0.productivityExclude) {
                userInfo[index].shouldBeBusyProductivLine.push([
                  beginningPointInsideOfDay + 1,
                  beginningPointInsideOfDay + copyDurationForEfficiency,
                ]);
              }
              continue;
            }

            if (firstPart === 0) {
              userInfo[index].busyLine.push([1, copyDurationForEfficiency]);
              continue;
            }

            if (firstPart > 0) {
              userInfo[index].busyLine.push([
                beginningPointInsideOfDay + 1,
                1440,
              ]);
              userInfo[index + 1].busyLine.push([
                1,
                copyDurationForEfficiency - 1440 + beginningPointInsideOfDay,
              ]);

              // increase productivityline of user
              if (event.activity0.productivityInclude) {
                userInfo[index].productiveLine.push([
                  beginningPointInsideOfDay + 1,
                  1440,
                ]);
                userInfo[index + 1].productiveLine.push([
                  1,
                  copyDurationForEfficiency - 1440 + beginningPointInsideOfDay,
                ]);
              }

              // increase shouldbeproductivebusy per user
              if (!event.activity0.productivityExclude) {
                userInfo[index].shouldBeBusyProductivLine.push([
                  beginningPointInsideOfDay + 1,
                  1440,
                ]);
                userInfo[index + 1].shouldBeBusyProductivLine.push([
                  1,
                  copyDurationForEfficiency - 1440 + beginningPointInsideOfDay,
                ]);
              }
            }
          }

          if (duration <= firstPart) {
            activityInfo.data[index] += duration;
            appointmentsCount.series[index]++;
            continue;
          }

          if (firstPart > 0) {
            activityInfo.data[index] += firstPart;
            appointmentsCount.series[index]++;
            duration -= firstPart;
            index++;
          }

          for (let k = index; k < 7; k++) {
            if (duration > 1440) {
              activityInfo.data[k] += 1440;
              appointmentsCount.series[k]++;
              duration -= 1440;
              continue;
            }

            if (duration > 0) {
              activityInfo.data[k] += duration;
              appointmentsCount.series[k]++;
            }
            break;
          }
        }
      }
    }

    //loop through availabilities
    for (let j = 0; j < availabilitiesForWeek.count; j++) {
      let availability = availabilitiesForWeek.rows[j];
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
          startOfWeekInUTC.toISOString().split('T')[0] +
            ' ' +
            moment.utc(availability.startTime).format('HH:mm'),
          'YYYY-MM-DD HH:mm',
        )
        .add(-7, 'days')
        .toDate();
      const oneWeekLater = moment
        .utc(endOfWeekInUTC.toISOString().split('T')[0], 'YYYY-MM-DD')
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

      if (weekDaysOfAvailability.length === 0) {
        continue;
      }

      const interval = availability?.interval || 1;
      const freq = availability?.frequency?.toUpperCase() ?? 'WEEKLY';

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

      let duration = calculateMinutesBetweenTimesIgnoreDates(
        availability.endTime,
        availability.startTime,
      );

      //check if the event lies in our range
      let s;
      let e;
      for (let p = 0; p < allAvailabilitiesWithRule.length; p++) {
        let isTheEndingInside = false;
        let isTheBeginningInside = false;
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

        if (s >= startOfWeekInUTC && s < endOfWeekInUTC) {
          isTheBeginningInside = true;
          if (e <= endOfWeekInUTC) {
            isTheEndingInside = true;
          } else {
            duration = moment
              .utc(endOfWeekInUTC)
              .diff(moment.utc(s), 'minutes');
          }
        }

        if (!isTheBeginningInside) {
          if (e > startOfWeekInUTC && e <= endOfWeekInUTC) {
            isTheEndingInside = true;
            duration = moment
              .utc(e)
              .diff(moment.utc(startOfWeekInUTC), 'minutes');
          }
        }

        //if it lies increase our i
        if (isTheBeginningInside || isTheEndingInside) {
          // it can be possible if user of availability is disabled
          if (!userListEfficciencyProductivity.has(availability.user.id)) {
            continue;
          }
          let userInfo = userListEfficciencyProductivity.get(
            availability.user.id,
          );

          // if the only ending in range
          if (!isTheBeginningInside) {
            if (availability.available === true) {
              userInfo[0].availableLine.push([1, duration]);
            } else {
              userInfo[0].notavailableLine.push([1, duration]);
            }
            continue;
          }

          // if the only beginning in range
          if (!isTheEndingInside) {
            if (availability.available === true) {
              userInfo[6].availableLine.push([1441 - duration, 1440]);
            } else {
              userInfo[6].notavailableLine.push([1441 - duration, 1440]);
            }
            continue;
          }

          // if fully inside
          let distanceOfStartingWithBeginning = moment
            .utc(s)
            .diff(moment.utc(startOfWeekInUTC), 'minutes');
          let index = Math.floor(distanceOfStartingWithBeginning / 1440);
          let firstPart = getPositiveModulo(
            -distanceOfStartingWithBeginning,
            1440,
          );

          let beginningPointInsideOfDay = getPositiveModulo(
            distanceOfStartingWithBeginning,
            1440,
          );

          if (firstPart === 0) {
            if (availability.available === true) {
              userInfo[index].availableLine.push([1, duration]);
            } else {
              userInfo[index].notavailableLine.push([1, duration]);
            }
            continue;
          }

          if (duration <= firstPart) {
            if (availability.available === true) {
              userInfo[index].availableLine.push([
                beginningPointInsideOfDay + 1,
                beginningPointInsideOfDay + duration,
              ]);
            } else {
              userInfo[index].notavailableLine.push([
                beginningPointInsideOfDay + 1,
                beginningPointInsideOfDay + duration,
              ]);
            }
            continue;
          }

          if (firstPart > 0) {
            if (availability.available === true) {
              userInfo[index].availableLine.push([
                beginningPointInsideOfDay + 1,
                1440,
              ]);
              userInfo[index + 1].availableLine.push([
                1,
                duration - 1440 + beginningPointInsideOfDay,
              ]);
            } else {
              userInfo[index].notavailableLine.push([
                beginningPointInsideOfDay + 1,
                1440,
              ]);
              userInfo[index + 1].notavailableLine.push([
                1,
                duration - 1440 + beginningPointInsideOfDay,
              ]);
            }
          }
        }
      }
    }

    for (let [_, activityInfo] of EventDurationPerActivityInWeek) {
      for (let index = 0; index < activityInfo.data.length; index++) {
        activityInfo.data[index] = Number(
          (activityInfo.data[index] / 60).toFixed(2),
        );
      }
      activitiesDurations.series.push({
        name: activityInfo.name,
        data: activityInfo.data,
      });
      activitiesDurations.colors.push(activityInfo.color);
    }

    // format the capacity according to location
    for (let [_, locationInfo] of locationCapacityList) {
      capacity.series.push({
        name: locationInfo.name,
        data: locationInfo.data,
      });
      capacity.colors.push(locationInfo.color);
    }

    for (let i = 0; i < 7; i++) {
      let totalEfficiency = 0;
      let totalProductivity = 0;
      let totalUser = 0;
      let totalUserZeros = 0;
      for (let [userId, userInfo] of userListEfficciencyProductivity) {
        let totalAvailableTime = calculateUnionLengthOfIntervals(
          findIntervalsNotInArray2(
            userInfo[i].availableLine,
            userInfo[i].notavailableLine,
          ),
        );
        let totalProductiveTime = calculateUnionLengthOfIntervals(
          userInfo[i].productiveLine,
        );
        let totalShouldBeProductiveTime = calculateUnionLengthOfIntervals(
          userInfo[i].shouldBeBusyProductivLine,
        );
        let totalActiveTime = calculateUnionLengthOfIntervals(
          userInfo[i].busyLine,
        );
        let eff = 0;
        let prd = 0;

        if (totalActiveTime > 0) {
          if (totalAvailableTime > 0) {
            //set efficiency level
            eff = Number(
              ((totalActiveTime / totalAvailableTime) * 100).toFixed(2),
            );
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
            ((totalProductiveTime / totalShouldBeProductiveTime) * 100).toFixed(
              2,
            ),
          );
        }

        if (totalActiveTime + totalAvailableTime === 0) {
          continue;
        }

        //set prd = 0 if that users is not going to be productivity calculated
        // it will exclude it from average
        if (!calculateUserProductivity.get(userId)) {
          prd = 0;
        }

        totalEfficiency += eff;
        totalProductivity += prd;
        totalUser++;
        if (prd == 0) {
          totalUserZeros++;
        }
      }

      if (totalUser > 0) {
        efficiency.series.efficiency.data[i] = Number(
          (totalEfficiency / totalUser).toFixed(2),
        );
        if (totalUser !== totalUserZeros) {
          efficiency.series.productivity.data[i] = Number(
            (totalProductivity / (totalUser - totalUserZeros)).toFixed(2),
          );
        }
      }
    }
  }

  return { appointmentsCount, activitiesDurations, capacity, efficiency };
}

async function getWeeksProductivityEfficiencyForDashboard(
  startOfWeekInUTC,
  endOfWeekInUTC,
  companyID,
  branches,
  subgroups,
  roles,
  subgroupID,
) {
  let efficiency = {
    series: {
      productivity: {
        name: 'Productivity',
        data: [0, 0, 0, 0, 0, 0, 0],
      },
      efficiency: {
        name: 'Efficiency',
        data: [0, 0, 0, 0, 0, 0, 0],
      },
    },
    dates: [],
  };

  // if the startWeek and endWeek differs exactly 7 days then calculate the dashboard for a week
  if (
    moment(endOfWeekInUTC).diff(moment(startOfWeekInUTC), 'minutes') === 10080
  ) {
    // Fetch from backend
    const eventsOfWeekListData = await getEventsForWeek(
      startOfWeekInUTC,
      endOfWeekInUTC,
      companyID,
      branches,
      roles,
      subgroups,
    );

    let eventsOfWeek = eventsOfWeekListData.data;

    const availabilitiesForWeekList = await getAvailabilitiesForWeek(
      startOfWeekInUTC,
      endOfWeekInUTC,
      companyID,
      branches,
      subgroups,
      roles,
      [],
      true,
    );

    let availabilitiesForWeek = availabilitiesForWeekList.data;

    const users = await getUsersAccordingBranchRoleSubgroup(
      companyID,
      branches,
      subgroups,
      roles,
      [],
      false,
    );
    //generate user list for calculating the efficiency
    let userListEfficciencyProductivity = new Map();
    let calculateUserProductivity = new Map();

    // I put shouldBeBusyProductivLine for calculating
    // denominator of productivity formula
    for (let m = 0; m < users.data.count; m++) {
      const weeklyData = new Array(7);
      for (let i = 0; i < 7; i++) {
        weeklyData[i] = {
          availableLine: [],
          notavailableLine: [],
          productiveLine: [],
          shouldBeBusyProductivLine: [],
          busyLine: [],
        };
      }

      let calculateCurrentUserProductivity = false;
      for (let p = 0; p < users.data.rows[m].roles.length; p++) {
        if (users.data.rows[m].roles[p].productivityInclude) {
          calculateCurrentUserProductivity = true;
          break;
        }
      }
      userListEfficciencyProductivity.set(users.data.rows[m].id, weeklyData);
      calculateUserProductivity.set(
        users.data.rows[m].id,
        calculateCurrentUserProductivity,
      );
    }

    //loop through events
    for (let j = 0; j < eventsOfWeek.count; j++) {
      let event = eventsOfWeek.rows[j];

      // generate the rule of event
      const startRuleAccordingEvent = moment
        .utc(
          event.startRecur + ' ' + moment.utc(event.start).format('HH:mm'),
          'YYYY-MM-DD HH:mm',
        )
        .toDate();
      const endRuleAccordingEvent = moment.utc(event.endRecur).toDate();

      let weekDaysOfEvent = [];
      // set the weekdays of rule

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

      let startRule = startRuleAccordingEvent;
      let endRule = endRuleAccordingEvent;

      const fr = event?.frequency?.toUpperCase() ?? 'WEEKLY';
      let rruleObject = {
        freq: rule_RRule.RRule[fr],
        interval: event.interval,
        byweekday: weekDaysOfEvent,
        dtstart: startRule,
        until: endRule,
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
        let copyDurationForEfficiency = calculateMinutesBetweenTimesIgnoreDates(
          event.end,
          event.start,
        );
        let isTheEndingInside = false;
        let isTheBeginningInside = false;
        //check if the event lies in our range
        let s = allEventsWithRule[p];
        let e = moment
          .utc(allEventsWithRule[p])
          .add(copyDurationForEfficiency, 'minutes')
          .toDate();

        let eventCreatedDate = moment.utc(event.start).startOf('day').toDate();

        let createdInDaylightSaving = moment(eventCreatedDate).isDST();
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

        if (s >= startOfWeekInUTC && s < endOfWeekInUTC) {
          isTheBeginningInside = true;
          if (e <= endOfWeekInUTC) {
            isTheEndingInside = true;
          } else {
            copyDurationForEfficiency = moment
              .utc(endOfWeekInUTC)
              .diff(moment.utc(s), 'minutes');
          }
        }

        if (!isTheBeginningInside) {
          if (e > startOfWeekInUTC && e <= endOfWeekInUTC) {
            isTheEndingInside = true;
            copyDurationForEfficiency = moment
              .utc(e)
              .diff(moment.utc(startOfWeekInUTC), 'minutes');
          }
        }

        //if it lies increase our i
        if (isTheBeginningInside || isTheEndingInside) {
          const userNumberOfEvent = event.users.length;

          // if the only ending in range
          if (!isTheBeginningInside) {
            // increase the busyline of user
            for (let j = 0; j < userNumberOfEvent; j++) {
              // it can be possible if one of the users of event is disabled
              if (!userListEfficciencyProductivity.has(event.users[j].id)) {
                continue;
              }
              let userInfo = userListEfficciencyProductivity.get(
                event.users[j].id,
              );
              userInfo[0].busyLine.push([1, copyDurationForEfficiency]);

              // increase productivity per user
              if (event.activity0.productivityInclude) {
                userInfo[0].productiveLine.push([1, copyDurationForEfficiency]);
              }

              // increase shouldbeproductivebusy per user
              if (!event.activity0.productivityExclude) {
                userInfo[0].shouldBeBusyProductivLine.push([
                  1,
                  copyDurationForEfficiency,
                ]);
              }
            }
            continue;
          }

          // if the only beginning in range
          if (!isTheEndingInside) {
            // increase the busyline of user
            for (let j = 0; j < userNumberOfEvent; j++) {
              // it can be possible if one of the users of event is disabled
              if (!userListEfficciencyProductivity.has(event.users[j].id)) {
                continue;
              }
              let userInfo = userListEfficciencyProductivity.get(
                event.users[j].id,
              );
              userInfo[6].busyLine.push([
                1441 - copyDurationForEfficiency,
                1440,
              ]);
              // increase productivity per user
              if (event.activity0.productivityInclude) {
                userInfo[6].productiveLine.push([
                  1441 - copyDurationForEfficiency,
                  1440,
                ]);
              }

              // increase shouldbeproductivebusy per user
              if (!event.activity0.productivityExclude) {
                userInfo[6].shouldBeBusyProductivLine.push([
                  1441 - copyDurationForEfficiency,
                  1440,
                ]);
              }
            }
            continue;
          }

          // if fully inside
          let distanceOfStartingWithBeginning = moment
            .utc(s)
            .diff(moment.utc(startOfWeekInUTC), 'minutes');

          let index = Math.floor(distanceOfStartingWithBeginning / 1440);
          let firstPart = getPositiveModulo(
            -distanceOfStartingWithBeginning,
            1440,
          );

          let beginningPointInsideOfDay = getPositiveModulo(
            distanceOfStartingWithBeginning,
            1440,
          );

          // increase the busyline of users
          for (let j = 0; j < userNumberOfEvent; j++) {
            // it can be possible if one of the users of event is disabled
            if (!userListEfficciencyProductivity.has(event.users[j].id)) {
              continue;
            }
            let userInfo = userListEfficciencyProductivity.get(
              event.users[j].id,
            );
            if (copyDurationForEfficiency <= firstPart) {
              userInfo[index].busyLine.push([
                beginningPointInsideOfDay + 1,
                beginningPointInsideOfDay + copyDurationForEfficiency,
              ]);

              // increase productivityline of user
              if (event.activity0.productivityInclude) {
                userInfo[index].productiveLine.push([
                  beginningPointInsideOfDay + 1,
                  beginningPointInsideOfDay + copyDurationForEfficiency,
                ]);
              }

              // increase shouldbeproductivebusy per user
              if (!event.activity0.productivityExclude) {
                userInfo[index].shouldBeBusyProductivLine.push([
                  beginningPointInsideOfDay + 1,
                  beginningPointInsideOfDay + copyDurationForEfficiency,
                ]);
              }
              continue;
            }

            if (firstPart === 0) {
              userInfo[index].busyLine.push([1, copyDurationForEfficiency]);
              continue;
            }

            if (firstPart > 0) {
              userInfo[index].busyLine.push([
                beginningPointInsideOfDay + 1,
                1440,
              ]);
              userInfo[index + 1].busyLine.push([
                1,
                copyDurationForEfficiency - 1440 + beginningPointInsideOfDay,
              ]);

              // increase productivityline of user
              if (event.activity0.productivityInclude) {
                userInfo[index].productiveLine.push([
                  beginningPointInsideOfDay + 1,
                  1440,
                ]);
                userInfo[index + 1].productiveLine.push([
                  1,
                  copyDurationForEfficiency - 1440 + beginningPointInsideOfDay,
                ]);
              }

              // increase shouldbeproductivebusy per user
              if (!event.activity0.productivityExclude) {
                userInfo[index].shouldBeBusyProductivLine.push([
                  beginningPointInsideOfDay + 1,
                  1440,
                ]);
                userInfo[index + 1].shouldBeBusyProductivLine.push([
                  1,
                  copyDurationForEfficiency - 1440 + beginningPointInsideOfDay,
                ]);
              }
            }
          }
        }
      }
    }

    //loop through availabilities
    for (let j = 0; j < availabilitiesForWeek.count; j++) {
      let availability = availabilitiesForWeek.rows[j];
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
          startOfWeekInUTC.toISOString().split('T')[0] +
            ' ' +
            moment.utc(availability.startTime).format('HH:mm'),
          'YYYY-MM-DD HH:mm',
        )
        .add(-7, 'days')
        .toDate();
      const oneWeekLater = moment
        .utc(endOfWeekInUTC.toISOString().split('T')[0], 'YYYY-MM-DD')
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
      if (weekDaysOfAvailability.length === 0) {
        continue;
      }

      const interval = availability?.interval || 1;
      const freq = availability?.frequency?.toUpperCase() ?? 'WEEKLY';

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

      let duration = calculateMinutesBetweenTimesIgnoreDates(
        availability.endTime,
        availability.startTime,
      );

      //check if the event lies in our range
      let s;
      let e;
      for (let p = 0; p < allAvailabilitiesWithRule.length; p++) {
        let isTheEndingInside = false;
        let isTheBeginningInside = false;
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

        if (s >= startOfWeekInUTC && s < endOfWeekInUTC) {
          isTheBeginningInside = true;
          if (e <= endOfWeekInUTC) {
            isTheEndingInside = true;
          } else {
            duration = moment
              .utc(endOfWeekInUTC)
              .diff(moment.utc(s), 'minutes');
          }
        }

        if (!isTheBeginningInside) {
          if (e > startOfWeekInUTC && e <= endOfWeekInUTC) {
            isTheEndingInside = true;
            duration = moment
              .utc(e)
              .diff(moment.utc(startOfWeekInUTC), 'minutes');
          }
        }

        //if it lies increase our i
        if (isTheBeginningInside || isTheEndingInside) {
          // it can be possible if user of availability is disabled
          if (!userListEfficciencyProductivity.has(availability.user.id)) {
            continue;
          }
          let userInfo = userListEfficciencyProductivity.get(
            availability.user.id,
          );

          // if the only ending in range
          if (!isTheBeginningInside) {
            if (availability.available === true) {
              userInfo[0].availableLine.push([1, duration]);
            } else {
              userInfo[0].notavailableLine.push([1, duration]);
            }
            continue;
          }

          // if the only beginning in range
          if (!isTheEndingInside) {
            if (availability.available === true) {
              userInfo[6].availableLine.push([1441 - duration, 1440]);
            } else {
              userInfo[6].notavailableLine.push([1441 - duration, 1440]);
            }
            continue;
          }

          // if fully inside
          let distanceOfStartingWithBeginning = moment
            .utc(s)
            .diff(moment.utc(startOfWeekInUTC), 'minutes');
          let index = Math.floor(distanceOfStartingWithBeginning / 1440);
          let firstPart = getPositiveModulo(
            -distanceOfStartingWithBeginning,
            1440,
          );

          let beginningPointInsideOfDay = getPositiveModulo(
            distanceOfStartingWithBeginning,
            1440,
          );

          if (firstPart === 0) {
            if (availability.available === true) {
              userInfo[index].availableLine.push([1, duration]);
            } else {
              userInfo[index].notavailableLine.push([1, duration]);
            }
            continue;
          }

          if (duration <= firstPart) {
            if (availability.available === true) {
              userInfo[index].availableLine.push([
                beginningPointInsideOfDay + 1,
                beginningPointInsideOfDay + duration,
              ]);
            } else {
              userInfo[index].notavailableLine.push([
                beginningPointInsideOfDay + 1,
                beginningPointInsideOfDay + duration,
              ]);
            }
            continue;
          }

          if (firstPart > 0) {
            if (availability.available === true) {
              userInfo[index].availableLine.push([
                beginningPointInsideOfDay + 1,
                1440,
              ]);
              userInfo[index + 1].availableLine.push([
                1,
                duration - 1440 + beginningPointInsideOfDay,
              ]);
            } else {
              userInfo[index].notavailableLine.push([
                beginningPointInsideOfDay + 1,
                1440,
              ]);
              userInfo[index + 1].notavailableLine.push([
                1,
                duration - 1440 + beginningPointInsideOfDay,
              ]);
            }
          }
        }
      }
    }

    for (let i = 0; i < 7; i++) {
      let totalEfficiency = 0;
      let totalProductivity = 0;
      let totalUser = 0;
      let totalUserZeros = 0;

      for (let [userId, userInfo] of userListEfficciencyProductivity) {
        let totalAvailableTime = calculateUnionLengthOfIntervals(
          findIntervalsNotInArray2(
            userInfo[i].availableLine,
            userInfo[i].notavailableLine,
          ),
        );
        let totalProductiveTime = calculateUnionLengthOfIntervals(
          userInfo[i].productiveLine,
        );
        let totalShouldBeProductiveTime = calculateUnionLengthOfIntervals(
          userInfo[i].shouldBeBusyProductivLine,
        );
        let totalActiveTime = calculateUnionLengthOfIntervals(
          userInfo[i].busyLine,
        );
        let eff = 0;
        let prd = 0;

        if (totalActiveTime > 0) {
          if (totalAvailableTime > 0) {
            //set efficiency level
            eff = Number(
              ((totalActiveTime / totalAvailableTime) * 100).toFixed(2),
            );
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
            ((totalProductiveTime / totalShouldBeProductiveTime) * 100).toFixed(
              2,
            ),
          );
        }

        if (totalActiveTime + totalAvailableTime === 0) {
          continue;
        }

        //set prd = 0 if that users is not going to be productivity calculated
        // it will exclude it from average
        if (!calculateUserProductivity.get(userId)) {
          prd = 0;
        }

        totalEfficiency += eff;
        totalProductivity += prd;
        totalUser++;
        if (prd == 0) {
          totalUserZeros++;
        }
      }

      if (totalUser > 0) {
        efficiency.series.efficiency.data[i] = Number(
          (totalEfficiency / totalUser).toFixed(2),
        );
        if (totalUser !== totalUserZeros) {
          efficiency.series.productivity.data[i] = Number(
            (totalProductivity / (totalUser - totalUserZeros)).toFixed(2),
          );
        }
      }
    }
  }

  return { efficiency };
}

async function getDaysStatsForDashboardHourly(
  startInUTC,
  endInUTC,
  companyID,
  branches,
  subgroups,
  roles,
) {
  let todaysTotalEvents = 0;
  let todaysTotalDurationOfEvents = 0;
  let todaysActivityDurations = {
    series: [],
    colors: [],
    times: timesArray,
  };

  //if it is not exact 24 hour, response empty
  if (moment(endInUTC).diff(moment(startInUTC), 'minutes') === !1440) {
    return {
      todaysTotalEvents,
      todaysTotalDurationOfEvents,
      todaysActivityDurations,
    };
  }
  let startDayOfWeek = startInUTC.getDay();
  let endDayOfWeek = endInUTC.getDay();

  let startWeekDayId = weekdayOptions[startDayOfWeek].value;
  let endWeekDayId = weekdayOptions[endDayOfWeek].value;

  // Fetch from backend
  const eventListData = await getEventsForDay(
    startInUTC,
    endInUTC,
    companyID,
    branches,
    roles,
    subgroups,
    [],
  );

  let eventsForDay = eventListData.data;

  let EventDurationPerActivity = new Map();
  for (let i = 0; i < eventsForDay.count; i++) {
    let event = eventsForDay.rows[i];

    // generate the rule of event
    const startRule = moment
      .utc(
        event.startRecur + ' ' + moment.utc(event.start).format('HH:mm'),
        'YYYY-MM-DD HH:mm',
      )
      .format();
    const endRule = moment.utc(event.endRecur).format('YYYY-MM-DD');
    let weekDaysOfEvent = [];

    // set the weekdays of rule
    if (event.M) {
      if (startDayOfWeek === 1 || endDayOfWeek === 1) {
        weekDaysOfEvent.push(0);
      }
    }
    if (event.T) {
      if (startDayOfWeek === 2 || endDayOfWeek === 2) {
        weekDaysOfEvent.push(1);
      }
    }
    if (event.W) {
      if (startDayOfWeek === 3 || endDayOfWeek === 3) {
        weekDaysOfEvent.push(2);
      }
    }

    if (event.R) {
      if (startDayOfWeek === 4 || endDayOfWeek === 4) {
        weekDaysOfEvent.push(3);
      }
    }

    if (event.F) {
      if (startDayOfWeek === 5 || endDayOfWeek === 5) {
        weekDaysOfEvent.push(4);
      }
    }

    if (event.S) {
      if (startDayOfWeek === 6 || endDayOfWeek === 6) {
        weekDaysOfEvent.push(5);
      }
    }
    if (event.U) {
      if (startDayOfWeek === 0 || endDayOfWeek === 0) {
        weekDaysOfEvent.push(6);
      }
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
    let duration = calculateMinutesBetweenTimesIgnoreDates(
      event.end,
      event.start,
    );

    let isItValidEvent = false;
    let isTheEndingInside = false;
    let isTheBeginningInside = false;
    //check if the event lies in our range
    let s;
    let e;
    for (let p = 0; p < allEventsWithRule.length; p++) {
      s = allEventsWithRule[p];
      e = moment.utc(allEventsWithRule[p]).add(duration, 'minutes').toDate();

      if (s >= startInUTC && s < endInUTC) {
        isItValidEvent = true;
        isTheBeginningInside = true;
        if (e <= endInUTC) {
          isTheEndingInside = true;
        } else {
          duration = moment.utc(endInUTC).diff(moment.utc(s), 'minutes');
        }
        break;
      }

      if (e > startInUTC && e <= endInUTC) {
        isTheEndingInside = true;
        isItValidEvent = true;
        if (s >= startInUTC) {
          isTheBeginningInside = true;
        } else {
          duration = moment.utc(e).diff(moment.utc(startInUTC), 'minutes');
        }
        break;
      }
    }

    //if it lies increase our i
    if (isItValidEvent) {
      //increase the number and duration for today
      todaysTotalEvents++;
      todaysTotalDurationOfEvents += duration;

      // increase the duration per activity per hour
      if (!EventDurationPerActivity.has(event.activity0.id)) {
        const color = event.activity0?.color ?? 'black';
        let activity = {
          name: event.activity0.firstName,
          color,
          data: Array(24).fill(0),
        };

        EventDurationPerActivity.set(event.activity0.id, activity);
      }

      let activityInfo = EventDurationPerActivity.get(event.activity0.id);
      // if the only ending in range
      if (!isTheBeginningInside) {
        //fill the activity duration
        for (let k = 0; k < 24; k++) {
          if (duration > 60) {
            activityInfo.data[k] += 60;
            duration -= 60;
            continue;
          }

          activityInfo.data[k] += duration;
          break;
        }

        continue;
      }

      // if the only beginning in range
      if (!isTheEndingInside) {
        //fill the activity duration
        for (let k = 23; k > -1; k--) {
          if (duration > 60) {
            activityInfo.data[k] += 60;
            duration -= 60;
            continue;
          }

          activityInfo.data[k] += duration;
          break;
        }

        continue;
      }

      // if fully inside
      let distanceOfStartingWithBeginning = moment
        .utc(s)
        .diff(moment.utc(startInUTC), 'minutes');
      let index = Math.floor(distanceOfStartingWithBeginning / 60);
      let firstPart = getPositiveModulo(-distanceOfStartingWithBeginning, 60);

      if (duration <= firstPart) {
        activityInfo.data[index] += duration;
        continue;
      }

      if (firstPart > 0) {
        activityInfo.data[index] += firstPart;
        duration -= firstPart;
        index++;
      }

      for (let k = index; k < 24; k++) {
        if (duration > 60) {
          activityInfo.data[k] += 60;
          duration -= 60;
          continue;
        }

        activityInfo.data[k] += duration;
        break;
      }
    }
  }

  let beginningAppointmentsHourIndex = 23;
  let endingAppointmentsHourIndex = 0;

  for (let [_, activityInfo] of EventDurationPerActivity) {
    for (let index = 0; index < activityInfo.data.length; index++) {
      activityInfo.data[index] = Number(
        (activityInfo.data[index] / 60).toFixed(2),
      );

      if (activityInfo.data[index] > 0) {
        if (index < beginningAppointmentsHourIndex) {
          beginningAppointmentsHourIndex = index;
        }

        if (index > endingAppointmentsHourIndex) {
          endingAppointmentsHourIndex = index;
        }
      }
    }
    todaysActivityDurations.series.push({
      name: activityInfo.name,
      data: activityInfo.data,
    });
    todaysActivityDurations.colors.push(activityInfo.color);
  }

  // crop the hours without any appointment
  for (let j = 0; j < todaysActivityDurations.series.length; j++) {
    todaysActivityDurations.series[j].data = todaysActivityDurations.series[
      j
    ].data.slice(
      beginningAppointmentsHourIndex,
      endingAppointmentsHourIndex + 1,
    );
  }
  todaysActivityDurations.times = todaysActivityDurations.times.slice(
    beginningAppointmentsHourIndex,
    endingAppointmentsHourIndex + 1,
  );

  todaysTotalDurationOfEvents = Number(
    (todaysTotalDurationOfEvents / 60).toFixed(2),
  );

  return {
    todaysTotalEvents,
    todaysTotalDurationOfEvents,
    todaysActivityDurations,
  };
}

async function getUserActivityTableDuringDateRangeGrouped(
  startInUTC,
  endInUTC,
  companyID,
  branches,
  subgroups,
  roles,
  users,
  type,
  ranges,
) {
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
  let branchStatsPerActivity = [];

  // Fetch from backend (users)
  const usersAfterFilterList = await getUsersAccordingBranchRoleSubgroup(
    companyID,
    branches,
    subgroups,
    roles,
    users,
    true,
    false,
  );

  let ancestorsBranchsMap = await BranchesDBApi.getAncestorBranchesOfEachBranch(
    { branches },
  );

  let usersAfterFilter = usersAfterFilterList.data;
  let usersAfterFilterIds = usersAfterFilter.rows.map((u) => u.id);

  // Fetch from backend (events)
  const eventListData = await getEventsForDateRange(
    startInUTC,
    endInUTC,
    companyID,
    [],
    [],
    [],
    //branches,
    //roles,
    //subgroups,
    usersAfterFilterIds,
    false,
  );

  let eventsForDateRange = eventListData.data;
  let cancelledEvents = eventListData.cancelledEvents;
  // set ancestor branches for each user
  for (let j = 0; j < usersAfterFilter.rows.length; j++) {
    let currentUser = usersAfterFilter.rows[j];
    currentUser.ancestorBranches = new Array();

    //loop through all branches
    for (let m = 0; m < currentUser.branches.length; m++) {
      if (ancestorsBranchsMap.has(currentUser.branches[m].id)) {
        currentUser.ancestorBranches.push(
          ...ancestorsBranchsMap.get(currentUser.branches[m].id),
          currentUser.branches[m].id,
        );
      }
    }

    // remove duplicates from ancestors branch list
    currentUser.ancestorBranches = [...new Set(currentUser.ancestorBranches)];
  }
  // Fetch from backend (availabilities)
  const availabilitiesListData = await getAvailabilitiesForDateRange(
    startInUTC,
    endInUTC,
    companyID,
    // branches,
    // subgroups,
    // roles,
    [],
    [],
    [],
    usersAfterFilterIds,
    //users,
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
  );


  let activities = activitiesList.data;

  // generate activity list for calculating the activity table
  // We need to give the total per activity for each activity
  let activityListMap = new Map();
  for (let m = 0; m < activities.count; m++) {
    const color = activities.rows[m]?.color ?? 'black';
    activityListMap.set(activities.rows[m].id, {
      id: activities.rows[m].id,
      name: activities.rows[m].firstName,
      color,
      total: 0,
    });
  }

  //generate branch list for calculating the activity table
  let branchList = new Map();
  let allBranches = await BranchesDBApi.findAll({
    branches: branches.join('|'),
  });

  for (let i = 0; i < allBranches.rows.length; i++) {
    let totalPerActivity = new Map();
    let totalPerTotalType = new Map();
    for (let m = 0; m < activities.count; m++) {
      totalPerActivity.set(activities.rows[m].id, {
        total: 0,
        eventLine: new Array(),
      });
    }

    for (let s = 0; s < totalTypeActivities.length; s++) {
      totalPerTotalType.set(totalTypeActivities[s].id, {
        total: 0,
        name: totalTypeActivities[s].name,
        eventLine: new Array(),
      });
    }

    branchList.set(allBranches.rows[i].id, {
      id: allBranches.rows[i].id,
      name: allBranches.rows[i].name,
      totalPerActivity: totalPerActivity,
      totalPerTotalType: totalPerTotalType,
      ranges: new Map(),
    });

    let currentBranch = branchList.get(allBranches.rows[i].id);
    // fill the ranges
    for (let j = 0; j < ranges.length; j++) {
      let begin = moment(ranges[j][0]).format('MM/DD/YYYY');
      let end = moment(ranges[j][1]).format('MM/DD/YYYY');
      let totalPerActivity = new Map();
      let totalPerTotalType = new Map();
      for (let m = 0; m < activities.count; m++) {
        totalPerActivity.set(activities.rows[m].id, {
          total: 0,
          eventLine: new Array(),
        });
      }

      for (let s = 0; s < totalTypeActivities.length; s++) {
        totalPerTotalType.set(totalTypeActivities[s].id, {
          total: 0,
          name: totalTypeActivities[s].name,
          eventLine: new Array(),
        });
      }

      currentBranch.ranges.set(begin + ' - ' + end, {
        interval: ranges[j],
        totalPerActivity: totalPerActivity,
        totalPerTotalType: totalPerTotalType,
        total: 0,
        totalBillable: 0,
        totalNonBillable: 0,
        efficiency: 0,
        productivity: 0,
        cancellationRate: 0,
        supervisionRate: 0,
        efficiencyCalculatedUser: 0,
        productivityCalculatedUser: 0,
        cancellationRateCalculatedUser: 0,
        supervisionRateCalculatedUser: 0,
      });
    }
  }

  // generate user list for calculating the activity table
  // We will use this map for collecting the each users data in each interval
  // For example the data of user X in between dates Y and Z
  // Then we will calculate the branch data for each interval by using the each user's data
  // in that branch. For deciding if user X is related to branch M we have `ancestorBranches` in
  // every user.
  let userList = new Map();
  let calculateUserProductivity = new Map();
  for (let m = 0; m < usersAfterFilter.count; m++) {
    userList.set(usersAfterFilter.rows[m].id, {
      firstName: usersAfterFilter.rows[m].firstName,
      lastName: usersAfterFilter.rows[m].lastName,
      email: usersAfterFilter.rows[m].email,
      ancestorBranches: usersAfterFilter.rows[m].ancestorBranches,
      ranges: new Map(),
    });

    let currentUser = userList.get(usersAfterFilter.rows[m].id);

    // fill the ranges
    for (let j = 0; j < ranges.length; j++) {
      let begin = moment(ranges[j][0]).format('MM/DD/YYYY');
      let end = moment(ranges[j][1]).format('MM/DD/YYYY');
      let totalPerActivity = new Map();
      let totalPerTotalType = new Map();
      for (let m = 0; m < activities.count; m++) {
        totalPerActivity.set(activities.rows[m].id, {
          total: 0,
          eventLine: new Array(),
        });
      }

      for (let s = 0; s < totalTypeActivities.length; s++) {
        totalPerTotalType.set(totalTypeActivities[s].id, {
          total: 0,
          name: totalTypeActivities[s].name,
          eventLine: new Array(),
        });
      }

      currentUser.ranges.set(begin + ' - ' + end, {
        interval: ranges[j],
        total: 0,
        totalBillable: 0,
        totalNonBillable: 0,
        totalPerActivity: totalPerActivity,
        totalPerTotalType: totalPerTotalType,
        availableLine: Array(),
        notavailableLine: Array(),
        busyLine: Array(),
        billableLine: Array(),
        nonBillableline: Array(),
        productiveLine: Array(),
        shouldBeBusyProductivLine: Array(),
        eventNumber: 0,
        cancelNumber: 0,
        mustCalculatedSupervisionDuration: 0,
        supervisedDuration: 0,
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
  let eventsList = new Map(); // this map will hold totals for each event, splitted by ranges
  // loop through events for calculating the info
  // Inside of this loop, loop through each range
  for (let i = 0; i < eventsForDateRange.count; i++) {
    const event = eventsForDateRange.rows[i];
    let eventBranches = new Set()
    for (let usr of event.users){
      for (let brnch of userList.get(usr.id).ancestorBranches) {
        eventBranches.add(brnch)
      }
    }
    let rangesForEvent = new Map()
    eventsList.set(event.id, {eventBranches, rangesForEvent})
    const startRecurDate = new Date(event.startRecur);
    const startTime = new Date(event.start).toISOString().split('T')[1]; // Get time part in HH:mm:ss.sssZ
    const startRule = new Date(
      `${startRecurDate.toISOString().split('T')[0]}T${startTime}`,
    ).toISOString();

    const endRecurDate = new Date(event.endRecur);
    const endRule = endRecurDate.toISOString().split('T')[0]; // Get date part only

    let weekDaysOfEvent = [];
    if (event.M) weekDaysOfEvent.push(0);
    if (event.T) weekDaysOfEvent.push(1);
    if (event.W) weekDaysOfEvent.push(2);
    if (event.R) weekDaysOfEvent.push(3);
    if (event.F) weekDaysOfEvent.push(4);
    if (event.S) weekDaysOfEvent.push(5);
    if (event.U) weekDaysOfEvent.push(6);

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

    let allEventsWithRule = rule.between(startInUTC, endInUTC);

    let supervisedDurationOfEvent = 0;
    let mustSupervisedEvent = false;

    if (event.supervisionId && eventDurationMap.has(event.supervisionId)) {
      supervisedDurationOfEvent = eventDurationMap.get(event.supervisionId);
    }

    if (event.activity0.supervisionRateInclude) {
      mustSupervisedEvent = true;
    }

    // loop through ranges
    for (let w = 0; w < ranges.length; w++) {
      const currentStartInUTC = ranges[w][0];
      const currentEndInUTC = ranges[w][1];

      const currentIntervalTotalMinute = moment(currentEndInUTC).diff(
        moment(currentStartInUTC),
        'minutes',
      );

      const begin = moment(currentStartInUTC).format('MM/DD/YYYY');
      const end = moment(currentEndInUTC).format('MM/DD/YYYY');
      const rangeTitle = begin + ' - ' + end;

      // create and populate with default values map for totalTypes
      let totalByTotalType = new Map()
      for (let s = 0; s < totalTypeActivities.length; s++) {
        totalByTotalType.set(totalTypeActivities[s].id, {
          total: 0,
          name: totalTypeActivities[s].name,
          activityIds: totalTypeActivities[s].activityIds,
        });
      }
      
      rangesForEvent.set(rangeTitle, {
        total: 0, 
        totalBillable: 0, 
        totalNonBillable:0, 
        activity: {id: event.activity0.id, total: 0}, 
        totalByTotalType: totalByTotalType
      })
      
      // loop through each event occurrence
      for (let p = 0; p < allEventsWithRule.length; p++) {
        // measure individual parts if needed
        let duration = calculateMinutesBetweenTimesIgnoreDates(
          event.end,
          event.start,
        );

        let isTheEndingInside = false;
        let isTheBeginningInside = false;
        let isItValidEvent = false;

        let s = allEventsWithRule[p];
        // Add duration to the start time (s)
        let e = new Date(new Date(s).getTime() + duration * 60000);

        // Get the start of the day for event.start in UTC
        const eventCreatedDate = new Date(
          new Date(event.start).setUTCHours(0, 0, 0, 0),
        );

        // Check if the event's creation date is in Daylight Saving Time (DST)
        const createdInDaylightSaving = isDST(eventCreatedDate);

        // Check if the current date is in Daylight Saving Time (DST)
        const currentDateInDaylightSaving = isDST(new Date(s));

        // Helper function to determine if a date is in DST
        function isDST(date) {
          const jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
          const jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
          return date.getTimezoneOffset() < Math.max(jan, jul);
        }

        if (currentDateInDaylightSaving !== createdInDaylightSaving) {
          if (currentDateInDaylightSaving) {
            // Subtract 1 hour from `s` and `e`
            s = new Date(new Date(s).getTime() - 3600000); // 3600000 ms = 1 hour
            e = new Date(new Date(e).getTime() - 3600000);
          } else {
            // Add 1 hour to `s` and `e`
            s = new Date(new Date(s).getTime() + 3600000);
            e = new Date(new Date(e).getTime() + 3600000);
          }
        }

        if (s >= currentStartInUTC && s < currentEndInUTC) {
          isItValidEvent = true;
          isTheBeginningInside = true;
          if (e <= currentEndInUTC) {
            isTheEndingInside = true;
          } else {
            duration = (currentEndInUTC - new Date(s)) / 60000; // Difference in milliseconds converted to minutes
          }
        }

        if (
          e > currentStartInUTC &&
          e <= currentEndInUTC &&
          !isTheBeginningInside
        ) {
          isTheEndingInside = true;
          isItValidEvent = true;
          duration = (new Date(e) - new Date(currentStartInUTC)) / 60000; // Difference in milliseconds converted to minutes
        }

        if (isItValidEvent) {
          // Nested user loop: frequently a big bottleneck

          //if the event valid, we will add duration to this event's totals, in current range
          rangesForEvent.get(rangeTitle).total += Number( (duration / 60).toFixed(2) )
          rangesForEvent.get(rangeTitle).activity.total += Number( (duration / 60).toFixed(2) )
          if (event.activity0.billable) {
            rangesForEvent.get(rangeTitle).totalBillable += Number( (duration / 60).toFixed(2) )
          }else{
            rangesForEvent.get(rangeTitle).totalNonBillable += Number( (duration / 60).toFixed(2) )
          }
          for (let [_, totalType] of rangesForEvent.get(rangeTitle).totalByTotalType) {
            if (totalType.activityIds.includes(event.activity0.id)) {
              totalType.total += Number( (duration / 60).toFixed(2) );
            }
          }
          for (let ui = 0; ui < event.users.length; ui++) {
            const userId = event.users[ui].id;
            const userInfoInThisRange = userList
              .get(userId)
              .ranges.get(rangeTitle);
            const userDurationPerActivity =
              userInfoInThisRange.totalPerActivity.get(event.activity0.id);
            const activityInfoFromMap = activityListMap.get(event.activity0.id);

            userInfoInThisRange.eventNumber++;
            activityInfoFromMap.total += duration;
            userInfoInThisRange.supervisedDuration += supervisedDurationOfEvent;

            // Depending on where you suspect the cost, you could also benchmark here
            // e.g., //console.time('pushing-lines'); and //console.timeEnd('pushing-lines');

            if (!isTheBeginningInside) {
              userInfoInThisRange.busyLine.push([1, duration]);
              userDurationPerActivity.eventLine.push([1, duration]);

              if (event.activity0.productivityInclude) {
                userInfoInThisRange.productiveLine.push([1, duration]);
              }

              if (!event.activity0.productivityExclude) {
                userInfoInThisRange.shouldBeBusyProductivLine.push([
                  1,
                  duration,
                ]);
              }

              if (event.activity0.billable) {
                userInfoInThisRange.billableLine.push([1, duration]);
              } else {
                userInfoInThisRange.nonBillableline.push([1, duration]);
              }
              continue;
            }

            if (!isTheEndingInside) {
              userInfoInThisRange.busyLine.push([
                currentIntervalTotalMinute + 1 - duration,
                currentIntervalTotalMinute,
              ]);
              userDurationPerActivity.eventLine.push([
                currentIntervalTotalMinute + 1 - duration,
                currentIntervalTotalMinute,
              ]);

              if (event.activity0.productivityInclude) {
                userInfoInThisRange.productiveLine.push([
                  currentIntervalTotalMinute + 1 - duration,
                  currentIntervalTotalMinute,
                ]);
              }

              if (!event.activity0.productivityExclude) {
                userInfoInThisRange.shouldBeBusyProductivLine.push([
                  currentIntervalTotalMinute + 1 - duration,
                  currentIntervalTotalMinute,
                ]);
              }

              if (event.activity0.billable) {
                userInfoInThisRange.billableLine.push([
                  currentIntervalTotalMinute + 1 - duration,
                  currentIntervalTotalMinute,
                ]);
              } else {
                userInfoInThisRange.nonBillableline.push([
                  currentIntervalTotalMinute + 1 - duration,
                  currentIntervalTotalMinute,
                ]);
              }
              continue;
            }

            if (mustSupervisedEvent) {
              userInfoInThisRange.mustCalculatedSupervisionDuration += duration;
            }

            const distanceOfStartingWithBeginning = moment
              .utc(s)
              .diff(moment.utc(currentStartInUTC), 'minutes');

            userInfoInThisRange.busyLine.push([
              distanceOfStartingWithBeginning + 1,
              distanceOfStartingWithBeginning + duration,
            ]);

            userDurationPerActivity.eventLine.push([
              distanceOfStartingWithBeginning + 1,
              distanceOfStartingWithBeginning + duration,
            ]);

            if (event.activity0.productivityInclude) {
              userInfoInThisRange.productiveLine.push([
                distanceOfStartingWithBeginning + 1,
                distanceOfStartingWithBeginning + duration,
              ]);
            }

            if (!event.activity0.productivityExclude) {
              userInfoInThisRange.shouldBeBusyProductivLine.push([
                distanceOfStartingWithBeginning + 1,
                distanceOfStartingWithBeginning + duration,
              ]);
            }

            if (event.activity0.billable) {
              userInfoInThisRange.billableLine.push([
                distanceOfStartingWithBeginning + 1,
                distanceOfStartingWithBeginning + duration,
              ]);
            } else {
              userInfoInThisRange.nonBillableline.push([
                distanceOfStartingWithBeginning + 1,
                distanceOfStartingWithBeginning + duration,
              ]);
            }
          }
        }
      }
    }
  }

  // loop through events for cancellation statistics
  // Inside of this loop, loop through each range
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
    let allEventsWithRule = rule.between(startInUTC, endInUTC);

    // check for each range
    for (let w = 0; w < ranges.length; w++) {
      let currentStartInUTC = ranges[w][0];
      let currentEndInUTC = ranges[w][1];

      let begin = moment(currentStartInUTC).format('MM/DD/YYYY');
      let end = moment(currentEndInUTC).format('MM/DD/YYYY');
      let rangeTitle = begin + ' - ' + end;

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

        if (s < currentEndInUTC && e > currentStartInUTC) {
          isItValidEvent = true;
        }

        //if it lies increase our i
        if (isItValidEvent) {
          for (let i = 0; i < event.users.length; i++) {
            let userInfoInThisRange = userList
              .get(event.users[i].id)
              .ranges.get(rangeTitle);
            userInfoInThisRange.eventNumber++;
          }
          if (userList.has(event.cancellerId)) {
            let u = userList.get(event.cancellerId).ranges.get(rangeTitle);
            u.cancelNumber++;
          }
        }
      }
    }
  }

  //loop thotigh availabilities for calculating the efficieny
  //Inside of this loop, loop through each range
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

    for (let w = 0; w < ranges.length; w++) {
      let currentStartInUTC = ranges[w][0];
      let currentEndInUTC = ranges[w][1];
      let currentIntervalTotalMinute = moment(currentEndInUTC).diff(
        moment(currentStartInUTC),
        'minutes',
      );
      let begin = moment(currentStartInUTC).format('MM/DD/YYYY');
      let end = moment(currentEndInUTC).format('MM/DD/YYYY');
      let rangeTitle = begin + ' - ' + end;
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

        if (s >= currentStartInUTC && s < currentEndInUTC) {
          isItValidAvailability = true;
          isTheBeginningInside = true;
          if (e <= currentEndInUTC) {
            isTheEndingInside = true;
          } else {
            duration = moment
              .utc(currentEndInUTC)
              .diff(moment.utc(s), 'minutes');
          }
        }

        if (
          e > currentStartInUTC &&
          e <= currentEndInUTC &&
          !isTheBeginningInside
        ) {
          isTheEndingInside = true;
          isItValidAvailability = true;
          duration = moment
            .utc(e)
            .diff(moment.utc(currentStartInUTC), 'minutes');
        }

        //if it lies increase our i
        if (isItValidAvailability) {
          let userInfoInThisRange = userList
            .get(availability.user.id)
            .ranges.get(rangeTitle);
          // if the only ending in range
          if (!isTheBeginningInside) {
            //fill the user available duration
            if (availability.available) {
              userInfoInThisRange.availableLine.push([1, duration]);
            } else {
              userInfoInThisRange.notavailableLine.push([1, duration]);
            }
            continue;
          }

          // if the only beginning in range
          if (!isTheEndingInside) {
            //fill the user available duration
            if (availability.available) {
              userInfoInThisRange.availableLine.push([
                currentIntervalTotalMinute + 1 - duration,
                currentIntervalTotalMinute,
              ]);
            } else {
              userInfoInThisRange.notavailableLine.push([
                currentIntervalTotalMinute + 1 - duration,
                currentIntervalTotalMinute,
              ]);
            }
          }

          // if fully inside
          let distanceOfStartingWithBeginning = moment
            .utc(s)
            .diff(moment.utc(currentStartInUTC), 'minutes');
          if (availability.available) {
            userInfoInThisRange.availableLine.push([
              distanceOfStartingWithBeginning + 1,
              distanceOfStartingWithBeginning + duration,
            ]);
          } else {
            userInfoInThisRange.notavailableLine.push([
              distanceOfStartingWithBeginning + 1,
              distanceOfStartingWithBeginning + duration,
            ]);
          }
        }
      }
    }
  }
  //format the userInfo
  for (let [id, u] of userList) {
    let ancestorBranches = u.ancestorBranches;
    let intervals = u.ranges;
    for (let [rangeTitle, UserInfoInRange] of intervals) {
      //calculate the effciency
      let totalAvailableTime = calculateUnionLengthOfIntervals(
        findIntervalsNotInArray2(
          UserInfoInRange.availableLine,
          UserInfoInRange.notavailableLine,
        ),
      );
      let totalActiveTime = calculateUnionLengthOfIntervals(
        UserInfoInRange.busyLine,
      );
      let totalBillableTime = calculateUnionLengthOfIntervals(
        UserInfoInRange.billableLine,
      );
      let totalNonBillableTime = calculateUnionLengthOfIntervals(
        UserInfoInRange.nonBillableline,
      );
      let totalProductiveTime = calculateUnionLengthOfIntervals(
        UserInfoInRange.productiveLine,
      );
      let totalShouldBeProductiveTime = calculateUnionLengthOfIntervals(
        UserInfoInRange.shouldBeBusyProductivLine,
      );

      let eff = 0;
      let prd = 0;
      let cancelRate = 0;
      let supervisionRate = 0;
      if (totalActiveTime > 0) {
        UserInfoInRange.total = Number((totalActiveTime / 60).toFixed(2));
        if (totalAvailableTime > 0) {
          //set efficiency level
          eff = Number(
            ((totalActiveTime / totalAvailableTime) * 100).toFixed(2),
          );
          if (eff > 100) {
            eff = 100;
          }
        } else {
          eff = 100;
        }
      }

      // calculate billable and non billable hours
      if (totalBillableTime > 0) {
        UserInfoInRange.totalBillable = Number(
          (totalBillableTime / 60).toFixed(2),
        );
      }

      if (totalNonBillableTime > 0) {
        UserInfoInRange.totalNonBillable = Number(
          (totalNonBillableTime / 60).toFixed(2),
        );
      }

      if (totalShouldBeProductiveTime > 0) {
        //set productivity level
        prd = Number(
          ((totalProductiveTime / totalShouldBeProductiveTime) * 100).toFixed(
            2,
          ),
        );
      }

      //set prd = 0 if that users is not going to be productivity calculated
      if (!calculateUserProductivity.get(id)) {
        prd = 0;
      }

      if (UserInfoInRange.cancelNumber > 0) {
        cancelRate = Number(
          (
            (UserInfoInRange.cancelNumber / UserInfoInRange.eventNumber) *
            100
          ).toFixed(2),
        );
      }

      // supervision calculation
      if (UserInfoInRange.mustCalculatedSupervisionDuration > 0) {
        supervisionRate = Number(
          (
            (UserInfoInRange.supervisedDuration /
              UserInfoInRange.mustCalculatedSupervisionDuration) *
            100
          ).toFixed(2),
        );
      }

      //convert the minutes to hours on each actiity and user and in total
      for (let [_, actTotal] of UserInfoInRange.totalPerActivity) {
        let currentActivityTotalTime = calculateUnionLengthOfIntervals(
          actTotal.eventLine,
        );
        actTotal.total = currentActivityTotalTime;
        if (actTotal.total > 0) {
          actTotal.total = Number((actTotal.total / 60).toFixed(2));
        }
      }

      // fill the totalPerTotaltypeOfEachUser
      for (let [id, actTotal] of UserInfoInRange.totalPerActivity) {
        for (let h = 0; h < totalTypeActivities.length; h++) {
          if (totalTypeActivities[h].activityIds.includes(id)) {
            let tt = UserInfoInRange.totalPerTotalType.get(
              totalTypeActivities[h].id,
            );
            tt.eventLine.push(...actTotal.eventLine);
          }
        }
      }

      //convert the minutes to hours on each totalType of user
      for (let [_, totalTypeTotal] of UserInfoInRange.totalPerTotalType) {
        let currentTotalTypeTotalTime = calculateUnionLengthOfIntervals(
          totalTypeTotal.eventLine,
        );
        totalTypeTotal.total = currentTotalTypeTotalTime;
        if (totalTypeTotal.total > 0) {
          totalTypeTotal.total = Number((totalTypeTotal.total / 60).toFixed(2));
        }
      }

      for (let q = 0; q < ancestorBranches.length; q++) {
        if (!branchList.has(ancestorBranches[q])) {
          continue;
        }

        let currentAncestorOfUser = branchList.get(ancestorBranches[q]);
        let currentRange = currentAncestorOfUser.ranges.get(rangeTitle);

        // total
        currentRange.total += UserInfoInRange.total;

        // efficiency
        if (eff > 0) {
          currentRange.efficiency += eff;
          currentRange.efficiencyCalculatedUser += 1;
        }

        // productivity
        if (prd > 0) {
          currentRange.productivity += prd;
          currentRange.productivityCalculatedUser += 1;
        }

        // cancellation rate
        currentRange.cancellationRate += cancelRate;
        currentRange.cancellationRateCalculatedUser += 1;

        // supervision rate
        currentRange.supervisionRate += supervisionRate;
        currentRange.supervisionRateCalculatedUser += 1;

        // per activity
        for (let [activityId, data] of UserInfoInRange.totalPerActivity) {
          let branchInfoInRangePerActivity =
            currentRange.totalPerActivity.get(activityId);
          branchInfoInRangePerActivity.total += data.total;
        }

        // per activity
        for (let [totaltypId, data] of UserInfoInRange.totalPerTotalType) {
          let branchInfoInRangePerTotalType =
            currentRange.totalPerTotalType.get(totaltypId);
          branchInfoInRangePerTotalType.total += data.total;
        }

        // billable
        currentRange.totalBillable += UserInfoInRange.totalBillable;

        // non-billable
        currentRange.totalNonBillable += UserInfoInRange.totalNonBillable;
      }
    }
  }
  //format the columnData
  for (let [_, act] of activityListMap) {
    act.total = Number((act.total / 60).toFixed(2));
    columnData.push({
      id: act.id,
      name: act.name,
      color: act.color,
      total: act.total,
    });
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
  for (let [id, b] of branchList) {
    let branchData = {
      id: id,
      name: b.name,
      total: 0,
      totalBillable: 0,
      totalNonBillable: 0,
      efficiency: 0,
      productivity: 0,
      cancellationRate: 0,
      supervisionRate: 0,
      subRows: new Array(),
    };

    // fill the total and average data for subrows and main branch
    for (let [title, interval] of b.ranges) {
      let subRow = {
        parentId: id,
        name: title,
        total: interval.total,
        totalBillable: interval.totalBillable,
        totalNonBillable: interval.totalNonBillable,
        efficiency: 0,
        productivity: 0,
        cancellationRate: 0,
        supervisionRate: 0,
      };

      // calculate the avg efficiency of branch in specific range
      if (interval.efficiencyCalculatedUser > 0) {
        subRow.efficiency = Number(
          (interval.efficiency / interval.efficiencyCalculatedUser).toFixed(2),
        );
      }

      // calculate the avg productivity of branch in specific range
      if (interval.productivityCalculatedUser > 0) {
        subRow.productivity = Number(
          (interval.productivity / interval.productivityCalculatedUser).toFixed(
            2,
          ),
        );
      }

      // calculate the avg cancellation rate of branch in specific range
      if (interval.cancellationRateCalculatedUser > 0) {
        subRow.cancellationRate = Number(
          (
            interval.cancellationRate / interval.cancellationRateCalculatedUser
          ).toFixed(2),
        );
      }

      // calculate the avg supervision rate of branch in specific range
      if (interval.supervisionRateCalculatedUser > 0) {
        subRow.supervisionRate = Number(
          (
            interval.supervisionRate / interval.supervisionRateCalculatedUser
          ).toFixed(2),
        );
      }
      // rewrite here totals in subRow to not break old logic, beause we use old logic for calculating efficiency and productivity
      subRow.total = 0
      subRow.totalBillable = 0;
      subRow.totalNonBillable = 0;

      // set all totalTypeActivities to subRow. they all must exist in subrow to form table in FE. otherwise FE will be broken
      for (let g = 0; g < totalTypeActivities.length; g++) {
        subRow[totalTypeActivities[g].id] = {
          total: 0
        }
      }

      interval.totalPerActivity = new Map();
      interval.totalPerTotalType = new Map();
      for (let [_, event] of eventsList) {
        if (!event.eventBranches.has(id)) {
          continue
        }
        let eventRanges = event.rangesForEvent
        let dataOfEventInRange = eventRanges.get(title)
        subRow.total += dataOfEventInRange.total
        subRow.totalBillable += dataOfEventInRange.totalBillable;
        subRow.totalNonBillable += dataOfEventInRange.totalNonBillable;

        if (!subRow[dataOfEventInRange.activity.id]) {
          subRow[dataOfEventInRange.activity.id] = {
            total: 0,
          };
        }
        subRow[dataOfEventInRange.activity.id].total += dataOfEventInRange.activity.total;

        if (!interval.totalPerActivity.has(dataOfEventInRange.activity.id)) {
          interval.totalPerActivity.set(dataOfEventInRange.activity.id, {
            total: 0,
          });
        }
        interval.totalPerActivity.get(dataOfEventInRange.activity.id).total += dataOfEventInRange.activity.total

        let totalByTotalType = dataOfEventInRange.totalByTotalType
        for (let [totalTypeId, data] of totalByTotalType){
          if (!subRow[totalTypeId]) {
            subRow[totalTypeId] = {
              name : data.name,
              total: 0
            }
          }
          subRow[totalTypeId].total += data.total

          if (!interval.totalPerTotalType.has(totalTypeId)) {
            interval.totalPerTotalType.set(totalTypeId, {
              name :data.name,
              total:0
            })
          }
          interval.totalPerTotalType.get(totalTypeId).total += data.total
        }
      }
      // Add missing activities with total 0 to not brak FE
      for (let [activityId, data] of activityListMap) {
        if (!subRow[activityId]) {
          subRow[activityId] = {
            total: 0,
          };
        }
        if (!interval.totalPerActivity.has(activityId)) {
          interval.totalPerActivity.set(activityId, {total:0})
        }
      }


      // add subrow data to main branch
      branchData.total += subRow.total;
      branchData.totalBillable += subRow.totalBillable;
      branchData.totalNonBillable += subRow.totalNonBillable;
      branchData.efficiency += subRow.efficiency;
      branchData.productivity += subRow.productivity;
      branchData.cancellationRate += subRow.cancellationRate;
      branchData.supervisionRate += subRow.supervisionRate;

      for (let [activityId, data] of interval.totalPerActivity) {
        let mainBranchInfoInRangePerActivity =
          b.totalPerActivity.get(activityId);
        mainBranchInfoInRangePerActivity.total += data.total;
      }

      for (let [totaltypeId, data] of interval.totalPerTotalType) {
        let mainBranchInfoInRangePerTotalType =
          b.totalPerTotalType.get(totaltypeId);
        mainBranchInfoInRangePerTotalType.total += data.total;
      }

      const obj = Object.fromEntries(interval.totalPerActivity);
      subRow = {
        ...subRow,
        ...obj,
      };

      const obj2 = Object.fromEntries(interval.totalPerTotalType);
      subRow = {
        ...subRow,
        ...obj2,
      };

      branchData.subRows.push(subRow);
    }

    const obj = Object.fromEntries(b.totalPerActivity);
    branchData = {
      ...branchData,
      ...obj,
    };

    const obj2 = Object.fromEntries(b.totalPerTotalType);
    branchData = {
      ...branchData,
      ...obj2,
    };

    // calculate the average and
    // ceil to 2 decimals on
    // efficiency, productivity, cancellationRate, supervisionRate in branch
    let rangeNumber = branchData.subRows.length;
    if (rangeNumber > 0) {
      branchData.efficiency = Number(
        (branchData.efficiency / rangeNumber).toFixed(2),
      );
      branchData.productivity = Number(
        (branchData.productivity / rangeNumber).toFixed(2),
      );
      branchData.cancellationRate = Number(
        (branchData.cancellationRate / rangeNumber).toFixed(2),
      );
      branchData.supervisionRate = Number(
        (branchData.supervisionRate / rangeNumber).toFixed(2),
      );
    }

    // ceil to 2 decimals on total
    branchData.total = Number(branchData.total.toFixed(2));

    branchStatsPerActivity.push(branchData);
  }

  columnData.sort((a, b) => b.total - a.total);
  return {
    columnData,
    branchStatsPerActivity,
  };
}

// Dashboard (NEW)
router.get('/dashboard', async (req, res) => {
  // set companyId from req.currentUser
  req.query.companyId = req.currentUser.companyId;
  if (!req.query.start || !req.query.end || !req.query.companyId) {
    res.status(400).send({ code: 400, message: 'bad request' });
    return;
  }
  try {
    let startInUTC = moment.utc(req.query.start).toDate();
    let endInUTC = moment.utc(req.query.end).toDate();

    let roleList = [];
    let subgroupList = [];
    let branchList = [];

    //set role set
    if (req.query.roles) {
      const roles = req.query.roles.split('|');
      // Fetch from backend
      const roleHierarchy = await getRoleHierarchy(req.query.companyId);
      Object.entries(roleHierarchy).map((t) => {
        const [key, value] = t;
        if (checkIntersection(roles, value)) {
          roleList.push(key);
        }
      });
    }

    //set subgroup set
    if (req.query.subgroups) {
      subgroupList = req.query.subgroups.split('|');
    }

    //set branch set
    if (req.query.branches) {
      // Fetch from backend
      branchList = await getDescendentBranches(req.query.branches);
    }

    let todaysTotalEvents = 0;
    let todaysTotalDurationOfEvents = 0;
    let emplooyeesNumber = 0;
    let clientsNumber = 0;
    let todaysActivityDurations = {
      series: [],
      colors: [],
      times: timesArray,
    };

    const today = await getDaysStatsForDashboardHourly(
      startInUTC,
      endInUTC,
      req.query.companyId,
      branchList,
      subgroupList,
      roleList,
    );

    // Fetch from backend
    const userCount = await getEmployeeClientNumber(
      req.query.companyId,
      branchList,
      subgroupList,
    );

    //set today's data
    todaysTotalEvents = today.todaysTotalEvents;
    todaysTotalDurationOfEvents = today.todaysTotalDurationOfEvents;
    todaysActivityDurations = today.todaysActivityDurations;

    //set employee numbers
    emplooyeesNumber = userCount.data.employee;
    clientsNumber = userCount.data.client;

    res.status(200).send({
      todaysTotalEvents,
      todaysTotalDurationOfEvents,
      emplooyeesNumber,
      clientsNumber,
      todaysActivityDurations,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ code: 500, message: 'Internal Server Error' });
  }
});

// Charts (NEW)
router.get('/charts', async (req, res) => {
  // set companyId from req.currentUser
  req.query.companyId = req.currentUser.companyId;
  if (!req.query.startWeek || !req.query.companyId) {
    res.status(400).send({ code: 400, message: 'bad request' });
    return;
  }
  try {
    let startOfWeekInUTC = moment.utc(req.query.startWeek).toDate();
    let subgroupID = req.query.subgroupId || '';

    let roleList = [];
    let subgroupList = [];
    let branchList = [];

    //set role set
    if (req.query.roles) {
      const roles = req.query.roles.split('|');
      // Fetch from backend
      let roleHierarchy = await getRoleHierarchy(req.query.companyId);
      Object.entries(roleHierarchy).map((t) => {
        const [key, value] = t;
        if (checkIntersection(roles, value)) {
          roleList.push(key);
        }
      });
    }

    //set subgroup set
    if (req.query.subgroups) {
      subgroupList = req.query.subgroups.split('|');
    }

    //set branch set
    if (req.query.branches) {
      // Fetch from backend
      branchList = await getDescendentBranches(req.query.branches);
    }

    const datesOfRange = [
      moment.utc(req.query.startWeek).format(WEEKLY_DATE_RANGE_FORMAT),
      moment
        .utc(req.query.startWeek)
        .add(1, 'days')
        .format(WEEKLY_DATE_RANGE_FORMAT),
      moment
        .utc(req.query.startWeek)
        .add(2, 'days')
        .format(WEEKLY_DATE_RANGE_FORMAT),
      moment
        .utc(req.query.startWeek)
        .add(3, 'days')
        .format(WEEKLY_DATE_RANGE_FORMAT),
      moment
        .utc(req.query.startWeek)
        .add(4, 'days')
        .format(WEEKLY_DATE_RANGE_FORMAT),
      moment
        .utc(req.query.startWeek)
        .add(5, 'days')
        .format(WEEKLY_DATE_RANGE_FORMAT),
      moment
        .utc(req.query.startWeek)
        .add(6, 'days')
        .format(WEEKLY_DATE_RANGE_FORMAT),
    ];

    let appointmentsCount = {
      series: [0, 0, 0, 0, 0, 0, 0],
      dates: datesOfRange,
    };
    let activitiesDurations = {
      series: [],
      dates: datesOfRange,
      colors: [],
    };
    let efficiency = {
      series: {
        productivity: {
          name: 'Productivity',
          data: [0, 0, 0, 0, 0, 0, 0],
        },
        efficiency: {
          name: 'Efficiency',
          data: [0, 0, 0, 0, 0, 0, 0],
        },
      },
      dates: datesOfRange,
    };
    let capacity = {
      series: [],
      colors: [],
    };
    const a = await getWeeksStatsForDashboard(
      startOfWeekInUTC,
      moment.utc(startOfWeekInUTC).add(7, 'days').toDate(),
      req.query.companyId,
      branchList,
      subgroupList,
      roleList,
      subgroupID,
    );

    appointmentsCount = a.appointmentsCount;
    appointmentsCount.dates = datesOfRange;
    activitiesDurations = a.activitiesDurations;
    activitiesDurations.dates = datesOfRange;
    capacity = a.capacity;
    efficiency = a.efficiency;
    efficiency.dates = datesOfRange;

    res.status(200).send({
      appointmentsCount,
      activitiesDurations,
      efficiency,
      capacity,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ code: 500, message: 'Internal Server Error' });
  }
});

// For comparing two branches efficiency and productivity (NEW)
router.get('/prodcutivity-efficiency-branch', async (req, res) => {
  // set companyId from req.currentUser
  req.query.companyId = req.currentUser.companyId;
  if (!req.query.startWeek || !req.query.companyId) {
    res.status(400).send({ code: 400, message: 'bad request' });
    return;
  }
  try {
    let startOfWeekInUTC = moment.utc(req.query.startWeek).toDate();
    let subgroupID = req.query.subgroupId || '';

    let roleList = [];
    let subgroupList = [];
    let branchList = [];

    //set role set
    if (req.query.roles) {
      const roles = req.query.roles.split('|');
      // Fetch from backend
      let roleHierarchy = await getRoleHierarchy(req.query.companyId);
      Object.entries(roleHierarchy).map((t) => {
        const [key, value] = t;
        if (checkIntersection(roles, value)) {
          roleList.push(key);
        }
      });
    }

    if (req.query.subgroups) {
      subgroupList = req.query.subgroups.split('|');
    }

    //set branch set
    if (req.query.branches) {
      // Fetch from backend
      branchList = await getDescendentBranches(req.query.branches);
    }

    const datesOfRange = [
      moment.utc(req.query.startWeek).format(WEEKLY_DATE_RANGE_FORMAT),
      moment
        .utc(req.query.startWeek)
        .add(1, 'days')
        .format(WEEKLY_DATE_RANGE_FORMAT),
      moment
        .utc(req.query.startWeek)
        .add(2, 'days')
        .format(WEEKLY_DATE_RANGE_FORMAT),
      moment
        .utc(req.query.startWeek)
        .add(3, 'days')
        .format(WEEKLY_DATE_RANGE_FORMAT),
      moment
        .utc(req.query.startWeek)
        .add(4, 'days')
        .format(WEEKLY_DATE_RANGE_FORMAT),
      moment
        .utc(req.query.startWeek)
        .add(5, 'days')
        .format(WEEKLY_DATE_RANGE_FORMAT),
      moment
        .utc(req.query.startWeek)
        .add(6, 'days')
        .format(WEEKLY_DATE_RANGE_FORMAT),
    ];

    let efficiency = {
      series: {
        productivity: {
          name: 'Productivity',
          data: [0, 0, 0, 0, 0, 0, 0],
        },
        efficiency: {
          name: 'Efficiency',
          data: [0, 0, 0, 0, 0, 0, 0],
        },
      },
      dates: datesOfRange,
    };

    const a = await getWeeksProductivityEfficiencyForDashboard(
      startOfWeekInUTC,
      moment.utc(startOfWeekInUTC).add(7, 'days').toDate(),
      req.query.companyId,
      branchList,
      subgroupList,
      roleList,
      subgroupID,
    );

    efficiency = a.efficiency;
    efficiency.dates = datesOfRange;

    res.status(200).send({
      efficiency,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ code: 500, message: 'Internal Server Error' });
  }
});

// Activity Table Grouped (NEW)
router.get('/activity-table-grouped', async (req, res) => {
  if (!req.query.start || !req.query.end) {
    res.status(400).send({ code: 400, message: 'bad request' });
    return;
  }
  // set companyId from req.currentUser
  req.query.companyId = req.currentUser.companyId;

  try {
    let startInUTC = moment.utc(req.query.start).toDate();
    let endInUTC = moment.utc(req.query.end).toDate();
    let ranges = new Array();

    if (req.query.period === 'weekly') {
      let beginning = moment(
        moment(startInUTC).startOf('Week').format('YYYY-MM-DD HH:mm:ssZ'),
      ).toDate();
      let ending = moment(
        moment(endInUTC).endOf('Week').format('YYYY-MM-DD HH:mm:ssZ'),
      ).toDate();
      while (beginning < ending) {
        let currentInterval = new Array();
        // add the begin
        currentInterval.push(beginning);

        // add the end
        currentInterval.push(
          moment(
            moment(beginning).endOf('Week').format('YYYY-MM-DD HH:mm:ssZ'),
          ).toDate(),
        );
        //change the beginning pointer to the next week
        beginning = moment(beginning).add(1, 'weeks').startOf('Week').toDate();

        ranges.push(currentInterval);
      }
    }

    if (req.query.period === 'monthly') {
      let beginning = moment(
        moment(startInUTC).startOf('Month').format('YYYY-MM-DD HH:mm:ssZ'),
      ).toDate();
      let ending = moment(
        moment(endInUTC).endOf('Month').format('YYYY-MM-DD HH:mm:ssZ'),
      ).toDate();
      while (beginning < ending) {
        let currentInterval = new Array();
        // add the begin
        currentInterval.push(beginning);

        // add the end
        currentInterval.push(
          moment(
            moment(beginning).endOf('Month').format('YYYY-MM-DD HH:mm:ssZ'),
          ).toDate(),
        );
        //change the beginning pointer to the next week
        beginning = moment(beginning)
          .add(1, 'months')
          .startOf('Month')
          .toDate();

        ranges.push(currentInterval);
      }
    }

    let roleList = [];
    let subgroupList = [];
    let branchList = [];
    let userList = [];
    let type = 'appointments';
    let period = req.query.period || 'weekly';

    //set role set
    if (req.query.roles) {
      const roles = req.query.roles.split('|');
      // Fetch from backend
      const roleHierarchy = await getRoleHierarchy(req.query.companyID);
      Object.entries(roleHierarchy).map((t) => {
        const [key, value] = t;
        if (checkIntersection(roles, value)) {
          roleList.push(key);
        }
      });
    }

    //set subgroup set
    if (req.query.subgroups) {
      subgroupList = req.query.subgroups.split('|');
    }

    //set user set
    if (req.query.users) {
      userList = req.query.users.split('|');
    }

    //set branch set
    if (req.query.branches) {
      // Fetch from backend
      branchList = await getDescendentBranches(req.query.branches);
    }

    const result = await getUserActivityTableDuringDateRangeGrouped(
      ranges[0][0],
      ranges[ranges.length - 1][1],
      req.query.companyId,
      branchList,
      subgroupList,
      roleList,
      userList,
      type,
      ranges,
    );

    res.status(200).send({
      rows: result.branchStatsPerActivity,
      columns: result.columnData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ code: 500, message: 'Internal Server Error' });
  }
});

// Authorization Table (NEW)
router.get('/authorization-table', async (req, res) => {
  try {
    let branchList = [];
    // set companyId from req.currentUser
    const companyId = req.currentUser.companyId;
    //set branch set
    if (req.query.branches) {
      // Fetch from backend
      branchList = await getDescendentBranches(req.query.branches);
    }

    //get constraints
    const constraints =
      await NewconstraintgeneratorDBApi.findAuthorazitionsOfBranch({
        ...req.query,
        branches: branchList,
        companyId: companyId,
      });
    let response = new Array();

    //loop through constraints
    for (let i = 0; i < constraints.count; i++) {
      let c = constraints.rows[i];
      let userAuth = {
        user: c.antecedentUser,
        userName: `${c.antecedentUser?.firstName} ${c.antecedentUser?.lastName}`,
        activity: c.antecedentTypeActivity,
        activityName: c.antecedentTypeActivity?.firstName,
        start: c.start,
        end: c.end,
        units: c.units,
        timeUsed: 0,
        timeRemaining: c.max,
        rollOver: 0,
        authUtilization: 0,
        timeUtilization: 0,
        utilizationDifference: 0,
      };

      let currentDate = moment.utc().startOf('day').toDate();
      let endDate = moment.utc(c.end).startOf('day').toDate();
      let startDate = moment.utc(c.start).startOf('day').toDate();
      let startOfThisWeek = moment(getStartOfWeekOfDate(currentDate)).format(
        'YYYY-MM-DD',
      );

      let startOfEndDatesWeek = moment(getStartOfWeekOfDate(endDate)).format(
        'YYYY-MM-DD',
      );

      // seg time remaining
      // (except last day)
      let remainingMinutes =
        moment(endDate).diff(currentDate, 'minutes') - 24 * 60;

      let remainingDays = remainingMinutes / (24 * 60);
      if (remainingDays < 0) {
        remainingDays = 0;
      }

      // (include current day)
      let passedMinutes =
        moment(currentDate).diff(startDate, 'minutes') + 24 * 60;
      let passedDays = passedMinutes / (24 * 60);
      if (passedDays < 0) {
        passedDays = 0;
      }

      //total day count
      let totalminutes = moment(endDate).diff(startDate, 'minutes');
      let totalDays = totalminutes / (24 * 60);

      // set time utilization
      if (remainingDays === 0) {
        userAuth.timeUtilization = 100;
      }

      if (passedDays === 0) {
        userAuth.timeUtilization = 0;
      }

      if (passedDays > 0 && remainingDays > 0) {
        userAuth.timeUtilization = Number(
          ((passedDays / totalDays) * 100).toFixed(2),
        );
      }

      // set total passed event duration
      let totalUsedSecond = 0;
      let totalActualTime = c.max;
      let totalActualTimeWeek = c.min;
      if (passedDays !== 0) {
        // (get minimal upper bound)
        let endDateOfEvents = moment.utc(currentDate).add(1, 'days').toDate();
        if (endDateOfEvents > endDate) {
          endDateOfEvents = endDate;
        }
        if (!c.antecedentUser || !c.antecedentTypeActivity) {
          continue;
        }
        const eventListData =
          await EventsDBApi.findAllEventsForAuthTableDateRange({
            start: startDate,
            end: endDateOfEvents,
            userId: c.antecedentUser.id,
            activity: c.antecedentTypeActivity.id,
          });

        //filter cancelled events
        const filteredEvents = eventListData.rows.filter((e) => !e.isCancelled);

        // loop through events for calculating the info
        for (let i = 0; i < filteredEvents.length; i++) {
          let event = filteredEvents[i];

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

            let isTheEndingInside = false;
            let isTheBeginningInside = false;
            let isItValidEvent = false;
            //check if the event lies in our range
            let s;
            let e;
            s = allEventsWithRule[p];
            e = moment
              .utc(allEventsWithRule[p])
              .add(duration, 'minutes')
              .toDate();

            if (s >= startDate && s < endDateOfEvents) {
              isItValidEvent = true;
              isTheBeginningInside = true;
              if (e <= endDateOfEvents) {
                isTheEndingInside = true;
              } else {
                duration = moment
                  .utc(endDateOfEvents)
                  .diff(moment.utc(s), 'minutes');
              }
            }

            if (
              e > startDate &&
              e <= endDateOfEvents &&
              !isTheBeginningInside
            ) {
              isTheEndingInside = true;
              isItValidEvent = true;
              duration = moment.utc(e).diff(moment.utc(startDate), 'minutes');
            }

            //if it lies increase our i
            if (isItValidEvent) {
              totalUsedSecond += duration * 60;
            }
          }
        }
      }
      // add offset to totalUsedSecond. c.offset is also saved in seconds
      totalUsedSecond += c.offset
      
      //set the used time duration
      if (c.units === 'hours') {
        totalActualTime = Number((c.max / 3600).toFixed(2));
        userAuth.timeUsed = Number((totalUsedSecond / 3600).toFixed(2));
      }
      if (c.units === 'minutes') {
        totalActualTime = Number((c.max / 60).toFixed(2));
        userAuth.timeUsed = Number((totalUsedSecond / 60).toFixed(2));
      }
      if (c.units === 'unit') {
        totalActualTime = Number((c.max / 900).toFixed(2));
        userAuth.timeUsed = Number((totalUsedSecond / 900).toFixed(2));
      }

      //set remaining duration
      userAuth.timeRemaining = Number(
        (totalActualTime - userAuth.timeUsed).toFixed(2),
      );

      //set remaining duration for this week
      userAuth.timeRemainingThisWeek = 0;
      // DO NOT FORGET ,I AM CALCULATING THE EVENTS BETWEEN [start_of_constriant, current_day]
      // if this week matters then it is obvious that passedays must be positive because  current_day must be later than start_of_constriant
      // if remainingDays is 0 then constraint is ended. Here the mattering events are in [start_of_constriant, end_of_constriant]
      // In this case if this week matters then it should be same week with the ending,
      // if it is not same week, then no event on this week matters
      if (
        passedDays > 0 &&
        (startOfThisWeek === startOfEndDatesWeek || remainingDays > 0)
      ) {
        userAuth.timeRemainingThisWeek = Number(
          (totalActualTimeWeek - userAuth.timeUsedThisWeek).toFixed(2),
        );
      }

      //set auth utilization
      userAuth.authUtilization = Number(
        ((userAuth.timeUsed / totalActualTime) * 100).toFixed(2),
      );

      //set utilization difference
      userAuth.utilizationDifference = Number(
        (userAuth.authUtilization - userAuth.timeUtilization).toFixed(2),
      );

      //set rollover
      if (userAuth.utilizationDifference < 0) {
        userAuth.rollOver = Number(
          ((-userAuth.utilizationDifference * totalActualTime) / 100).toFixed(
            2,
          ),
        );
      }

      userAuth.authUtilization = userAuth.authUtilization + '%';
      userAuth.utilizationDifference = userAuth.utilizationDifference + '%';
      userAuth.timeUtilization = userAuth.timeUtilization + '%';

      response.push(userAuth);
    }

    res.status(200).send(response);
  } catch (error) {
    console.log(error);
    res.status(500).send({ code: 500, message: 'Internal Server Error' });
  }
});

module.exports = router;
