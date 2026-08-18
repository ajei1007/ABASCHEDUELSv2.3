const moment = require('moment');
const rule_RRule = require('rrule');
const EventsDBApi = require('../db/api/events');
const moment2 = require('moment-timezone');
const { getDays } = require('../utils/schedulerUtils')
const generateDateStrings = require('./generateDateStrings')

function checkIntersection(arr1, arr2) {
  return arr1.some((item) => arr2.includes(item));
}

function findDateIntersection(arr1, arr2) {
  const intersection = [];

  for (const date1 of arr1) {
    for (const date2 of arr2) {
      if (
        date1.getTime() === date2.getTime() &&
        !intersection.some((d) => d.getTime() === date1.getTime())
      ) {
        intersection.push(date1);
        break;
      }
    }
  }

  return intersection;
}

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

async function getTimeconstraintUserRelation(data) {
  const roleHierarchy = data.roleHierarchy;
  let timeConstraint = data.timeconstraint;
  let startOfConstraint = moment.utc(timeConstraint.start).toDate();
  let endOfConstraint = moment.utc(timeConstraint.end).toDate();

  let consequenceUserId = timeConstraint.consequenceUserId;
  let consequenceSubgroupId = timeConstraint.consequenceSubgroupId;
  let consequenceRoleHierarchy = [];

  if (!data.consequenceRoleHierarchy) {
    Object.entries(roleHierarchy).map((t) => {
      const [key, value] = t;
      //push the decendents
      if (
        timeConstraint.consequenceRole &&
        checkIntersection([timeConstraint.consequenceRole.name], value)
      ) {
        consequenceRoleHierarchy.push(key);
      }
    });
  } else {
    consequenceRoleHierarchy = data.consequenceRoleHierarchy;
  }

  if (timeConstraint.frequency === 'day') {
    let startOfRange = moment.utc(data.date).toDate();
    let endOfRange = moment.utc(data.date).add(1, 'days').toDate();
    let usersOccupiedHours = {
      totalMinute: 0,
      userPairs: new Map(),
    };

    let result;
    if (!data.events) {
      result = await EventsDBApi.findAllEventsOfUserForConstraintBreakCheck({
        start: startOfRange,
        end: endOfRange,
        userId: data.userId,
      });

      const filteredEvents = result.rows.filter((e) => !e.isCancelled);

      result.rows = filteredEvents;
      result.count = filteredEvents.length;
    } else {
      result = data.events;
    }

    for (let j = 0; j < result.count; j++) {
      let event = result.rows[j];
      if (timeConstraint.antecedentLocationId) {
        if (
          event.location0 === null ||
          timeConstraint.antecedentLocationId !== event.location0.id
        ) {
          continue;
        }
      }

      if (timeConstraint.antecedentTypeActivityId) {
        if (timeConstraint.antecedentTypeActivityId !== event.activity0.id) {
          continue;
        }
      }

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

      let rruleObject = {
        freq: rule_RRule.RRule[event.frequency.toUpperCase()],
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
      let allEventsWithRule = rule.between(startOfRange, endOfRange, true);
      for (let p = 0; p < allEventsWithRule.length; p++) {
        let calculatedUserIds = new Array();
        let duration = calculateMinutesBetweenTimesIgnoreDates(
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

        let createdInDaylightSaving = moment(event.start).isDST();
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

        if (s >= startOfRange && s < endOfRange) {
          isTheBeginningInside = true;
          if (e <= endOfRange) {
            isTheEndingInside = true;
          } else {
            duration = moment.utc(endOfRange).diff(moment.utc(s), 'minutes');
          }
        }

        if (!isTheBeginningInside) {
          if (e > startOfRange && e <= endOfRange) {
            isTheEndingInside = true;
            duration = moment.utc(e).diff(moment.utc(startOfRange), 'minutes');
          }
        }
        let totalIsAdded = false;

        if (isTheBeginningInside || isTheEndingInside) {
          for (let i = 0; i < event.users.length; i++) {
            let currentUser = event.users[i];
            calculatedUserIds.push(currentUser.id);
            if (currentUser.id === data.userId) {
              continue;
            }
            //check the id
            if (consequenceUserId) {
              if (currentUser.id !== consequenceUserId) {
                continue;
              }
            }
            //check the role
            if (consequenceRoleHierarchy.length > 0) {
              let usersRoles = currentUser.roles.map((role) => role.name);
              if (!checkIntersection(usersRoles, consequenceRoleHierarchy)) {
                continue;
              }
            }

            //check the subgroups
            if (consequenceSubgroupId) {
              let userSubgroups = currentUser.subgroups.map((sbg) => sbg.id);
              if (!checkIntersection(userSubgroups, [consequenceSubgroupId])) {
                continue;
              }
            }
            if (!totalIsAdded) {
              usersOccupiedHours.totalMinute += duration;
              totalIsAdded = true;
            }
            if (!usersOccupiedHours.userPairs.has(currentUser.id)) {
              usersOccupiedHours.userPairs.set(currentUser.id, {
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                duration: 0,
              });
            }

            let currentUserInfo = usersOccupiedHours.userPairs.get(
              currentUser.id,
            );
            currentUserInfo.duration += duration;
          }

          let shouldAddActivity = true;
          let shouldAddLocation = !!event.location0;

          //check the id of activity and location
          if (consequenceUserId) {
            if (event.activity0.id !== consequenceUserId) {
              shouldAddActivity = false;
            }

            if (event.location0 && event.location0.id !== consequenceUserId) {
              shouldAddLocation = false;
            }
          }
          //check the role of activity and location
          if (consequenceRoleHierarchy.length > 0) {
            let activityRoles = event.activity0.roles.map((role) => role.name);
            let locationRoles = [];
            if (event.location0 !== null) {
              locationRoles = event.location0.roles.map((role) => role.name);
            }
            if (!checkIntersection(activityRoles, consequenceRoleHierarchy)) {
              shouldAddActivity = false;
            }

            if (!checkIntersection(locationRoles, consequenceRoleHierarchy)) {
              shouldAddLocation = false;
            }
          }

          //check the subgroups of activity and location
          if (consequenceSubgroupId) {
            let activitySubgroups = event.activity0.subgroups.map(
              (sbg) => sbg.id,
            );

            let locationSubgroups = [];
            if (event.location0 !== null) {
              locationSubgroups = event.location0.subgroups.map(
                (sbg) => sbg.id,
              );
            }
            if (
              !checkIntersection(activitySubgroups, [consequenceSubgroupId])
            ) {
              shouldAddActivity = false;
            }

            if (
              !checkIntersection(locationSubgroups, [consequenceSubgroupId])
            ) {
              shouldAddLocation = false;
            }
          }

          if (
            shouldAddActivity &&
            calculatedUserIds.includes(event.activity0.id)
          ) {
            shouldAddActivity = false;
          }

          if (
            shouldAddLocation &&
            event.location0 &&
            calculatedUserIds.includes(event.location0.id)
          ) {
            shouldAddLocation = false;
          }

          if (
            !totalIsAdded &&
            ((shouldAddLocation && event.location0) || shouldAddActivity)
          ) {
            usersOccupiedHours.totalMinute += duration;
            totalIsAdded = true;
          }

          //add activity
          if (shouldAddActivity) {
            if (!usersOccupiedHours.userPairs.has(event.activity0.id)) {
              usersOccupiedHours.userPairs.set(event.activity0.id, {
                firstName: event.activity0.firstName,
                lastName: null,
                duration: 0,
              });
            }

            let activityUserInfo = usersOccupiedHours.userPairs.get(
              event.activity0.id,
            );
            activityUserInfo.duration += duration;
          }

          //add location
          if (event.location0 && shouldAddLocation) {
            if (!usersOccupiedHours.userPairs.has(event.location0.id)) {
              usersOccupiedHours.userPairs.set(event.location0.id, {
                firstName: event.location0.firstName,
                lastName: null,
                duration: 0,
              });
            }

            let locationUserInfo = usersOccupiedHours.userPairs.get(
              event.location0.id,
            );
            locationUserInfo.duration += duration;
          }
        }
      }
    }

    if (timeConstraint.consequenceTypeEachOrAll === 'each') {
      let timeConstraintRelations = {
        consequenceTypeEachOrAll: 'each',
        timeconstraintFrequency: timeConstraint.frequency,
        min: timeConstraint.min,
        max: timeConstraint.max,
        userPairsRelations: [],
        totalRelation: [],
        sessionRelations: [],
      };
      for (let [userId, info] of usersOccupiedHours.userPairs) {
        timeConstraintRelations.userPairsRelations.push({
          userId: userId,
          firstName: info.firstName,
          lastName: info.lastName,
          actual: info.duration * 60,
        });
      }

      return timeConstraintRelations;
    }

    if (timeConstraint.consequenceTypeEachOrAll === 'all') {
      let timeConstraintRelations = {
        consequenceTypeEachOrAll: 'all',
        timeconstraintFrequency: timeConstraint.frequency,
        min: timeConstraint.min,
        max: timeConstraint.max,
        userPairsRelations: [],
        totalRelation: [],
        sessionRelations: [],
      };
      timeConstraintRelations.totalRelation.push({
        actual: Number(usersOccupiedHours.totalMinute * 60),
      });

      return timeConstraintRelations;
    }
  }

  if (timeConstraint.frequency === 'week') {
    let calledDate = moment.utc(data.date).toDate();

    let weekDayOfDate = calledDate.getUTCDay();
    let addDayForReachingTheStart = 1 - weekDayOfDate;
    let addDayForReachingTheEnd = 7 - weekDayOfDate;

    if (addDayForReachingTheStart > 0) {
      addDayForReachingTheStart -= 7;
    }

    addDayForReachingTheEnd = addDayForReachingTheEnd % 7;

    // get the called date's week start and end dates
    startOfWeek = moment
      .utc(data.date)
      .add(addDayForReachingTheStart, 'days')
      .toDate();
    endOfWeek = moment
      .utc(data.date)
      .add(addDayForReachingTheEnd + 1, 'days')
      .toDate();
    // trim the interval if the week is not fully in interval
    if (startOfWeek < startOfConstraint) {
      startOfWeek = startOfConstraint;
    }

    if (endOfWeek > endOfConstraint) {
      endOfWeek = endOfConstraint;
    }

    let usersOccupiedHours = {
      totalMinute: 0,
      totalMinutesByDate: [],
      userPairs: new Map(),
    };

    const dateStrings = generateDateStrings(startOfWeek, endOfWeek);
    usersOccupiedHours.totalMinutesByDate = dateStrings.map((date) => ({
      date,
      duration: 0,
    }));
    let result;
    if (!data.events) {
      result = await EventsDBApi.findAllEventsOfUserForConstraintBreakCheck({
        start: startOfWeek,
        end: endOfWeek,
        userId: data.userId,
      });

      const filteredEvents = result.rows.filter((e) => !e.isCancelled);

      result.rows = filteredEvents;
      result.count = filteredEvents.length;
    } else {
      result = data.events;
    }

    for (let j = 0; j < result.count; j++) {
      let event = result.rows[j];
      if (timeConstraint.antecedentLocationId) {
        if (
          event.location0 === null ||
          timeConstraint.antecedentLocationId !== event.location0.id
        ) {
          continue;
        }
      }

      if (timeConstraint.antecedentTypeActivityId) {
        if (timeConstraint.antecedentTypeActivityId !== event.activity0.id) {
          continue;
        }
      }

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

      let rruleObject = {
        freq: rule_RRule.RRule[event.frequency.toUpperCase()],
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
      let allEventsWithRule = rule.between(startOfWeek, endOfWeek, true);
      for (let p = 0; p < allEventsWithRule.length; p++) {
        let calculatedUserIds = new Array();
        let duration = calculateMinutesBetweenTimesIgnoreDates(
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

        let createdInDaylightSaving = moment(event.start).isDST();
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
        if (s >= startOfWeek && s < endOfWeek) {
          isTheBeginningInside = true;
          if (e <= endOfWeek) {
            isTheEndingInside = true;
          } else {
            duration = moment.utc(endOfWeek).diff(moment.utc(s), 'minutes');
          }
        }

        if (!isTheBeginningInside) {
          if (e > startOfWeek && e <= endOfWeek) {
            isTheEndingInside = true;
            duration = moment.utc(e).diff(moment.utc(startOfWeek), 'minutes');
          }
        }
        let totalIsAdded = false;

        let exactDatePosition = Math.max(0, Math.floor(moment.utc(s).diff(moment.utc(startOfWeek), 'minutes') / 1440));
        if (isTheBeginningInside || isTheEndingInside) {
          for (let i = 0; i < event.users.length; i++) {
            let currentUser = event.users[i];
            calculatedUserIds.push(currentUser.id);
            if (currentUser.id === data.userId) {
              continue;
            }
            //check the id
            if (consequenceUserId) {
              if (currentUser.id !== consequenceUserId) {
                continue;
              }
            }
            //check the role
            if (consequenceRoleHierarchy.length > 0) {
              let usersRoles = currentUser.roles.map((role) => role.name);
              if (!checkIntersection(usersRoles, consequenceRoleHierarchy)) {
                continue;
              }
            }

            //check the subgroups
            if (consequenceSubgroupId) {
              let userSubgroups = currentUser.subgroups.map((sbg) => sbg.id);
              if (!checkIntersection(userSubgroups, [consequenceSubgroupId])) {
                continue;
              }
            }
            if (!totalIsAdded) {
              usersOccupiedHours.totalMinute += duration;
              usersOccupiedHours.totalMinutesByDate[exactDatePosition].duration += duration
              totalIsAdded = true;
            }
            if (!usersOccupiedHours.userPairs.has(currentUser.id)) {
              usersOccupiedHours.userPairs.set(currentUser.id, {
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                duration: 0,
                totalMinutesByDate: dateStrings.map((date) => ({
                  date,
                  duration: 0,
                }))
              });
            }

            let currentUserInfo = usersOccupiedHours.userPairs.get(
              currentUser.id,
            );
            currentUserInfo.duration += duration;
            currentUserInfo.totalMinutesByDate[exactDatePosition].duration += duration
          }

          let shouldAddActivity = true;
          let shouldAddLocation = !!event.location0;

          //check the id of activity and location
          if (consequenceUserId) {
            if (event.activity0.id !== consequenceUserId) {
              shouldAddActivity = false;
            }

            if (event.location0 && event.location0.id !== consequenceUserId) {
              shouldAddLocation = false;
            }
          }
          //check the role of activity and location
          if (consequenceRoleHierarchy.length > 0) {
            let activityRoles = event.activity0.roles.map((role) => role.name);
            let locationRoles = [];
            if (event.location0 !== null) {
              locationRoles = event.location0.roles.map((role) => role.name);
            }
            if (!checkIntersection(activityRoles, consequenceRoleHierarchy)) {
              shouldAddActivity = false;
            }

            if (!checkIntersection(locationRoles, consequenceRoleHierarchy)) {
              shouldAddLocation = false;
            }
          }

          //check the subgroups of activity and location
          if (consequenceSubgroupId) {
            let activitySubgroups = event.activity0.subgroups.map(
              (sbg) => sbg.id,
            );

            let locationSubgroups = [];
            if (event.location0 !== null) {
              locationSubgroups = event.location0.subgroups.map(
                (sbg) => sbg.id,
              );
            }
            if (
              !checkIntersection(activitySubgroups, [consequenceSubgroupId])
            ) {
              shouldAddActivity = false;
            }

            if (
              !checkIntersection(locationSubgroups, [consequenceSubgroupId])
            ) {
              shouldAddLocation = false;
            }
          }

          if (
            shouldAddActivity &&
            calculatedUserIds.includes(event.activity0.id)
          ) {
            shouldAddActivity = false;
          }

          if (
            shouldAddLocation &&
            event.location0 &&
            calculatedUserIds.includes(event.location0.id)
          ) {
            shouldAddLocation = false;
          }

          if (
            !totalIsAdded &&
            ((shouldAddLocation && event.location0) || shouldAddActivity)
          ) {
            usersOccupiedHours.totalMinute += duration;
            usersOccupiedHours.totalMinutesByDate[exactDatePosition].duration += duration
            totalIsAdded = true;
          }

          //add activity
          if (shouldAddActivity) {
            if (!usersOccupiedHours.userPairs.has(event.activity0.id)) {
              usersOccupiedHours.userPairs.set(event.activity0.id, {
                firstName: event.activity0.firstName,
                lastName: null,
                duration: 0,
                totalMinutesByDate: dateStrings.map((date) => ({
                  date,
                  duration: 0,
                }))
              });
            }

            let activityUserInfo = usersOccupiedHours.userPairs.get(
              event.activity0.id,
            );
            activityUserInfo.duration += duration;
            activityUserInfo.totalMinutesByDate[exactDatePosition].duration += duration
          }

          //add location
          if (event.location0 && shouldAddLocation) {
            if (!usersOccupiedHours.userPairs.has(event.location0.id)) {
              usersOccupiedHours.userPairs.set(event.location0.id, {
                firstName: event.location0.firstName,
                lastName: null,
                duration: 0,
                totalMinutesByDate: dateStrings.map((date) => ({
                  date,
                  duration: 0,
                }))
              });
            }

            let locationUserInfo = usersOccupiedHours.userPairs.get(
              event.location0.id,
            );
            locationUserInfo.duration += duration;
            locationUserInfo.totalMinutesByDate[exactDatePosition].duration += duration
          }
        }
      }
    }

    if (timeConstraint.consequenceTypeEachOrAll === 'each') {
      let timeConstraintRelations = {
        consequenceTypeEachOrAll: 'each',
        timeconstraintFrequency: timeConstraint.frequency,
        min: timeConstraint.min,
        max: timeConstraint.max,
        userPairsRelations: [],
        totalRelation: [],
        sessionRelations: [],
      };
      for (let [userId, info] of usersOccupiedHours.userPairs) {
        timeConstraintRelations.userPairsRelations.push({
          userId: userId,
          firstName: info.firstName,
          lastName: info.lastName,
          actual: Number(info.duration * 60),
          dates: info.totalMinutesByDate.map((entry) => ({
            ...entry,
            duration: entry.duration * 60,
          })),
        });
      }

      return timeConstraintRelations;
    }

    if (timeConstraint.consequenceTypeEachOrAll === 'all') {
      let timeConstraintRelations = {
        consequenceTypeEachOrAll: 'all',
        timeconstraintFrequency: timeConstraint.frequency,
        min: timeConstraint.min,
        max: timeConstraint.max,
        userPairsRelations: [],
        totalRelation: [],
        sessionRelations: [],
      };

      timeConstraintRelations.totalRelation.push({
        actual: Number(usersOccupiedHours.totalMinute * 60),
        dates: usersOccupiedHours.totalMinutesByDate.map((entry) => ({
          ...entry,
          duration: entry.duration * 60,
        })),
      });

      return timeConstraintRelations;
    }
  }

  if (timeConstraint.frequency === 'custom') {
    let startOfRange = moment.utc(timeConstraint.start).toDate();
    let endOfRange = moment.utc(timeConstraint.end).toDate();

    let usersOccupiedHours = {
      totalMinute: 0,
      userPairs: new Map(),
    };
    let result;
    if (!data.events) {
      result = await EventsDBApi.findAllEventsOfUserForConstraintBreakCheck({
        start: startOfRange,
        end: endOfRange,
        userId: data.userId,
      });

      const filteredEvents = result.rows.filter((e) => !e.isCancelled);

      result.rows = filteredEvents;
      result.count = filteredEvents.length;
    } else {
      result = data.events;
    }

    for (let j = 0; j < result.count; j++) {
      let event = result.rows[j];
      if (timeConstraint.antecedentLocationId) {
        if (
          event.location0 === null ||
          timeConstraint.antecedentLocationId !== event.location0.id
        ) {
          continue;
        }
      }

      if (timeConstraint.antecedentTypeActivityId) {
        if (timeConstraint.antecedentTypeActivityId !== event.activity0.id) {
          continue;
        }
      }

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

      let rruleObject = {
        freq: rule_RRule.RRule[event.frequency.toUpperCase()],
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
      let allEventsWithRule = rule.between(startOfRange, endOfRange, true);
      for (let p = 0; p < allEventsWithRule.length; p++) {
        let calculatedUserIds = new Array();
        let duration = calculateMinutesBetweenTimesIgnoreDates(
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

        let createdInDaylightSaving = moment(event.start).isDST();
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

        if (s >= startOfRange && s < endOfRange) {
          isTheBeginningInside = true;
          if (e <= endOfRange) {
            isTheEndingInside = true;
          } else {
            duration = moment.utc(endOfRange).diff(moment.utc(s), 'minutes');
          }
        }

        if (!isTheBeginningInside) {
          if (e > startOfRange && e <= endOfRange) {
            isTheEndingInside = true;
            duration = moment.utc(e).diff(moment.utc(startOfRange), 'minutes');
          }
        }
        let totalIsAdded = false;

        if (isTheBeginningInside || isTheEndingInside) {
          for (let i = 0; i < event.users.length; i++) {
            let currentUser = event.users[i];
            calculatedUserIds.push(currentUser.id);
            if (currentUser.id === data.userId) {
              continue;
            }
            //check the id
            if (consequenceUserId) {
              if (currentUser.id !== consequenceUserId) {
                continue;
              }
            }
            //check the role
            if (consequenceRoleHierarchy.length > 0) {
              let usersRoles = currentUser.roles.map((role) => role.name);
              if (!checkIntersection(usersRoles, consequenceRoleHierarchy)) {
                continue;
              }
            }

            //check the subgroups
            if (consequenceSubgroupId) {
              let userSubgroups = currentUser.subgroups.map((sbg) => sbg.id);
              if (!checkIntersection(userSubgroups, [consequenceSubgroupId])) {
                continue;
              }
            }
            if (!totalIsAdded) {
              usersOccupiedHours.totalMinute += duration;
              totalIsAdded = true;
            }
            if (!usersOccupiedHours.userPairs.has(currentUser.id)) {
              usersOccupiedHours.userPairs.set(currentUser.id, {
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                duration: 0,
              });
            }

            let currentUserInfo = usersOccupiedHours.userPairs.get(
              currentUser.id,
            );
            currentUserInfo.duration += duration;
          }

          let shouldAddActivity = true;
          let shouldAddLocation = !!event.location0;

          //check the id of activity and location
          if (consequenceUserId) {
            if (event.activity0.id !== consequenceUserId) {
              shouldAddActivity = false;
            }

            if (event.location0 && event.location0.id !== consequenceUserId) {
              shouldAddLocation = false;
            }
          }
          //check the role of activity and location
          if (consequenceRoleHierarchy.length > 0) {
            let activityRoles = event.activity0.roles.map((role) => role.name);
            let locationRoles = [];
            if (event.location0 !== null) {
              locationRoles = event.location0.roles.map((role) => role.name);
            }
            if (!checkIntersection(activityRoles, consequenceRoleHierarchy)) {
              shouldAddActivity = false;
            }

            if (!checkIntersection(locationRoles, consequenceRoleHierarchy)) {
              shouldAddLocation = false;
            }
          }

          //check the subgroups of activity and location
          if (consequenceSubgroupId) {
            let activitySubgroups = event.activity0.subgroups.map(
              (sbg) => sbg.id,
            );

            let locationSubgroups = [];
            if (event.location0 !== null) {
              locationSubgroups = event.location0.subgroups.map(
                (sbg) => sbg.id,
              );
            }
            if (
              !checkIntersection(activitySubgroups, [consequenceSubgroupId])
            ) {
              shouldAddActivity = false;
            }

            if (
              !checkIntersection(locationSubgroups, [consequenceSubgroupId])
            ) {
              shouldAddLocation = false;
            }
          }

          if (
            shouldAddActivity &&
            calculatedUserIds.includes(event.activity0.id)
          ) {
            shouldAddActivity = false;
          }

          if (
            shouldAddLocation &&
            event.location0 &&
            calculatedUserIds.includes(event.location0.id)
          ) {
            shouldAddLocation = false;
          }

          if (
            !totalIsAdded &&
            ((shouldAddLocation && event.location0) || shouldAddActivity)
          ) {
            usersOccupiedHours.totalMinute += duration;
            totalIsAdded = true;
          }

          //add activity
          if (shouldAddActivity) {
            if (!usersOccupiedHours.userPairs.has(event.activity0.id)) {
              usersOccupiedHours.userPairs.set(event.activity0.id, {
                firstName: event.activity0.firstName,
                lastName: null,
                duration: 0,
              });
            }

            let activityUserInfo = usersOccupiedHours.userPairs.get(
              event.activity0.id,
            );
            activityUserInfo.duration += duration;
          }

          //add location
          if (event.location0 && shouldAddLocation) {
            if (!usersOccupiedHours.userPairs.has(event.location0.id)) {
              usersOccupiedHours.userPairs.set(event.location0.id, {
                firstName: event.location0.firstName,
                lastName: null,
                duration: 0,
              });
            }

            let locationUserInfo = usersOccupiedHours.userPairs.get(
              event.location0.id,
            );
            locationUserInfo.duration += duration;
          }
        }
      }
    }

    if (timeConstraint.consequenceTypeEachOrAll === 'each') {
      let timeConstraintRelations = {
        consequenceTypeEachOrAll: 'each',
        timeconstraintFrequency: timeConstraint.frequency,
        min: timeConstraint.min,
        max: timeConstraint.max,
        userPairsRelations: [],
        totalRelation: [],
        sessionRelations: [],
      };
      for (let [userId, info] of usersOccupiedHours.userPairs) {
        timeConstraintRelations.userPairsRelations.push({
          userId: userId,
          firstName: info.firstName,
          lastName: info.lastName,
          actual: Number(info.duration * 60),
        });
      }

      return timeConstraintRelations;
    }

    if (timeConstraint.consequenceTypeEachOrAll === 'all') {
      let timeConstraintRelations = {
        consequenceTypeEachOrAll: 'all',
        timeconstraintFrequency: timeConstraint.frequency,
        min: timeConstraint.min,
        max: timeConstraint.max,
        userPairsRelations: [],
        totalRelation: [],
        sessionRelations: [],
      };

      timeConstraintRelations.totalRelation.push({
        actual: Number(usersOccupiedHours.totalMinute * 60),
      });

      return timeConstraintRelations;
    }
  }

  if (timeConstraint.frequency === 'session') {
    let startOfRange = moment.utc(data.date).toDate();
    let endOfRange = moment.utc(data.date).add(1, 'days').toDate();
    let usersOccupiedHours = {
      totalMinute: 0,
      sessionRelations: new Map(),
    };

    let result;
    if (!data.events) {
      result = await EventsDBApi.findAllEventsOfUserForConstraintBreakCheck({
        start: startOfRange,
        end: endOfRange,
        userId: data.userId,
      });

      const filteredEvents = result.rows.filter((e) => !e.isCancelled);

      result.rows = filteredEvents;
      result.count = filteredEvents.length;
    } else {
      result = data.events;
    }

    for (let j = 0; j < result.count; j++) {
      let event = result.rows[j];
      if (timeConstraint.antecedentLocationId) {
        if (
          event.location0 === null ||
          timeConstraint.antecedentLocationId !== event.location0.id
        ) {
          continue;
        }
      }

      if (timeConstraint.antecedentTypeActivityId) {
        if (timeConstraint.antecedentTypeActivityId !== event.activity0.id) {
          continue;
        }
      }

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

      let rruleObject = {
        freq: rule_RRule.RRule[event.frequency.toUpperCase()],
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
      let allEventsWithRule = rule.between(startOfRange, endOfRange, true);
      for (let p = 0; p < allEventsWithRule.length; p++) {
        let duration = calculateMinutesBetweenTimesIgnoreDates(
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
        let createdInDaylightSaving = moment(event.start).isDST();
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
        if (s >= startOfRange && s < endOfRange) {
          isTheBeginningInside = true;
          if (e <= endOfRange) {
            isTheEndingInside = true;
          } else {
            duration = moment.utc(endOfRange).diff(moment.utc(s), 'minutes');
          }
        }

        if (!isTheBeginningInside) {
          if (e > startOfRange && e <= endOfRange) {
            isTheEndingInside = true;
            duration = moment.utc(e).diff(moment.utc(startOfRange), 'minutes');
          }
        }

        if (isTheBeginningInside || isTheEndingInside) {
          for (let i = 0; i < event.users.length; i++) {
            let currentUser = event.users[i];
            if (currentUser.id === data.userId) {
              continue;
            }
            //check the id
            if (consequenceUserId) {
              if (currentUser.id !== consequenceUserId) {
                continue;
              }
            }
            //check the role
            if (consequenceRoleHierarchy.length > 0) {
              let usersRoles = currentUser.roles.map((role) => role.name);
              if (!checkIntersection(usersRoles, consequenceRoleHierarchy)) {
                continue;
              }
            }

            //check the subgroups
            if (consequenceSubgroupId) {
              let userSubgroups = currentUser.subgroups.map((sbg) => sbg.id);
              if (!checkIntersection(userSubgroups, [consequenceSubgroupId])) {
                continue;
              }
            }

            if (!usersOccupiedHours.sessionRelations.has(event.id)) {
              usersOccupiedHours.sessionRelations.set(event.id, {
                users: [],
                duration: duration,
              });
            }

            let currentSession = usersOccupiedHours.sessionRelations.get(
              event.id,
            );

            currentSession.users.push({
              userId: currentUser.id,
              firstName: currentUser.firstName,
              lastName: currentUser.lastName,
            });
          }

          let shouldAddActivity = true;
          let shouldAddLocation = !!event.location0;

          //check the id of activity and location
          if (consequenceUserId) {
            if (event.activity0.id !== consequenceUserId) {
              shouldAddActivity = false;
            }

            if (event.location0 && event.location0.id !== consequenceUserId) {
              shouldAddLocation = false;
            }
          }
          //check the role of activity and location
          if (consequenceRoleHierarchy.length > 0) {
            let activityRoles = event.activity0.roles.map((role) => role.name);
            let locationRoles = [];
            if (event.location0 !== null) {
              locationRoles = event.location0.roles.map((role) => role.name);
            }
            if (!checkIntersection(activityRoles, consequenceRoleHierarchy)) {
              shouldAddActivity = false;
            }

            if (!checkIntersection(locationRoles, consequenceRoleHierarchy)) {
              shouldAddLocation = false;
            }
          }

          //check the subgroups of activity and location
          if (consequenceSubgroupId) {
            let activitySubgroups = event.activity0.subgroups.map(
              (sbg) => sbg.id,
            );

            let locationSubgroups = [];
            if (event.location0 !== null) {
              locationSubgroups = event.location0.subgroups.map(
                (sbg) => sbg.id,
              );
            }
            if (
              !checkIntersection(activitySubgroups, [consequenceSubgroupId])
            ) {
              shouldAddActivity = false;
            }

            if (
              !checkIntersection(locationSubgroups, [consequenceSubgroupId])
            ) {
              shouldAddLocation = false;
            }
          }

          //add activity
          if (shouldAddActivity) {
            if (!usersOccupiedHours.sessionRelations.has(event.id)) {
              usersOccupiedHours.sessionRelations.set(event.id, {
                users: [],
                duration: duration,
              });
            }

            let currentSession = usersOccupiedHours.sessionRelations.get(
              event.id,
            );

            currentSession.users.push({
              userId: event.activity0.id,
              firstName: event.activity0.firstName,
              lastName: null,
            });
          }

          //add location
          if (event.location0 && shouldAddLocation) {
            if (!usersOccupiedHours.sessionRelations.has(event.id)) {
              usersOccupiedHours.sessionRelations.set(event.id, {
                users: [],
                duration: duration,
              });
            }

            let currentSession = usersOccupiedHours.sessionRelations.get(
              event.id,
            );

            currentSession.users.push({
              userId: event.location0.id,
              firstName: event.location0.firstName,
              lastName: null,
            });
          }
        }
      }
    }
    let timeConstraintRelations = {
      consequenceTypeEachOrAll: timeConstraint.consequenceTypeEachOrAll,
      timeconstraintFrequency: timeConstraint.frequency,
      min: timeConstraint.min,
      max: timeConstraint.max,
      userPairsRelations: [],
      totalRelation: [],
      sessionRelations: [],
    };
    for (let [eventID, eventInfo] of usersOccupiedHours.sessionRelations) {
      timeConstraintRelations.sessionRelations.push({
        eventId: eventID,
        actual: Number(eventInfo.duration * 60),
        users: eventInfo.users,
      });
    }

    return timeConstraintRelations;
  }
}

async function getSessionLengthconstraintUserRelation(data) {
  const roleHierarchy = data.roleHierarchy;
  let sessionLengthConstraint = data.sessionlengthconstraint;

  let consequenceUserId = sessionLengthConstraint.consequenceUserId;
  let consequenceSubgroupId = sessionLengthConstraint.consequenceSubgroupId;
  let consequenceRoleHierarchy = [];

  if (!data.consequenceRoleHierarchy) {
    Object.entries(roleHierarchy).map((t) => {
      const [key, value] = t;
      //push the decendents
      if (
        sessionLengthConstraint.consequenceRole &&
        checkIntersection([sessionLengthConstraint.consequenceRole.name], value)
      ) {
        consequenceRoleHierarchy.push(key);
      }
    });
  } else {
    consequenceRoleHierarchy = data.consequenceRoleHierarchy;
  }

  let startOfRange = moment.utc(data.date).toDate();
  let endOfRange = moment.utc(data.date).add(1, 'days').toDate();
  let usersOccupiedHours = {
    totalMinute: 0,
    sessionRelations: new Map(),
  };

  let result;
  if (!data.events) {
    console.log('fifty');

    result = await EventsDBApi.findAllEventsOfUserForConstraintBreakCheck({
      start: startOfRange,
      end: endOfRange,
      userId: data.userId,
    });

    const filteredEvents = result.rows.filter((e) => !e.isCancelled);

    result.rows = filteredEvents;
    result.count = filteredEvents.length;
  } else {
    result = data.events;
  }

  for (let j = 0; j < result.count; j++) {
    let event = result.rows[j];
    if (sessionLengthConstraint.antecedentLocationId) {
      if (
        event.location0 === null ||
        sessionLengthConstraint.antecedentLocationId !== event.location0.id
      ) {
        continue;
      }
    }

    if (sessionLengthConstraint.antecedentTypeActivityId) {
      if (
        sessionLengthConstraint.antecedentTypeActivityId !== event.activity0.id
      ) {
        continue;
      }
    }

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

    let rruleObject = {
      freq: rule_RRule.RRule[event.frequency.toUpperCase()],
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
    let allEventsWithRule = rule.between(startOfRange, endOfRange, true);
    for (let p = 0; p < allEventsWithRule.length; p++) {
      let duration = calculateMinutesBetweenTimesIgnoreDates(
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

      let createdInDaylightSaving = moment(event.start).isDST();
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
      if (s >= startOfRange && s < endOfRange) {
        isTheBeginningInside = true;
        if (e <= endOfRange) {
          isTheEndingInside = true;
        } else {
          duration = moment.utc(endOfRange).diff(moment.utc(s), 'minutes');
        }
      }

      if (!isTheBeginningInside) {
        if (e > startOfRange && e <= endOfRange) {
          isTheEndingInside = true;
          duration = moment.utc(e).diff(moment.utc(startOfRange), 'minutes');
        }
      }

      if (isTheBeginningInside || isTheEndingInside) {
        for (let i = 0; i < event.users.length; i++) {
          let currentUser = event.users[i];
          if (currentUser.id === data.userId) {
            continue;
          }
          //check the id
          if (consequenceUserId) {
            if (currentUser.id !== consequenceUserId) {
              continue;
            }
          }
          //check the role
          if (consequenceRoleHierarchy.length > 0) {
            let usersRoles = currentUser.roles.map((role) => role.name);
            if (!checkIntersection(usersRoles, consequenceRoleHierarchy)) {
              continue;
            }
          }

          //check the subgroups
          if (consequenceSubgroupId) {
            let userSubgroups = currentUser.subgroups.map((sbg) => sbg.id);
            if (!checkIntersection(userSubgroups, [consequenceSubgroupId])) {
              continue;
            }
          }

          if (!usersOccupiedHours.sessionRelations.has(event.id)) {
            usersOccupiedHours.sessionRelations.set(event.id, {
              users: [],
              duration: duration,
            });
          }

          let currentSession = usersOccupiedHours.sessionRelations.get(
            event.id,
          );

          currentSession.users.push({
            userId: currentUser.id,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
          });
        }

        let shouldAddActivity = true;
        let shouldAddLocation = !!event.location0;

        //check the id of activity and location
        if (consequenceUserId) {
          if (event.activity0.id !== consequenceUserId) {
            shouldAddActivity = false;
          }

          if (event.location0 && event.location0.id !== consequenceUserId) {
            shouldAddLocation = false;
          }
        }
        //check the role of activity and location
        if (consequenceRoleHierarchy.length > 0) {
          let activityRoles = event.activity0.roles.map((role) => role.name);
          let locationRoles = [];
          if (event.location0 !== null) {
            locationRoles = event.location0.roles.map((role) => role.name);
          }
          if (!checkIntersection(activityRoles, consequenceRoleHierarchy)) {
            shouldAddActivity = false;
          }

          if (!checkIntersection(locationRoles, consequenceRoleHierarchy)) {
            shouldAddLocation = false;
          }
        }

        //check the subgroups of activity and location
        if (consequenceSubgroupId) {
          let activitySubgroups = event.activity0.subgroups.map(
            (sbg) => sbg.id,
          );

          let locationSubgroups = [];
          if (event.location0 !== null) {
            locationSubgroups = event.location0.subgroups.map((sbg) => sbg.id);
          }
          if (!checkIntersection(activitySubgroups, [consequenceSubgroupId])) {
            shouldAddActivity = false;
          }

          if (!checkIntersection(locationSubgroups, [consequenceSubgroupId])) {
            shouldAddLocation = false;
          }
        }

        //add activity
        if (shouldAddActivity) {
          if (!usersOccupiedHours.sessionRelations.has(event.id)) {
            usersOccupiedHours.sessionRelations.set(event.id, {
              users: [],
              duration: duration,
            });
          }

          let currentSession = usersOccupiedHours.sessionRelations.get(
            event.id,
          );

          currentSession.users.push({
            userId: event.activity0.id,
            firstName: event.activity0.firstName,
            lastName: null,
          });
        }

        //add location
        if (event.location0 && shouldAddLocation) {
          if (!usersOccupiedHours.sessionRelations.has(event.id)) {
            usersOccupiedHours.sessionRelations.set(event.id, {
              users: [],
              duration: duration,
            });
          }

          let currentSession = usersOccupiedHours.sessionRelations.get(
            event.id,
          );

          currentSession.users.push({
            userId: event.location0.id,
            firstName: event.location0.firstName,
            lastName: null,
          });
        }
      }
    }
  }
  let sessionlengthConstraintRelations = {
    consequenceTypeEachOrAll: sessionLengthConstraint.consequenceTypeEachOrAll,
    timeconstraintFrequency: sessionLengthConstraint.frequency,
    min: sessionLengthConstraint.min,
    max: sessionLengthConstraint.max,
    userPairsRelations: [],
    totalRelation: [],
    sessionRelations: [],
  };
  for (let [eventID, eventInfo] of usersOccupiedHours.sessionRelations) {
    sessionlengthConstraintRelations.sessionRelations.push({
      eventId: eventID,
      actual: Number(eventInfo.duration * 60),
      users: eventInfo.users,
    });
  }

  return sessionlengthConstraintRelations;
}

async function getAuthConstraintUserRelation(data) {
  const roleHierarchy = data.roleHierarchy;
  let authConstraint = data.authconstraint;
  let startOfConstraint = moment.utc(authConstraint.start).toDate();
  let endOfConstraint = moment.utc(authConstraint.end).toDate();

  let consequenceRoleHierarchy = [];

  if (!data.consequenceRoleHierarchy) {
    Object.entries(roleHierarchy).map((t) => {
      const [key, value] = t;
      //push the decendents
      if (
        authConstraint.consequenceRole &&
        checkIntersection([authConstraint.consequenceRole.name], value)
      ) {
        consequenceRoleHierarchy.push(key);
      }
    });
  } else {
    consequenceRoleHierarchy = data.consequenceRoleHierarchy;
  }

  // if it is not rolled over then it is for week
  if (!authConstraint.rollover) {
    let calledDate = moment.utc(data.date).toDate();

    let weekDayOfDate = calledDate.getUTCDay();
    let addDayForReachingTheStart = 1 - weekDayOfDate;
    let addDayForReachingTheEnd = 7 - weekDayOfDate;

    if (addDayForReachingTheStart > 0) {
      addDayForReachingTheStart -= 7;
    }

    addDayForReachingTheEnd = addDayForReachingTheEnd % 7;

    // get the called date's week start and end dates
    startOfWeek = moment
      .utc(data.date)
      .add(addDayForReachingTheStart, 'days')
      .toDate();
    endOfWeek = moment
      .utc(data.date)
      .add(addDayForReachingTheEnd + 1, 'days')
      .toDate();
    // trim the interval if the week is not fully in interval
    if (startOfWeek < startOfConstraint) {
      startOfWeek = startOfConstraint;
    }

    if (endOfWeek > endOfConstraint) {
      endOfWeek = endOfConstraint;
    }

    let relationBetweenActivity = {
      totalMinute: 0,
      activity: {},
    };
    let result;
    if (!data.events) {
      result = await EventsDBApi.findAllEventsOfUserForConstraintBreakCheck({
        start: startOfWeek,
        end: endOfWeek,
        userId: data.userId,
      });

      const filteredEvents = result.rows.filter((e) => !e.isCancelled);

      result.rows = filteredEvents;
      result.count = filteredEvents.length;
    } else {
      result = data.events;
    }

    for (let j = 0; j < result.count; j++) {
      let event = result.rows[j];
      if (authConstraint.antecedentLocationId) {
        if (
          event.location0 === null ||
          authConstraint.antecedentLocationId !== event.location0.id
        ) {
          continue;
        }
      }

      if (authConstraint.antecedentTypeActivityId !== event.activity0.id) {
        continue;
      }

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

      let rruleObject = {
        freq: rule_RRule.RRule[event.frequency.toUpperCase()],
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
      let allEventsWithRule = rule.between(startOfWeek, endOfWeek, true);
      for (let p = 0; p < allEventsWithRule.length; p++) {
        let duration = calculateMinutesBetweenTimesIgnoreDates(
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

        let createdInDaylightSaving = moment(event.start).isDST();
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

        if (s >= startOfWeek && s < endOfWeek) {
          isTheBeginningInside = true;
          if (e <= endOfWeek) {
            isTheEndingInside = true;
          } else {
            duration = moment.utc(endOfWeek).diff(moment.utc(s), 'minutes');
          }
        }

        if (!isTheBeginningInside) {
          if (e > startOfWeek && e <= endOfWeek) {
            isTheEndingInside = true;
            duration = moment.utc(e).diff(moment.utc(startOfWeek), 'minutes');
          }
        }
        if (isTheBeginningInside || isTheEndingInside) {
          relationBetweenActivity.totalMinute += duration;
          relationBetweenActivity.activity = event.activity0;
        }
      }
    }

    let authConstraintRelations = {
      authconstraintFrequency: authConstraint.frequency,
      min: authConstraint.min,
      max: authConstraint.max,
      userPairsRelations: {},
    };
    authConstraintRelations.userPairsRelations = {
      activity: relationBetweenActivity.activity,
      actual: relationBetweenActivity.totalMinute * 60,
    };
    return authConstraintRelations;
  } else {
    let startOfRange = moment.utc(authConstraint.start).toDate();
    let endOfRange = moment.utc(authConstraint.end).toDate();

    let result;
    if (!data.events) {
      result = await EventsDBApi.findAllEventsOfUserForConstraintBreakCheck({
        start: startOfRange,
        end: endOfRange,
        userId: data.userId,
      });

      const filteredEvents = result.rows.filter((e) => !e.isCancelled);

      result.rows = filteredEvents;
      result.count = filteredEvents.length;
    } else {
      result = data.events;
    }

    let relationBetweenActivity = {
      totalMinute: 0,
      activity: {},
    };

    for (let j = 0; j < result.count; j++) {
      let event = result.rows[j];
      if (authConstraint.antecedentLocationId) {
        if (
          event.location0 === null ||
          authConstraint.antecedentLocationId !== event.location0.id
        ) {
          continue;
        }
      }

      if (authConstraint.antecedentTypeActivityId !== event.activity0.id) {
        continue;
      }

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

      let rruleObject = {
        freq: rule_RRule.RRule[event.frequency.toUpperCase()],
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
      let allEventsWithRule = rule.between(startOfRange, endOfRange, true);
      for (let p = 0; p < allEventsWithRule.length; p++) {
        let duration = calculateMinutesBetweenTimesIgnoreDates(
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

        if (s >= startOfRange && s < endOfRange) {
          isTheBeginningInside = true;
          if (e <= endOfRange) {
            isTheEndingInside = true;
          } else {
            duration = moment.utc(endOfRange).diff(moment.utc(s), 'minutes');
          }
        }

        if (!isTheBeginningInside) {
          if (e > allEventsWithRule && e <= endOfRange) {
            isTheEndingInside = true;
            duration = moment
              .utc(e)
              .diff(moment.utc(allEventsWithRule), 'minutes');
          }
        }
        if (isTheBeginningInside || isTheEndingInside) {
          relationBetweenActivity.totalMinute += duration;
          relationBetweenActivity.activity = event.activity0;
        }
      }
    }

    let authConstraintRelations = {
      authconstraintFrequency: authConstraint.frequency,
      min: authConstraint.min,
      max: authConstraint.max,
      userPairsRelations: {},
    };
    authConstraintRelations.userPairsRelations = {
      activity: relationBetweenActivity.activity,
      actual: relationBetweenActivity.totalMinute * 60 + authConstraint.offset, // we save offset in seconds to database. 
    };
    return authConstraintRelations;
  }
}

async function getUnmatchingconstraintUserRelation(data) {
  const roleHierarchy = data.roleHierarchy;
  let unmatchingConstraint = data.unmatchingconstraint;

  let consequenceUserId = unmatchingConstraint.consequenceUserId;
  let consequenceSubgroupId = unmatchingConstraint.consequenceSubgroupId;
  let consequenceRoleHierarchy = [];

  if (!data.consequenceRoleHierarchy) {
    Object.entries(roleHierarchy).map((t) => {
      const [key, value] = t;
      //push the decendents
      if (
        unmatchingConstraint.consequenceRole &&
        checkIntersection([unmatchingConstraint.consequenceRole.name], value)
      ) {
        consequenceRoleHierarchy.push(key);
      }
    });
  } else {
    consequenceRoleHierarchy = data.consequenceRoleHierarchy;
  }

  let startOfRange = moment.utc(data.date).toDate();
  let endOfRange = moment.utc(data.date).add(1, 'days').toDate();
  let breakingEvents = new Map();

  let result;
  if (!data.events) {
    result = await EventsDBApi.findAllEventsOfUserForConstraintBreakCheck({
      start: startOfRange,
      end: endOfRange,
      userId: data.userId,
    });

    const filteredEvents = result.rows.filter((e) => !e.isCancelled);

    result.rows = filteredEvents;
    result.count = filteredEvents.length;
  } else {
    result = data.events;
  }

  let unmatchingConstraintRelations = {
    id: unmatchingConstraint.id,
    constraintType: 'unmatching',
    description: unmatchingConstraint.description,
    brokenEvents: [],
  };

  for (let j = 0; j < result.count; j++) {
    let event = result.rows[j];
    if (unmatchingConstraint.antecedentLocationId) {
      if (
        event.location0 === null ||
        unmatchingConstraint.antecedentLocationId !== event.location0.id
      ) {
        continue;
      }
    }

    if (unmatchingConstraint.antecedentTypeActivityId) {
      if (
        unmatchingConstraint.antecedentTypeActivityId !== event.activity0.id
      ) {
        continue;
      }
    }

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

    let rruleObject = {
      freq: rule_RRule.RRule[event.frequency.toUpperCase()],
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
    let allEventsWithRule = rule.between(startOfRange, endOfRange, true);
    for (let p = 0; p < allEventsWithRule.length; p++) {
      let duration = calculateMinutesBetweenTimesIgnoreDates(
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

      let createdInDaylightSaving = moment(event.start).isDST();
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

      if (s >= startOfRange && s < endOfRange) {
        isTheBeginningInside = true;
        if (e <= endOfRange) {
          isTheEndingInside = true;
        }
      }

      if (!isTheBeginningInside) {
        if (e > startOfRange && e <= endOfRange) {
          isTheEndingInside = true;
        }
      }

      if (isTheBeginningInside || isTheEndingInside) {
        for (let i = 0; i < event.users.length; i++) {
          let currentUser = event.users[i];
          if (currentUser.id === data.userId) {
            continue;
          }
          //check the id
          if (consequenceUserId) {
            if (currentUser.id !== consequenceUserId) {
              continue;
            }
          }
          //check the role
          if (consequenceRoleHierarchy.length > 0) {
            let usersRoles = currentUser.roles.map((role) => role.name);
            if (!checkIntersection(usersRoles, consequenceRoleHierarchy)) {
              continue;
            }
          }

          //check the subgroups
          if (consequenceSubgroupId) {
            let userSubgroups = currentUser.subgroups.map((sbg) => sbg.id);
            if (!checkIntersection(userSubgroups, [consequenceSubgroupId])) {
              continue;
            }
          }

          if (!breakingEvents.has(event.id)) {
            breakingEvents.set(event.id, { breakingUsers: [] });
          }

          let brokenEvent = breakingEvents.get(event.id);
          brokenEvent.breakingUsers.push({
            id: currentUser.id,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
          });
        }

        let shouldAddActivity = true;
        let shouldAddLocation = !!event.location0;

        //check the id of activity and location
        if (consequenceUserId) {
          if (event.activity0?.id !== consequenceUserId) {
            shouldAddActivity = false;
          }

          if (event.location0 && event.location0.id !== consequenceUserId) {
            shouldAddLocation = false;
          }
        }
        //check the role of activity and location
        if (consequenceRoleHierarchy.length > 0) {
          let activityRoles = event.activity0.roles.map((role) => role.name);
          let locationRoles = [];
          if (event.location0 !== null) {
            locationRoles = event.location0.roles.map((role) => role.name);
          }
          if (!checkIntersection(activityRoles, consequenceRoleHierarchy)) {
            shouldAddActivity = false;
          }

          if (!checkIntersection(locationRoles, consequenceRoleHierarchy)) {
            shouldAddLocation = false;
          }
        }

        //check the subgroups of activity and location
        if (consequenceSubgroupId) {
          let activitySubgroups = event.activity0.subgroups.map(
            (sbg) => sbg.id,
          );

          let locationSubgroups = [];
          if (event.location0 !== null) {
            locationSubgroups = event.location0.subgroups.map((sbg) => sbg.id);
          }
          if (!checkIntersection(activitySubgroups, [consequenceSubgroupId])) {
            shouldAddActivity = false;
          }

          if (!checkIntersection(locationSubgroups, [consequenceSubgroupId])) {
            shouldAddLocation = false;
          }
        }

        //add activity
        if (shouldAddActivity) {
          if (!breakingEvents.has(event.id)) {
            breakingEvents.set(event.id, { breakingUsers: [] });
          }

          let brokenEvent = breakingEvents.get(event.id);
          brokenEvent.breakingUsers.push({
            id: event.activity0.id,
            firstName: event.activity0.firstName,
            lastName: null,
          });
        }

        //add location
        if (event.location0 && shouldAddLocation) {
          if (!breakingEvents.has(event.id)) {
            breakingEvents.set(event.id, { breakingUsers: [] });
          }

          let brokenEvent = breakingEvents.get(event.id);
          brokenEvent.breakingUsers.push({
            id: event.location0.id,
            firstName: event.location0.firstName,
            lastName: null,
          });
        }
      }
    }
  }

  for (let [eventId, value] of breakingEvents) {
    unmatchingConstraintRelations.brokenEvents.push({
      eventId: eventId,
      breakingUsers: value.breakingUsers,
    });
  }

  return unmatchingConstraintRelations;
}

async function getMatchingconstraintUserRelation(data) {
  const roleHierarchy = data.roleHierarchy;
  let matchingConstraint = data.matchingconstraint;

  let consequenceUserId = matchingConstraint.consequenceUserId;
  let consequenceSubgroupId = matchingConstraint.consequenceSubgroupId;
  let consequenceRoleHierarchy = [];

  if (!data.consequenceRoleHierarchy) {
    Object.entries(roleHierarchy).map((t) => {
      const [key, value] = t;
      //push the decendents
      if (
        matchingConstraint.consequenceRole &&
        checkIntersection([matchingConstraint.consequenceRole.name], value)
      ) {
        consequenceRoleHierarchy.push(key);
      }
    });
  } else {
    consequenceRoleHierarchy = data.consequenceRoleHierarchy;
  }

  let startOfRange = moment.utc(data.date).toDate();
  let endOfRange = moment.utc(data.date).add(1, 'days').toDate();

  let matchingConstraintRelations = {
    id: matchingConstraint.id,
    constraintType: 'matching',
    description: matchingConstraint.description,
    brokenEvents: [],
  };

  let result;
  if (!data.events) {
    result = await EventsDBApi.findAllEventsOfUserForConstraintBreakCheck({
      start: startOfRange,
      end: endOfRange,
      userId: data.userId,
    });

    const filteredEvents = result.rows.filter((e) => !e.isCancelled);

    result.rows = filteredEvents;
    result.count = filteredEvents.length;
  } else {
    result = data.events;
  }

  for (let j = 0; j < result.count; j++) {
    let event = result.rows[j];
    if (matchingConstraint.antecedentLocationId) {
      if (
        event.location0 === null ||
        matchingConstraint.antecedentLocationId !== event.location0.id
      ) {
        continue;
      }
    }

    if (matchingConstraint.antecedentTypeActivityId) {
      if (matchingConstraint.antecedentTypeActivityId !== event.activity0.id) {
        continue;
      }
    }

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

    let rruleObject = {
      freq: rule_RRule.RRule[event.frequency.toUpperCase()],
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
    let allEventsWithRule = rule.between(startOfRange, endOfRange, true);
    for (let p = 0; p < allEventsWithRule.length; p++) {
      let duration = calculateMinutesBetweenTimesIgnoreDates(
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

      let createdInDaylightSaving = moment(event.start).isDST();
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
      if (s >= startOfRange && s < endOfRange) {
        isTheBeginningInside = true;
        if (e <= endOfRange) {
          isTheEndingInside = true;
        }
      }

      if (!isTheBeginningInside) {
        if (e > startOfRange && e <= endOfRange) {
          isTheEndingInside = true;
        }
      }
      if (isTheBeginningInside || isTheEndingInside) {
        let isEventHasMatchingUser = false;
        /*
        We use this `isEventHasConsequenceRoledUser` variable to check if the
        event has at least one user which is related to consequenceRole.
        Think the case if a matching constraint has Person as role and a tag
        then we do not want to alert matching constraint break in case of user
        has only drive or lunch (activities which are performed alone :)
        */
        let isEventHasConsequenceRoledUser = false;
        //check the users
        for (let i = 0; i < event.users.length; i++) {
          let currentUser = event.users[i];
          if (currentUser.id === data.userId) {
            continue;
          }
          //check the id
          if (consequenceUserId) {
            if (currentUser.id !== consequenceUserId) {
              continue;
            }
          }
          //check the role
          if (consequenceRoleHierarchy.length > 0) {
            let usersRoles = currentUser.roles.map((role) => role.name);
            if (!checkIntersection(usersRoles, consequenceRoleHierarchy)) {
              continue;
            }

            // if code comes to this point, then it means that there is
            // user with role in related to constraint.consequenceRole
            isEventHasConsequenceRoledUser = true;
          }

          //check the subgroups
          if (consequenceSubgroupId) {
            let userSubgroups = currentUser.subgroups.map((sbg) => sbg.id);
            if (!checkIntersection(userSubgroups, [consequenceSubgroupId])) {
              continue;
            }
          }

          isEventHasMatchingUser = true;
          break;
        }

        //check the activity and location
        if (!isEventHasMatchingUser) {
          let activityMatches = true;
          let loactionMatches = true;

          //check the id of activity and location
          if (consequenceUserId) {
            if (event.activity0.id !== consequenceUserId) {
              activityMatches = false;
            }

            if (event.location0 && event.location0.id !== consequenceUserId) {
              loactionMatches = false;
            }
          }
          //check the role of activity and location
          if (consequenceRoleHierarchy.length > 0) {
            let activityRoles = event.activity0.roles.map((role) => role.name);
            let locationRoles = [];
            if (event.location0 !== null) {
              locationRoles = event.location0.roles.map((role) => role.name);
            }
            if (!checkIntersection(activityRoles, consequenceRoleHierarchy)) {
              activityMatches = false;
            }

            if (!checkIntersection(locationRoles, consequenceRoleHierarchy)) {
              loactionMatches = false;
            }

            if (activityMatches || loactionMatches) {
              // if code comes to this point, then it means that there is
              // user with role in related to constraint.consequenceRole
              isEventHasConsequenceRoledUser = true;
            }
          }

          //check the subgroups of activity and location
          if (consequenceSubgroupId) {
            let activitySubgroups = event.activity0.subgroups.map(
              (sbg) => sbg.id,
            );

            let locationSubgroups = [];
            if (event.location0 !== null) {
              locationSubgroups = event.location0.subgroups.map(
                (sbg) => sbg.id,
              );
            }
            if (
              !checkIntersection(activitySubgroups, [consequenceSubgroupId])
            ) {
              activityMatches = false;
            }

            if (
              !checkIntersection(locationSubgroups, [consequenceSubgroupId])
            ) {
              loactionMatches = false;
            }
          }

          if (activityMatches || (event.location0 && loactionMatches)) {
            isEventHasMatchingUser = true;
          }
        }

        if (consequenceRoleHierarchy.length === 0) {
          // if code comes to this point, then it means that there is
          // no consequenceRole on constriant which means we do not need to check
          // if there is a user with consequenceRole while checking the constraint
          isEventHasConsequenceRoledUser = true;
        }

        if (!isEventHasMatchingUser && isEventHasConsequenceRoledUser) {
          matchingConstraintRelations.brokenEvents.push(event.id);
        }
      }
    }
  }

  return matchingConstraintRelations;
}

async function getUserToUserFrequencyConstraintRelation(data) {
  const roleHierarchy = data.roleHierarchy;
  let userToUserFrequencyConstraint = data.userToUserFrequencyConstraint;
  let startOfConstraint = moment
    .utc(userToUserFrequencyConstraint.start)
    .toDate();
  let endOfConstraint = moment.utc(userToUserFrequencyConstraint.end).toDate();

  let consequenceUserId = userToUserFrequencyConstraint.consequenceUserId;
  let consequenceSubgroupId =
    userToUserFrequencyConstraint.consequenceSubgroupId;
  let consequenceRoleHierarchy = [];

  if (!data.consequenceRoleHierarchy) {
    Object.entries(roleHierarchy).map((t) => {
      const [key, value] = t;
      //push the decendents
      if (
        userToUserFrequencyConstraint.consequenceRole &&
        checkIntersection(
          [userToUserFrequencyConstraint.consequenceRole.name],
          value,
        )
      ) {
        consequenceRoleHierarchy.push(key);
      }
    });
  } else {
    consequenceRoleHierarchy = data.consequenceRoleHierarchy;
  }

  if (userToUserFrequencyConstraint.frequency === 'day') {
    let startOfRange = moment.utc(data.date).toDate();
    let endOfRange = moment.utc(data.date).add(1, 'days').toDate();
    let usersOccupiedSessions = {
      totalNumberOfUsers: 0,
      userPairs: new Map(),
    };

    let result;
    if (!data.events) {
      result = await EventsDBApi.findAllEventsOfUserForConstraintBreakCheck({
        start: startOfRange,
        end: endOfRange,
        userId: data.userId,
      });

      const filteredEvents = result.rows.filter((e) => !e.isCancelled);

      result.rows = filteredEvents;
      result.count = filteredEvents.length;
    } else {
      result = data.events;
    }

    for (let j = 0; j < result.count; j++) {
      let event = result.rows[j];
      if (userToUserFrequencyConstraint.antecedentLocationId) {
        if (
          event.location0 === null ||
          userToUserFrequencyConstraint.antecedentLocationId !==
            event.location0.id
        ) {
          continue;
        }
      }

      if (userToUserFrequencyConstraint.antecedentTypeActivityId) {
        if (
          userToUserFrequencyConstraint.antecedentTypeActivityId !==
          event.activity0.id
        ) {
          continue;
        }
      }

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

      let rruleObject = {
        freq: rule_RRule.RRule[event.frequency.toUpperCase()],
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
      let allEventsWithRule = rule.between(startOfRange, endOfRange, true);
      for (let p = 0; p < allEventsWithRule.length; p++) {
        let duration = calculateMinutesBetweenTimesIgnoreDates(
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

        let createdInDaylightSaving = moment(event.start).isDST();
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

        if (s >= startOfRange && s < endOfRange) {
          isTheBeginningInside = true;
          if (e <= endOfRange) {
            isTheEndingInside = true;
          }
        }

        if (!isTheBeginningInside) {
          if (e > startOfRange && e <= endOfRange) {
            isTheEndingInside = true;
          }
        }

        if (isTheBeginningInside || isTheEndingInside) {
          for (let i = 0; i < event.users.length; i++) {
            let currentUser = event.users[i];
            if (currentUser.id === data.userId) {
              continue;
            }
            //check the id
            if (consequenceUserId) {
              if (currentUser.id !== consequenceUserId) {
                continue;
              }
            }
            //check the role
            if (consequenceRoleHierarchy.length > 0) {
              let usersRoles = currentUser.roles.map((role) => role.name);
              if (!checkIntersection(usersRoles, consequenceRoleHierarchy)) {
                continue;
              }
            }

            //check the subgroups
            if (consequenceSubgroupId) {
              let userSubgroups = currentUser.subgroups.map((sbg) => sbg.id);
              if (!checkIntersection(userSubgroups, [consequenceSubgroupId])) {
                continue;
              }
            }

            if (!usersOccupiedSessions.userPairs.has(currentUser.id)) {
              usersOccupiedSessions.userPairs.set(currentUser.id, {
                userId: currentUser.id,
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
              });
              usersOccupiedSessions.totalNumberOfUsers += 1;
            }
          }

          let shouldAddActivity = true;
          let shouldAddLocation = !!event.location0;

          //check the id of activity and location
          if (consequenceUserId) {
            if (event.activity0.id !== consequenceUserId) {
              shouldAddActivity = false;
            }

            if (event.location0 && event.location0.id !== consequenceUserId) {
              shouldAddLocation = false;
            }
          }
          //check the role of activity and location
          if (consequenceRoleHierarchy.length > 0) {
            let activityRoles = event.activity0.roles.map((role) => role.name);
            let locationRoles = [];
            if (event.location0 !== null) {
              locationRoles = event.location0.roles.map((role) => role.name);
            }
            if (!checkIntersection(activityRoles, consequenceRoleHierarchy)) {
              shouldAddActivity = false;
            }

            if (!checkIntersection(locationRoles, consequenceRoleHierarchy)) {
              shouldAddLocation = false;
            }
          }

          //check the subgroups of activity and location
          if (consequenceSubgroupId) {
            let activitySubgroups = event.activity0.subgroups.map(
              (sbg) => sbg.id,
            );

            let locationSubgroups = [];
            if (event.location0 !== null) {
              locationSubgroups = event.location0.subgroups.map(
                (sbg) => sbg.id,
              );
            }
            if (
              !checkIntersection(activitySubgroups, [consequenceSubgroupId])
            ) {
              shouldAddActivity = false;
            }

            if (
              !checkIntersection(locationSubgroups, [consequenceSubgroupId])
            ) {
              shouldAddLocation = false;
            }
          }

          //add activity
          if (shouldAddActivity) {
            if (!usersOccupiedSessions.userPairs.has(event.activity0.id)) {
              usersOccupiedSessions.userPairs.set(event.activity0.id, {
                userId: event.activity0.id,
                firstName: event.activity0.firstName,
                lastName: null,
              });
              usersOccupiedSessions.totalNumberOfUsers += 1;
            }
          }

          //add location
          if (event.location0 && shouldAddLocation) {
            if (!usersOccupiedSessions.userPairs.has(event.location0.id)) {
              usersOccupiedSessions.userPairs.set(event.location0.id, {
                userId: event.location0.id,
                firstName: event.location0.firstName,
                lastName: null,
              });
              usersOccupiedSessions.totalNumberOfUsers += 1;
            }
          }
        }
      }
    }

    let userToUserFrequencyConstraintRelations = {
      consequenceTypeEachOrAll:
        userToUserFrequencyConstraint.consequenceTypeEachOrAll,
      userToUserConstraintFrequency: userToUserFrequencyConstraint.frequency,
      min: userToUserFrequencyConstraint.min,
      max: userToUserFrequencyConstraint.max,
      usersWorkedWith: [],
      actualWorkedUserNumber: 0,
      sessionRelations: [],
    };
    for (let [_, info] of usersOccupiedSessions.userPairs) {
      userToUserFrequencyConstraintRelations.usersWorkedWith.push(info);
    }

    userToUserFrequencyConstraintRelations.actualWorkedUserNumber =
      userToUserFrequencyConstraintRelations.usersWorkedWith.length;

    return userToUserFrequencyConstraintRelations;
  }

  if (userToUserFrequencyConstraint.frequency === 'week') {
    let calledDate = moment.utc(data.date).toDate();

    let weekDayOfDate = calledDate.getUTCDay();
    let addDayForReachingTheStart = 1 - weekDayOfDate;
    let addDayForReachingTheEnd = 7 - weekDayOfDate;

    if (addDayForReachingTheStart > 0) {
      addDayForReachingTheStart -= 7;
    }

    addDayForReachingTheEnd = addDayForReachingTheEnd % 7;

    // get the called date's week start and end dates
    startOfWeek = moment
      .utc(data.date)
      .add(addDayForReachingTheStart, 'days')
      .toDate();
    endOfWeek = moment
      .utc(data.date)
      .add(addDayForReachingTheEnd + 1, 'days')
      .toDate();

    // trim the interval if the week is not fully in interval
    if (startOfWeek < startOfConstraint) {
      startOfWeek = startOfConstraint;
    }

    if (endOfWeek > endOfConstraint) {
      endOfWeek = endOfConstraint;
    }

    let usersOccupiedSessions = {
      totalNumberOfUsers: 0,
      userPairs: new Map(),
      totalNumberOfUsersByDate:[]
    };

    let result;
    const dateStrings = generateDateStrings(startOfWeek, endOfWeek);
    usersOccupiedSessions.totalNumberOfUsersByDate = dateStrings.map((date) => ({
      date,
      totalNumberOfUsers: 0,
      userPairs: new Map(),
    }));
    if (!data.events) {
      result = await EventsDBApi.findAllEventsOfUserForConstraintBreakCheck({
        start: startOfWeek,
        end: endOfWeek,
        userId: data.userId,
      });

      const filteredEvents = result.rows.filter((e) => !e.isCancelled);

      result.rows = filteredEvents;
      result.count = filteredEvents.length;
    } else {
      result = data.events;
    }

    for (let j = 0; j < result.count; j++) {
      let event = result.rows[j];
      if (userToUserFrequencyConstraint.antecedentLocationId) {
        if (
          event.location0 === null ||
          userToUserFrequencyConstraint.antecedentLocationId !==
            event.location0.id
        ) {
          continue;
        }
      }

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

      let rruleObject = {
        freq: rule_RRule.RRule[event.frequency.toUpperCase()],
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
      let allEventsWithRule = rule.between(startOfWeek, endOfWeek, true);
      for (let p = 0; p < allEventsWithRule.length; p++) {
        let duration = calculateMinutesBetweenTimesIgnoreDates(
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

        let createdInDaylightSaving = moment(event.start).isDST();
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

        if (s >= startOfWeek && s < endOfWeek) {
          isTheBeginningInside = true;
          if (e <= endOfWeek) {
            isTheEndingInside = true;
          }
        }

        if (!isTheBeginningInside) {
          if (e > startOfWeek && e <= endOfWeek) {
            isTheEndingInside = true;
          }
        }
        let exactDatePosition = Math.max(0, Math.floor(moment.utc(s).diff(moment.utc(startOfWeek), 'minutes') / 1440));
        if (isTheBeginningInside || isTheEndingInside) {
          for (let i = 0; i < event.users.length; i++) {
            let currentUser = event.users[i];
            if (currentUser.id === data.userId) {
              continue;
            }
            //check the id
            if (consequenceUserId) {
              if (currentUser.id !== consequenceUserId) {
                continue;
              }
            }
            //check the role
            if (consequenceRoleHierarchy.length > 0) {
              let usersRoles = currentUser.roles.map((role) => role.name);
              if (!checkIntersection(usersRoles, consequenceRoleHierarchy)) {
                continue;
              }
            }

            //check the subgroups
            if (consequenceSubgroupId) {
              let userSubgroups = currentUser.subgroups.map((sbg) => sbg.id);
              if (!checkIntersection(userSubgroups, [consequenceSubgroupId])) {
                continue;
              }
            }

            if (
              !usersOccupiedSessions.totalNumberOfUsersByDate[exactDatePosition].userPairs.has(currentUser.id)
            ) {
              !usersOccupiedSessions.totalNumberOfUsersByDate[exactDatePosition].userPairs.set(currentUser.id, {
                userId: currentUser.id,
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
              });
              usersOccupiedSessions.totalNumberOfUsersByDate[exactDatePosition].totalNumberOfUsers += 1;
            }

            if (!usersOccupiedSessions.userPairs.has(currentUser.id)) {
              usersOccupiedSessions.userPairs.set(currentUser.id, {
                userId: currentUser.id,
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
              });
              usersOccupiedSessions.totalNumberOfUsers += 1;
            }
          }

          let shouldAddActivity = true;
          let shouldAddLocation = !!event.location0;

          //check the id of activity and location
          if (consequenceUserId) {
            if (event.activity0.id !== consequenceUserId) {
              shouldAddActivity = false;
            }

            if (event.location0 && event.location0.id !== consequenceUserId) {
              shouldAddLocation = false;
            }
          }
          //check the role of activity and location
          if (consequenceRoleHierarchy.length > 0) {
            let activityRoles = event.activity0.roles.map((role) => role.name);
            let locationRoles = [];
            if (event.location0 !== null) {
              locationRoles = event.location0.roles.map((role) => role.name);
            }
            if (!checkIntersection(activityRoles, consequenceRoleHierarchy)) {
              shouldAddActivity = false;
            }

            if (!checkIntersection(locationRoles, consequenceRoleHierarchy)) {
              shouldAddLocation = false;
            }
          }

          //check the subgroups of activity and location
          if (consequenceSubgroupId) {
            let activitySubgroups = event.activity0.subgroups.map(
              (sbg) => sbg.id,
            );

            let locationSubgroups = [];
            if (event.location0 !== null) {
              locationSubgroups = event.location0.subgroups.map(
                (sbg) => sbg.id,
              );
            }
            if (
              !checkIntersection(activitySubgroups, [consequenceSubgroupId])
            ) {
              shouldAddActivity = false;
            }

            if (
              !checkIntersection(locationSubgroups, [consequenceSubgroupId])
            ) {
              shouldAddLocation = false;
            }
          }

          //add activity
          if (shouldAddActivity) {
            if (!usersOccupiedSessions.userPairs.has(event.activity0.id)) {
              usersOccupiedSessions.userPairs.set(event.activity0.id, {
                userId: event.activity0.id,
                firstName: event.activity0.firstName,
                lastName: null,
              });
              usersOccupiedSessions.totalNumberOfUsers += 1;
            }

            if (
              !usersOccupiedSessions.totalNumberOfUsersByDate[exactDatePosition].userPairs.has(event.activity0.id)
            ) {
              !usersOccupiedSessions.totalNumberOfUsersByDate[exactDatePosition].userPairs.set(event.activity0.id, {
                userId: event.activity0.id,
                firstName: event.activity0.firstName,
                lastName: null
              });
              usersOccupiedSessions.totalNumberOfUsersByDate[exactDatePosition].totalNumberOfUsers += 1;
            }
          }

          //add location
          if (event.location0 && shouldAddLocation) {
            if (!usersOccupiedSessions.userPairs.has(event.location0.id)) {
              usersOccupiedSessions.userPairs.set(event.location0.id, {
                userId: event.location0.id,
                firstName: event.location0.firstName,
                lastName: null,
              });
              usersOccupiedSessions.totalNumberOfUsers += 1;
            }

             if (
              !usersOccupiedSessions.totalNumberOfUsersByDate[exactDatePosition].userPairs.has(event.location0.id)
            ) {
              !usersOccupiedSessions.totalNumberOfUsersByDate[exactDatePosition].userPairs.set(event.location0.id, {
                userId: event.location0.id,
                firstName: event.location0.firstName,
                lastName: null
              });
              usersOccupiedSessions.totalNumberOfUsersByDate[exactDatePosition].totalNumberOfUsers += 1;
            }
          }
        }
      }
    }

    let userToUserFrequencyConstraintRelations = {
      consequenceTypeEachOrAll:
        userToUserFrequencyConstraint.consequenceTypeEachOrAll,
      userToUserConstraintFrequency: userToUserFrequencyConstraint.frequency,
      min: userToUserFrequencyConstraint.min,
      max: userToUserFrequencyConstraint.max,
      usersWorkedWith: [],
      actualWorkedUserNumber: 0,
      sessionRelations: [],
      usersWorkedWithByDate: [],
    };
    for (let [_, info] of usersOccupiedSessions.userPairs) {
      userToUserFrequencyConstraintRelations.usersWorkedWith.push(info);
    }
    for (let i = 0; i < usersOccupiedSessions.totalNumberOfUsersByDate.length; i++){
      let userList = []
      for (let [_, info] of usersOccupiedSessions.totalNumberOfUsersByDate[i].userPairs) {
        userList.push(info)
      }
      userToUserFrequencyConstraintRelations.usersWorkedWithByDate.push({
        date: usersOccupiedSessions.totalNumberOfUsersByDate[i].date,
        actual: usersOccupiedSessions.totalNumberOfUsersByDate[i].totalNumberOfUsers,
        users: userList
      })
    }
    
    userToUserFrequencyConstraintRelations.actualWorkedUserNumber =
      userToUserFrequencyConstraintRelations.usersWorkedWith.length;

    return userToUserFrequencyConstraintRelations;
  }

  if (userToUserFrequencyConstraint.frequency === 'custom') {
    let startOfRange = moment.utc(userToUserFrequencyConstraint.start).toDate();
    let endOfRange = moment.utc(userToUserFrequencyConstraint.end).toDate();

    let usersOccupiedSessions = {
      totalNumberOfUsers: 0,
      userPairs: new Map(),
    };

    let result;
    if (!data.events) {
      result = await EventsDBApi.findAllEventsOfUserForConstraintBreakCheck({
        start: startOfRange,
        end: endOfRange,
        userId: data.userId,
      });

      const filteredEvents = result.rows.filter((e) => !e.isCancelled);

      result.rows = filteredEvents;
      result.count = filteredEvents.length;
    } else {
      result = data.events;
    }

    for (let j = 0; j < result.count; j++) {
      let event = result.rows[j];
      if (userToUserFrequencyConstraint.antecedentLocationId) {
        if (
          event.location0 === null ||
          userToUserFrequencyConstraint.antecedentLocationId !==
            event.location0.id
        ) {
          continue;
        }
      }

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

      let rruleObject = {
        freq: rule_RRule.RRule[event.frequency.toUpperCase()],
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
      let allEventsWithRule = rule.between(startOfRange, endOfRange, true);
      for (let p = 0; p < allEventsWithRule.length; p++) {
        let duration = calculateMinutesBetweenTimesIgnoreDates(
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

        let createdInDaylightSaving = moment(event.start).isDST();
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

        if (s >= startOfRange && s < endOfRange) {
          isTheBeginningInside = true;
          if (e <= endOfRange) {
            isTheEndingInside = true;
          }
        }

        if (!isTheBeginningInside) {
          if (e > startOfRange && e <= endOfRange) {
            isTheEndingInside = true;
          }
        }

        if (isTheBeginningInside || isTheEndingInside) {
          for (let i = 0; i < event.users.length; i++) {
            let currentUser = event.users[i];
            if (currentUser.id === data.userId) {
              continue;
            }
            //check the id
            if (consequenceUserId) {
              if (currentUser.id !== consequenceUserId) {
                continue;
              }
            }
            //check the role
            if (consequenceRoleHierarchy.length > 0) {
              let usersRoles = currentUser.roles.map((role) => role.name);
              if (!checkIntersection(usersRoles, consequenceRoleHierarchy)) {
                continue;
              }
            }

            //check the subgroups
            if (consequenceSubgroupId) {
              let userSubgroups = currentUser.subgroups.map((sbg) => sbg.id);
              if (!checkIntersection(userSubgroups, [consequenceSubgroupId])) {
                continue;
              }
            }

            if (!usersOccupiedSessions.userPairs.has(currentUser.id)) {
              usersOccupiedSessions.userPairs.set(currentUser.id, {
                userId: currentUser.id,
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
              });
              usersOccupiedSessions.totalNumberOfUsers += 1;
            }
          }

          let shouldAddActivity = true;
          let shouldAddLocation = !!event.location0;

          //check the id of activity and location
          if (consequenceUserId) {
            if (event.activity0.id !== consequenceUserId) {
              shouldAddActivity = false;
            }

            if (event.location0 && event.location0.id !== consequenceUserId) {
              shouldAddLocation = false;
            }
          }
          //check the role of activity and location
          if (consequenceRoleHierarchy.length > 0) {
            let activityRoles = event.activity0.roles.map((role) => role.name);
            let locationRoles = [];
            if (event.location0 !== null) {
              locationRoles = event.location0.roles.map((role) => role.name);
            }
            if (!checkIntersection(activityRoles, consequenceRoleHierarchy)) {
              shouldAddActivity = false;
            }

            if (!checkIntersection(locationRoles, consequenceRoleHierarchy)) {
              shouldAddLocation = false;
            }
          }

          //check the subgroups of activity and location
          if (consequenceSubgroupId) {
            let activitySubgroups = event.activity0.subgroups.map(
              (sbg) => sbg.id,
            );

            let locationSubgroups = [];
            if (event.location0 !== null) {
              locationSubgroups = event.location0.subgroups.map(
                (sbg) => sbg.id,
              );
            }
            if (
              !checkIntersection(activitySubgroups, [consequenceSubgroupId])
            ) {
              shouldAddActivity = false;
            }

            if (
              !checkIntersection(locationSubgroups, [consequenceSubgroupId])
            ) {
              shouldAddLocation = false;
            }
          }

          //add activity
          if (shouldAddActivity) {
            if (!usersOccupiedSessions.userPairs.has(event.activity0.id)) {
              usersOccupiedSessions.userPairs.set(event.activity0.id, {
                userId: event.activity0.id,
                firstName: event.activity0.firstName,
                lastName: null,
              });
              usersOccupiedSessions.totalNumberOfUsers += 1;
            }
          }

          //add location
          if (event.location0 && shouldAddLocation) {
            if (!usersOccupiedSessions.userPairs.has(event.location0.id)) {
              usersOccupiedSessions.userPairs.set(event.location0.id, {
                userId: event.location0.id,
                firstName: event.location0.firstName,
                lastName: null,
              });
              usersOccupiedSessions.totalNumberOfUsers += 1;
            }
          }
        }
      }
    }

    let userToUserFrequencyConstraintRelations = {
      consequenceTypeEachOrAll:
        userToUserFrequencyConstraint.consequenceTypeEachOrAll,
      userToUserConstraintFrequency: userToUserFrequencyConstraint.frequency,
      min: userToUserFrequencyConstraint.min,
      max: userToUserFrequencyConstraint.max,
      usersWorkedWith: [],
      actualWorkedUserNumber: 0,
      sessionRelations: [],
    };
    for (let [_, info] of usersOccupiedSessions.userPairs) {
      userToUserFrequencyConstraintRelations.usersWorkedWith.push(info);
    }
    userToUserFrequencyConstraintRelations.actualWorkedUserNumber =
      userToUserFrequencyConstraintRelations.usersWorkedWith.length;

    return userToUserFrequencyConstraintRelations;
  }

  if (userToUserFrequencyConstraint.frequency === 'session') {
    let startOfRange = moment.utc(data.date).toDate();
    let endOfRange = moment.utc(data.date).add(1, 'days').toDate();

    let usersOccupiedSessions = {
      sessionRelations: new Map(),
    };

    let result;
    if (!data.events) {
      result = await EventsDBApi.findAllEventsOfUserForConstraintBreakCheck({
        start: startOfRange,
        end: endOfRange,
        userId: data.userId,
      });

      const filteredEvents = result.rows.filter((e) => !e.isCancelled);

      result.rows = filteredEvents;
      result.count = filteredEvents.length;
    } else {
      result = data.events;
    }

    for (let j = 0; j < result.count; j++) {
      let event = result.rows[j];
      if (userToUserFrequencyConstraint.antecedentLocationId) {
        if (
          event.location0 === null ||
          userToUserFrequencyConstraint.antecedentLocationId !==
            event.location0.id
        ) {
          continue;
        }
      }

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

      let rruleObject = {
        freq: rule_RRule.RRule[event.frequency.toUpperCase()],
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
      let allEventsWithRule = rule.between(startOfRange, endOfRange, true);
      for (let p = 0; p < allEventsWithRule.length; p++) {
        let duration = calculateMinutesBetweenTimesIgnoreDates(
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

        let createdInDaylightSaving = moment(event.start).isDST();
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

        if (s >= startOfRange && s < endOfRange) {
          isTheBeginningInside = true;
          if (e <= endOfRange) {
            isTheEndingInside = true;
          }
        }

        if (!isTheBeginningInside) {
          if (e > startOfRange && e <= endOfRange) {
            isTheEndingInside = true;
          }
        }

        if (isTheBeginningInside || isTheEndingInside) {
          for (let i = 0; i < event.users.length; i++) {
            let currentUser = event.users[i];
            if (currentUser.id === data.userId) {
              continue;
            }
            //check the id
            if (consequenceUserId) {
              if (currentUser.id !== consequenceUserId) {
                continue;
              }
            }
            //check the role
            if (consequenceRoleHierarchy.length > 0) {
              let usersRoles = currentUser.roles.map((role) => role.name);
              if (!checkIntersection(usersRoles, consequenceRoleHierarchy)) {
                continue;
              }
            }

            //check the subgroups
            if (consequenceSubgroupId) {
              let userSubgroups = currentUser.subgroups.map((sbg) => sbg.id);
              if (!checkIntersection(userSubgroups, [consequenceSubgroupId])) {
                continue;
              }
            }

            if (!usersOccupiedSessions.sessionRelations.has(event.id)) {
              usersOccupiedSessions.sessionRelations.set(event.id, {
                users: [],
              });
            }

            let currentSession = usersOccupiedSessions.sessionRelations.get(
              event.id,
            );

            currentSession.users.push({
              userId: currentUser.id,
              firstName: currentUser.firstName,
              lastName: currentUser.lastName,
            });
          }

          let shouldAddActivity = true;
          let shouldAddLocation = !!event.location0;

          //check the id of activity and location
          if (consequenceUserId) {
            if (event.activity0.id !== consequenceUserId) {
              shouldAddActivity = false;
            }

            if (event.location0 && event.location0.id !== consequenceUserId) {
              shouldAddLocation = false;
            }
          }
          //check the role of activity and location
          if (consequenceRoleHierarchy.length > 0) {
            let activityRoles = event.activity0.roles.map((role) => role.name);
            let locationRoles = [];
            if (event.location0 !== null) {
              locationRoles = event.location0.roles.map((role) => role.name);
            }
            if (!checkIntersection(activityRoles, consequenceRoleHierarchy)) {
              shouldAddActivity = false;
            }

            if (!checkIntersection(locationRoles, consequenceRoleHierarchy)) {
              shouldAddLocation = false;
            }
          }

          //check the subgroups of activity and location
          if (consequenceSubgroupId) {
            let activitySubgroups = event.activity0.subgroups.map(
              (sbg) => sbg.id,
            );

            let locationSubgroups = [];
            if (event.location0 !== null) {
              locationSubgroups = event.location0.subgroups.map(
                (sbg) => sbg.id,
              );
            }
            if (
              !checkIntersection(activitySubgroups, [consequenceSubgroupId])
            ) {
              shouldAddActivity = false;
            }

            if (
              !checkIntersection(locationSubgroups, [consequenceSubgroupId])
            ) {
              shouldAddLocation = false;
            }
          }

          //add activity
          if (shouldAddActivity) {
            if (!usersOccupiedSessions.sessionRelations.has(event.id)) {
              usersOccupiedSessions.sessionRelations.set(event.id, {
                users: [],
              });
            }

            let currentSession = usersOccupiedSessions.sessionRelations.get(
              event.id,
            );

            currentSession.users.push({
              userId: event.activity0.id,
              firstName: event.activity0.firstName,
              lastName: null,
            });
          }

          //add location
          if (event.location0 && shouldAddLocation) {
            if (!usersOccupiedSessions.sessionRelations.has(event.id)) {
              usersOccupiedSessions.sessionRelations.set(event.id, {
                users: [],
              });
            }

            let currentSession = usersOccupiedSessions.sessionRelations.get(
              event.id,
            );

            currentSession.users.push({
              userId: event.location0.id,
              firstName: event.location0.firstName,
              lastName: null,
            });
          }
        }
      }
    }

    let userToUserFrequencyConstraintRelations = {
      consequenceTypeEachOrAll:
        userToUserFrequencyConstraint.consequenceTypeEachOrAll,
      timeconstraintFrequency: userToUserFrequencyConstraint.frequency,
      min: userToUserFrequencyConstraint.min,
      max: userToUserFrequencyConstraint.max,
      usersWorkedWith: [],
      actualWorkedUserNumber: 0,
      sessionRelations: [],
    };
    for (let [eventID, eventInfo] of usersOccupiedSessions.sessionRelations) {
      userToUserFrequencyConstraintRelations.sessionRelations.push({
        eventId: eventID,
        userNumber: eventInfo.users.length,
        users: eventInfo.users,
      });
    }

    return userToUserFrequencyConstraintRelations;
  }
}

async function getUserToSessionFrequencyConstraintRelation(data) {
  const roleHierarchy = data.roleHierarchy;
  let userToSessionFrequencyConstraint = data.userToSessionFrequencyConstraint;
  let startOfConstraint = moment
    .utc(userToSessionFrequencyConstraint.start)
    .toDate();
  let endOfConstraint = moment
    .utc(userToSessionFrequencyConstraint.end)
    .toDate();

  let consequenceUserId = userToSessionFrequencyConstraint.consequenceUserId;
  let consequenceSubgroupId =
    userToSessionFrequencyConstraint.consequenceSubgroupId;
  let consequenceRoleHierarchy = [];
  if (!data.consequenceRoleHierarchy) {
    Object.entries(roleHierarchy).map((t) => {
      const [key, value] = t;
      //push the decendents
      if (
        userToSessionFrequencyConstraint.consequenceRole &&
        checkIntersection(
          [userToSessionFrequencyConstraint.consequenceRole.name],
          value,
        )
      ) {
        consequenceRoleHierarchy.push(key);
      }
    });
  } else {
    consequenceRoleHierarchy = data.consequenceRoleHierarchy;
  }

  if (userToSessionFrequencyConstraint.frequency === 'day') {
    let startOfRange = moment.utc(data.date).toDate();
    let endOfRange = moment.utc(data.date).add(1, 'days').toDate();
    let usersOccupiedSessions = {
      totalNumberOfSessions: 0,
      userPairs: new Map(),
    };
    let result;
    if (!data.events) {
      result = await EventsDBApi.findAllEventsOfUserForConstraintBreakCheck({
        start: startOfRange,
        end: endOfRange,
        userId: data.userId,
      });

      const filteredEvents = result.rows.filter((e) => !e.isCancelled);

      result.rows = filteredEvents;
      result.count = filteredEvents.length;
    } else {
      result = data.events;
    }

    for (let j = 0; j < result.count; j++) {
      let event = result.rows[j];
      if (userToSessionFrequencyConstraint.antecedentLocationId) {
        if (
          event.location0 === null ||
          userToSessionFrequencyConstraint.antecedentLocationId !==
            event.location0.id
        ) {
          continue;
        }
      }

      if (userToSessionFrequencyConstraint.antecedentTypeActivityId) {
        if (
          userToSessionFrequencyConstraint.antecedentTypeActivityId !==
          event.activity0.id
        ) {
          continue;
        }
      }

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

      let rruleObject = {
        freq: rule_RRule.RRule[event.frequency.toUpperCase()],
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
      let allEventsWithRule = rule.between(startOfRange, endOfRange, true);
      for (let p = 0; p < allEventsWithRule.length; p++) {
        let calculatedUserIds = new Array();
        let duration = calculateMinutesBetweenTimesIgnoreDates(
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

        let createdInDaylightSaving = moment(event.start).isDST();
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
        if (s >= startOfRange && s < endOfRange) {
          isTheBeginningInside = true;
          if (e <= endOfRange) {
            isTheEndingInside = true;
          }
        }

        if (!isTheBeginningInside) {
          if (e > startOfRange && e <= endOfRange) {
            isTheEndingInside = true;
          }
        }
        let addedToTotalSession = false;

        if (isTheBeginningInside || isTheEndingInside) {
          for (let i = 0; i < event.users.length; i++) {
            let currentUser = event.users[i];
            calculatedUserIds.push(currentUser.id);
            if (currentUser.id === data.userId) {
              continue;
            }
            //check the id
            if (consequenceUserId) {
              if (currentUser.id !== consequenceUserId) {
                continue;
              }
            }
            //check the role
            if (consequenceRoleHierarchy.length > 0) {
              let usersRoles = currentUser.roles.map((role) => role.name);
              if (!checkIntersection(usersRoles, consequenceRoleHierarchy)) {
                continue;
              }
            }

            //check the subgroups
            if (consequenceSubgroupId) {
              let userSubgroups = currentUser.subgroups.map((sbg) => sbg.id);
              if (!checkIntersection(userSubgroups, [consequenceSubgroupId])) {
                continue;
              }
            }
            if (!addedToTotalSession) {
              usersOccupiedSessions.totalNumberOfSessions += 1;
              addedToTotalSession = true;
            }

            if (!usersOccupiedSessions.userPairs.has(currentUser.id)) {
              usersOccupiedSessions.userPairs.set(currentUser.id, {
                userId: currentUser.id,
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                numberOfSession: 0,
              });
            }

            let currentUserSessionInfo = usersOccupiedSessions.userPairs.get(
              currentUser.id,
            );
            currentUserSessionInfo.numberOfSession++;
          }

          let shouldAddActivity = true;
          let shouldAddLocation = !!event.location0;

          //check the id of activity and location
          if (consequenceUserId) {
            if (event.activity0.id !== consequenceUserId) {
              shouldAddActivity = false;
            }

            if (event.location0 && event.location0.id !== consequenceUserId) {
              shouldAddLocation = false;
            }
          }
          //check the role of activity and location
          if (consequenceRoleHierarchy.length > 0) {
            let activityRoles = event.activity0.roles.map((role) => role.name);
            let locationRoles = [];
            if (event.location0 !== null) {
              locationRoles = event.location0.roles.map((role) => role.name);
            }
            if (!checkIntersection(activityRoles, consequenceRoleHierarchy)) {
              shouldAddActivity = false;
            }

            if (!checkIntersection(locationRoles, consequenceRoleHierarchy)) {
              shouldAddLocation = false;
            }
          }

          //check the subgroups of activity and location
          if (consequenceSubgroupId) {
            let activitySubgroups = event.activity0.subgroups.map(
              (sbg) => sbg.id,
            );

            let locationSubgroups = [];
            if (event.location0 !== null) {
              locationSubgroups = event.location0.subgroups.map(
                (sbg) => sbg.id,
              );
            }
            if (
              !checkIntersection(activitySubgroups, [consequenceSubgroupId])
            ) {
              shouldAddActivity = false;
            }

            if (
              !checkIntersection(locationSubgroups, [consequenceSubgroupId])
            ) {
              shouldAddLocation = false;
            }
          }

          if (
            shouldAddActivity &&
            calculatedUserIds.includes(event.activity0.id)
          ) {
            shouldAddActivity = false;
          }
          if (
            shouldAddLocation &&
            event.location0 &&
            calculatedUserIds.includes(event.location0.id)
          ) {
            shouldAddLocation = false;
          }

          if (
            !addedToTotalSession &&
            (shouldAddLocation || shouldAddActivity)
          ) {
            usersOccupiedSessions.totalNumberOfSessions += 1;
            addedToTotalSession = true;
          }

          //add activity
          if (shouldAddActivity) {
            if (!usersOccupiedSessions.userPairs.has(event.activity0.id)) {
              usersOccupiedSessions.userPairs.set(event.activity0.id, {
                userId: event.activity0.id,
                firstName: event.activity0.firstName,
                lastName: null,
                numberOfSession: 0,
              });
            }

            let activityUserSessionInfo = usersOccupiedSessions.userPairs.get(
              event.activity0.id,
            );
            activityUserSessionInfo.numberOfSession++;
          }

          //add location
          if (event.location0 && shouldAddLocation) {
            if (!usersOccupiedSessions.userPairs.has(event.location0.id)) {
              usersOccupiedSessions.userPairs.set(event.location0.id, {
                userId: event.location0.id,
                firstName: event.location0.firstName,
                lastName: null,
                numberOfSession: 0,
              });
            }

            let locationUserSessionInfo = usersOccupiedSessions.userPairs.get(
              event.location0.id,
            );
            locationUserSessionInfo.numberOfSession++;
          }
        }
      }
    }

    if (userToSessionFrequencyConstraint.consequenceTypeEachOrAll === 'each') {
      let userToSessionFrequencyConstraintRelations = {
        consequenceTypeEachOrAll: 'each',
        userToUserConstraintFrequency:
          userToSessionFrequencyConstraint.frequency,
        min: userToSessionFrequencyConstraint.min,
        max: userToSessionFrequencyConstraint.max,
        userPairsRelations: [],
        totalRelation: [],
      };
      for (let [userId, info] of usersOccupiedSessions.userPairs) {
        userToSessionFrequencyConstraintRelations.userPairsRelations.push({
          userId: userId,
          firstName: info.firstName,
          lastName: info.lastName,
          actual: info.numberOfSession,
        });
      }

      return userToSessionFrequencyConstraintRelations;
    }

    if (userToSessionFrequencyConstraint.consequenceTypeEachOrAll === 'all') {
      let userToSessionFrequencyConstraintRelations = {
        consequenceTypeEachOrAll: 'all',
        userToUserConstraintFrequency:
          userToSessionFrequencyConstraint.frequency,
        min: userToSessionFrequencyConstraint.min,
        max: userToSessionFrequencyConstraint.max,
        userPairsRelations: [],
        totalRelation: [],
      };

      userToSessionFrequencyConstraintRelations.totalRelation.push({
        actual: usersOccupiedSessions.totalNumberOfSessions,
      });

      return userToSessionFrequencyConstraintRelations;
    }
  }

  if (userToSessionFrequencyConstraint.frequency === 'week') {
    let calledDate = moment.utc(data.date).toDate();

    let weekDayOfDate = calledDate.getUTCDay();
    let addDayForReachingTheStart = 1 - weekDayOfDate;
    let addDayForReachingTheEnd = 7 - weekDayOfDate;

    if (addDayForReachingTheStart > 0) {
      addDayForReachingTheStart -= 7;
    }

    addDayForReachingTheEnd = addDayForReachingTheEnd % 7;

    // get the called date's week start and end dates
    startOfWeek = moment
      .utc(data.date)
      .add(addDayForReachingTheStart, 'days')
      .toDate();
    endOfWeek = moment
      .utc(data.date)
      .add(addDayForReachingTheEnd + 1, 'days')
      .toDate();

    // trim the interval if the week is not fully in interval
    if (startOfWeek < startOfConstraint) {
      startOfWeek = startOfConstraint;
    }

    if (endOfWeek > endOfConstraint) {
      endOfWeek = endOfConstraint;
    }

    let usersOccupiedSessions = {
      totalNumberOfSessions: 0,
      totalNumberOfSessionsByDate: [],
      userPairs: new Map(),
    };

    const dateStrings = generateDateStrings(startOfWeek, endOfWeek);
    usersOccupiedSessions.totalNumberOfSessionsByDate = dateStrings.map((date) => ({
      date,
      sessionNumber: 0,
    }));

    let result;
    if (!data.events) {
      result = await EventsDBApi.findAllEventsOfUserForConstraintBreakCheck({
        start: startOfWeek,
        end: endOfWeek,
        userId: data.userId,
      });

      const filteredEvents = result.rows.filter((e) => !e.isCancelled);

      result.rows = filteredEvents;
      result.count = filteredEvents.length;
    } else {
      result = data.events;
    }

    for (let j = 0; j < result.count; j++) {
      let event = result.rows[j];
      if (userToSessionFrequencyConstraint.antecedentLocationId) {
        if (
          event.location0 === null ||
          userToSessionFrequencyConstraint.antecedentLocationId !==
            event.location0.id
        ) {
          continue;
        }
      }

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

      let rruleObject = {
        freq: rule_RRule.RRule[event.frequency.toUpperCase()],
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
      let allEventsWithRule = rule.between(startOfWeek, endOfWeek, true);
      for (let p = 0; p < allEventsWithRule.length; p++) {
        let calculatedUserIds = new Array();
        let duration = calculateMinutesBetweenTimesIgnoreDates(
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

        let createdInDaylightSaving = moment(event.start).isDST();
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
        if (s >= startOfWeek && s < endOfWeek) {
          isTheBeginningInside = true;
          if (e <= endOfWeek) {
            isTheEndingInside = true;
          }
        }

        if (!isTheBeginningInside) {
          if (e > startOfWeek && e <= endOfWeek) {
            isTheEndingInside = true;
          }
        }
        let addedToTotalSession = false;
        let exactDatePosition = Math.max(0, Math.floor(moment.utc(s).diff(moment.utc(startOfWeek), 'minutes') / 1440));
        if (isTheBeginningInside || isTheEndingInside) {
          for (let i = 0; i < event.users.length; i++) {
            let currentUser = event.users[i];
            calculatedUserIds.push(currentUser.id);
            if (currentUser.id === data.userId) {
              continue;
            }
            //check the id
            if (consequenceUserId) {
              if (currentUser.id !== consequenceUserId) {
                continue;
              }
            }
            //check the role
            if (consequenceRoleHierarchy.length > 0) {
              let usersRoles = currentUser.roles.map((role) => role.name);
              if (!checkIntersection(usersRoles, consequenceRoleHierarchy)) {
                continue;
              }
            }

            //check the subgroups
            if (consequenceSubgroupId) {
              let userSubgroups = currentUser.subgroups.map((sbg) => sbg.id);
              if (!checkIntersection(userSubgroups, [consequenceSubgroupId])) {
                continue;
              }
            }
            if (!addedToTotalSession) {
              usersOccupiedSessions.totalNumberOfSessions += 1;
              usersOccupiedSessions.totalNumberOfSessionsByDate[exactDatePosition].sessionNumber += 1
              addedToTotalSession = true;
            }
            if (!usersOccupiedSessions.userPairs.has(currentUser.id)) {
              usersOccupiedSessions.userPairs.set(currentUser.id, {
                userId: currentUser.id,
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                numberOfSession: 0,
              });
            }

            let currentUserSessionInfo = usersOccupiedSessions.userPairs.get(
              currentUser.id,
            );
            currentUserSessionInfo.numberOfSession++;
          }

          let shouldAddActivity = true;
          let shouldAddLocation = !!event.location0;

          //check the id of activity and location
          if (consequenceUserId) {
            if (event.activity0.id !== consequenceUserId) {
              shouldAddActivity = false;
            }

            if (event.location0 && event.location0.id !== consequenceUserId) {
              shouldAddLocation = false;
            }
          }
          //check the role of activity and location
          if (consequenceRoleHierarchy.length > 0) {
            let activityRoles = event.activity0.roles.map((role) => role.name);
            let locationRoles = [];
            if (event.location0 !== null) {
              locationRoles = event.location0.roles.map((role) => role.name);
            }
            if (!checkIntersection(activityRoles, consequenceRoleHierarchy)) {
              shouldAddActivity = false;
            }

            if (!checkIntersection(locationRoles, consequenceRoleHierarchy)) {
              shouldAddLocation = false;
            }
          }

          //check the subgroups of activity and location
          if (consequenceSubgroupId) {
            let activitySubgroups = event.activity0.subgroups.map(
              (sbg) => sbg.id,
            );

            let locationSubgroups = [];
            if (event.location0 !== null) {
              locationSubgroups = event.location0.subgroups.map(
                (sbg) => sbg.id,
              );
            }
            if (
              !checkIntersection(activitySubgroups, [consequenceSubgroupId])
            ) {
              shouldAddActivity = false;
            }

            if (
              !checkIntersection(locationSubgroups, [consequenceSubgroupId])
            ) {
              shouldAddLocation = false;
            }
          }

          if (
            shouldAddActivity &&
            calculatedUserIds.includes(event.activity0.id)
          ) {
            shouldAddActivity = false;
          }
          if (
            shouldAddLocation &&
            event.location0 &&
            calculatedUserIds.includes(event.location0.id)
          ) {
            shouldAddLocation = false;
          }

          if (
            !addedToTotalSession &&
            (shouldAddLocation || shouldAddActivity)
          ) {
            usersOccupiedSessions.totalNumberOfSessions += 1;
            usersOccupiedSessions.totalNumberOfSessionsByDate[exactDatePosition].sessionNumber += 1
            addedToTotalSession = true;
          }

          //add activity
          if (shouldAddActivity) {
            if (!usersOccupiedSessions.userPairs.has(event.activity0.id)) {
              usersOccupiedSessions.userPairs.set(event.activity0.id, {
                userId: event.activity0.id,
                firstName: event.activity0.firstName,
                lastName: null,
                numberOfSession: 0,
              });
            }

            let activityUserSessionInfo = usersOccupiedSessions.userPairs.get(
              event.activity0.id,
            );
            activityUserSessionInfo.numberOfSession++;
          }

          //add location
          if (event.location0 && shouldAddLocation) {
            if (!usersOccupiedSessions.userPairs.has(event.location0.id)) {
              usersOccupiedSessions.userPairs.set(event.location0.id, {
                userId: event.location0.id,
                firstName: event.location0.firstName,
                lastName: null,
                numberOfSession: 0,
              });
            }

            let locationUserSessionInfo = usersOccupiedSessions.userPairs.get(
              event.location0.id,
            );
            locationUserSessionInfo.numberOfSession++;
          }
        }
      }
    }

    if (userToSessionFrequencyConstraint.consequenceTypeEachOrAll === 'each') {
      let userToSessionFrequencyConstraintRelations = {
        consequenceTypeEachOrAll: 'each',
        userToUserConstraintFrequency:
          userToSessionFrequencyConstraint.frequency,
        min: userToSessionFrequencyConstraint.min,
        max: userToSessionFrequencyConstraint.max,
        userPairsRelations: [],
        totalRelation: [],
      };
      for (let [userId, info] of usersOccupiedSessions.userPairs) {
        userToSessionFrequencyConstraintRelations.userPairsRelations.push({
          userId: userId,
          firstName: info.firstName,
          lastName: info.lastName,
          actual: info.numberOfSession,
        });
      }

      return userToSessionFrequencyConstraintRelations;
    }

    if (userToSessionFrequencyConstraint.consequenceTypeEachOrAll === 'all') {
      let userToSessionFrequencyConstraintRelations = {
        consequenceTypeEachOrAll: 'all',
        userToUserConstraintFrequency:
          userToSessionFrequencyConstraint.frequency,
        min: userToSessionFrequencyConstraint.min,
        max: userToSessionFrequencyConstraint.max,
        userPairsRelations: [],
        totalRelation: [],
      };

      userToSessionFrequencyConstraintRelations.totalRelation.push({
        actual: usersOccupiedSessions.totalNumberOfSessions,
        dates: usersOccupiedSessions.totalNumberOfSessionsByDate ?? []
      });

      return userToSessionFrequencyConstraintRelations;
    }
  }

  if (userToSessionFrequencyConstraint.frequency === 'custom') {
    let startOfRange = moment
      .utc(userToSessionFrequencyConstraint.start)
      .toDate();
    let endOfRange = moment.utc(userToSessionFrequencyConstraint.end).toDate();

    let usersOccupiedSessions = {
      totalNumberOfSessions: 0,
      userPairs: new Map(),
    };

    let result;
    if (!data.events) {
      result = await EventsDBApi.findAllEventsOfUserForConstraintBreakCheck({
        start: startOfRange,
        end: endOfRange,
        userId: data.userId,
      });

      const filteredEvents = result.rows.filter((e) => !e.isCancelled);

      result.rows = filteredEvents;
      result.count = filteredEvents.length;
    } else {
      result = data.events;
    }

    for (let j = 0; j < result.count; j++) {
      let event = result.rows[j];
      if (userToSessionFrequencyConstraint.antecedentLocationId) {
        if (
          event.location0 === null ||
          userToSessionFrequencyConstraint.antecedentLocationId !==
            event.location0.id
        ) {
          continue;
        }
      }

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

      let rruleObject = {
        freq: rule_RRule.RRule[event.frequency.toUpperCase()],
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
      let allEventsWithRule = rule.between(startOfRange, endOfRange, true);
      for (let p = 0; p < allEventsWithRule.length; p++) {
        let calculatedUserIds = new Array();
        let duration = calculateMinutesBetweenTimesIgnoreDates(
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

        let createdInDaylightSaving = moment(event.start).isDST();
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
        if (s >= startOfRange && s < endOfRange) {
          isTheBeginningInside = true;
          if (e <= endOfRange) {
            isTheEndingInside = true;
          }
        }

        if (!isTheBeginningInside) {
          if (e > startOfRange && e <= endOfRange) {
            isTheEndingInside = true;
          }
        }
        let addedToTotalSession = false;

        if (isTheBeginningInside || isTheEndingInside) {
          for (let i = 0; i < event.users.length; i++) {
            let currentUser = event.users[i];
            calculatedUserIds.push(currentUser.id);
            if (currentUser.id === data.userId) {
              continue;
            }
            //check the id
            if (consequenceUserId) {
              if (currentUser.id !== consequenceUserId) {
                continue;
              }
            }
            //check the role
            if (consequenceRoleHierarchy.length > 0) {
              let usersRoles = currentUser.roles.map((role) => role.name);
              if (!checkIntersection(usersRoles, consequenceRoleHierarchy)) {
                continue;
              }
            }

            //check the subgroups
            if (consequenceSubgroupId) {
              let userSubgroups = currentUser.subgroups.map((sbg) => sbg.id);
              if (!checkIntersection(userSubgroups, [consequenceSubgroupId])) {
                continue;
              }
            }
            if (!addedToTotalSession) {
              usersOccupiedSessions.totalNumberOfSessions += 1;
              addedToTotalSession = true;
            }
            if (!usersOccupiedSessions.userPairs.has(currentUser.id)) {
              usersOccupiedSessions.userPairs.set(currentUser.id, {
                userId: currentUser.id,
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                numberOfSession: 0,
              });
            }

            let currentUserSessionInfo = usersOccupiedSessions.userPairs.get(
              currentUser.id,
            );
            currentUserSessionInfo.numberOfSession++;
          }

          let shouldAddActivity = true;
          let shouldAddLocation = !!event.location0;

          //check the id of activity and location
          if (consequenceUserId) {
            if (event.activity0.id !== consequenceUserId) {
              shouldAddActivity = false;
            }

            if (event.location0 && event.location0.id !== consequenceUserId) {
              shouldAddLocation = false;
            }
          }
          //check the role of activity and location
          if (consequenceRoleHierarchy.length > 0) {
            let activityRoles = event.activity0.roles.map((role) => role.name);
            let locationRoles = [];
            if (event.location0 !== null) {
              locationRoles = event.location0.roles.map((role) => role.name);
            }
            if (!checkIntersection(activityRoles, consequenceRoleHierarchy)) {
              shouldAddActivity = false;
            }

            if (!checkIntersection(locationRoles, consequenceRoleHierarchy)) {
              shouldAddLocation = false;
            }
          }

          //check the subgroups of activity and location
          if (consequenceSubgroupId) {
            let activitySubgroups = event.activity0.subgroups.map(
              (sbg) => sbg.id,
            );

            let locationSubgroups = [];
            if (event.location0 !== null) {
              locationSubgroups = event.location0.subgroups.map(
                (sbg) => sbg.id,
              );
            }
            if (
              !checkIntersection(activitySubgroups, [consequenceSubgroupId])
            ) {
              shouldAddActivity = false;
            }

            if (
              !checkIntersection(locationSubgroups, [consequenceSubgroupId])
            ) {
              shouldAddLocation = false;
            }
          }

          if (
            shouldAddActivity &&
            calculatedUserIds.includes(event.activity0.id)
          ) {
            shouldAddActivity = false;
          }
          if (
            shouldAddLocation &&
            event.location0 &&
            calculatedUserIds.includes(event.location0.id)
          ) {
            shouldAddLocation = false;
          }

          if (
            !addedToTotalSession &&
            (shouldAddLocation || shouldAddActivity)
          ) {
            usersOccupiedSessions.totalNumberOfSessions += 1;
            addedToTotalSession = true;
          }

          //add activity
          if (shouldAddActivity) {
            if (!usersOccupiedSessions.userPairs.has(event.activity0.id)) {
              usersOccupiedSessions.userPairs.set(event.activity0.id, {
                userId: event.activity0.id,
                firstName: event.activity0.firstName,
                lastName: null,
                numberOfSession: 0,
              });
            }

            let activityUserSessionInfo = usersOccupiedSessions.userPairs.get(
              event.activity0.id,
            );
            activityUserSessionInfo.numberOfSession++;
          }

          //add location
          if (event.location0 && shouldAddLocation) {
            if (!usersOccupiedSessions.userPairs.has(event.location0.id)) {
              usersOccupiedSessions.userPairs.set(event.location0.id, {
                userId: event.location0.id,
                firstName: event.location0.firstName,
                lastName: null,
                numberOfSession: 0,
              });
            }

            let locationUserSessionInfo = usersOccupiedSessions.userPairs.get(
              event.location0.id,
            );
            locationUserSessionInfo.numberOfSession++;
          }
        }
      }
    }

    if (userToSessionFrequencyConstraint.consequenceTypeEachOrAll === 'each') {
      let userToSessionFrequencyConstraintRelations = {
        consequenceTypeEachOrAll: 'each',
        userToUserConstraintFrequency:
          userToSessionFrequencyConstraint.frequency,
        min: userToSessionFrequencyConstraint.min,
        max: userToSessionFrequencyConstraint.max,
        userPairsRelations: [],
        totalRelation: [],
      };
      for (let [userId, info] of usersOccupiedSessions.userPairs) {
        userToSessionFrequencyConstraintRelations.userPairsRelations.push({
          userId: userId,
          firstName: info.firstName,
          lastName: info.lastName,
          actual: info.numberOfSession,
        });
      }

      return userToSessionFrequencyConstraintRelations;
    }

    if (userToSessionFrequencyConstraint.consequenceTypeEachOrAll === 'all') {
      let userToSessionFrequencyConstraintRelations = {
        consequenceTypeEachOrAll: 'all',
        userToUserConstraintFrequency:
          userToSessionFrequencyConstraint.frequency,
        min: userToSessionFrequencyConstraint.min,
        max: userToSessionFrequencyConstraint.max,
        userPairsRelations: [],
        totalRelation: [],
      };

      userToSessionFrequencyConstraintRelations.totalRelation.push({
        actual: usersOccupiedSessions.totalNumberOfSessions,
      });

      return userToSessionFrequencyConstraintRelations;
    }
  }
}

async function getGapsconstraintUserRelation(data) {
  const roleHierarchy = data.roleHierarchy;
  let gapsConstraint = data.gapsconstraint;

  let consequenceUserId = gapsConstraint.consequenceUserId;
  let consequenceSubgroupId = gapsConstraint.consequenceSubgroupId;
  let consequenceRoleHierarchy = [];

  if (!data.consequenceRoleHierarchy) {
    Object.entries(roleHierarchy).map((t) => {
      const [key, value] = t;
      //push the decendents
      if (
        gapsConstraint.consequenceRole &&
        checkIntersection([gapsConstraint.consequenceRole.name], value)
      ) {
        consequenceRoleHierarchy.push(key);
      }
    });
  } else {
    consequenceRoleHierarchy = data.consequenceRoleHierarchy;
  }

  let startOfRange = moment.utc(data.date).toDate();
  let endOfRange = moment.utc(data.date).add(1, 'days').toDate();

  let gapsConstraintRelations = {
    id: gapsConstraint.id,
    constraintType: 'gaps',
    description: gapsConstraint.description,
    totalGapDurationInSecond: 0,
    gaps: [],
  };

  let result;
  let allEventStartEnds = new Array();
  if (!data.events) {
    result = await EventsDBApi.findAllEventsOfUserForConstraintBreakCheck({
      start: startOfRange,
      end: endOfRange,
      userId: data.userId,
    });

    const filteredEvents = result.rows.filter((e) => !e.isCancelled);

    result.rows = filteredEvents;
    result.count = filteredEvents.length;
  } else {
    result = data.events;
  }

  for (let j = 0; j < result.count; j++) {
    let event = result.rows[j];
    if (gapsConstraint.antecedentLocationId) {
      if (
        event.location0 === null ||
        gapsConstraint.antecedentLocationId !== event.location0.id
      ) {
        continue;
      }
    }

    if (gapsConstraint.antecedentTypeActivityId) {
      if (gapsConstraint.antecedentTypeActivityId !== event.activity0.id) {
        continue;
      }
    }

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

    let rruleObject = {
      freq: rule_RRule.RRule[event.frequency.toUpperCase()],
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
    let allEventsWithRule = rule.between(startOfRange, endOfRange, true);
    for (let p = 0; p < allEventsWithRule.length; p++) {
      let duration = calculateMinutesBetweenTimesIgnoreDates(
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

      let createdInDaylightSaving = moment(event.start).isDST();
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

      if (s >= startOfRange && s < endOfRange) {
        isTheBeginningInside = true;
        if (e <= endOfRange) {
          isTheEndingInside = true;
        }
      }

      if (!isTheBeginningInside) {
        if (e > startOfRange && e <= endOfRange) {
          isTheEndingInside = true;
        }
      }
      if (isTheBeginningInside || isTheEndingInside) {
        let isEventHasConsequenceUser = false;
        //check the users
        for (let i = 0; i < event.users.length; i++) {
          let currentUser = event.users[i];
          if (currentUser.id === data.userId) {
            continue;
          }
          //check the id
          if (consequenceUserId) {
            if (currentUser.id !== consequenceUserId) {
              continue;
            }
          }
          //check the role
          if (consequenceRoleHierarchy.length > 0) {
            let usersRoles = currentUser.roles.map((role) => role.name);
            if (!checkIntersection(usersRoles, consequenceRoleHierarchy)) {
              continue;
            }
          }

          //check the subgroups
          if (consequenceSubgroupId) {
            let userSubgroups = currentUser.subgroups.map((sbg) => sbg.id);
            if (!checkIntersection(userSubgroups, [consequenceSubgroupId])) {
              continue;
            }
          }

          isEventHasConsequenceUser = true;
          break;
        }

        //check the activity and location
        if (!isEventHasConsequenceUser) {
          let activityMatches = true;
          let loactionMatches = true;

          //check the id of activity and location
          if (consequenceUserId) {
            if (event.activity0.id !== consequenceUserId) {
              activityMatches = false;
            }

            if (event.location0 && event.location0.id !== consequenceUserId) {
              loactionMatches = false;
            }
          }
          //check the role of activity and location
          if (consequenceRoleHierarchy.length > 0) {
            let activityRoles = event.activity0.roles.map((role) => role.name);
            let locationRoles = [];
            if (event.location0 !== null) {
              locationRoles = event.location0.roles.map((role) => role.name);
            }
            if (!checkIntersection(activityRoles, consequenceRoleHierarchy)) {
              activityMatches = false;
            }

            if (!checkIntersection(locationRoles, consequenceRoleHierarchy)) {
              loactionMatches = false;
            }
          }

          //check the subgroups of activity and location
          if (consequenceSubgroupId) {
            let activitySubgroups = event.activity0.subgroups.map(
              (sbg) => sbg.id,
            );

            let locationSubgroups = [];
            if (event.location0 !== null) {
              locationSubgroups = event.location0.subgroups.map(
                (sbg) => sbg.id,
              );
            }
            if (
              !checkIntersection(activitySubgroups, [consequenceSubgroupId])
            ) {
              activityMatches = false;
            }

            if (
              !checkIntersection(locationSubgroups, [consequenceSubgroupId])
            ) {
              loactionMatches = false;
            }
          }

          if (activityMatches || (loactionMatches && event.location0)) {
            isEventHasConsequenceUser = true;
          }
        }

        //if event has consequence user
        if (isEventHasConsequenceUser) {
          //if it starts yesterday
          if (!isTheBeginningInside) {
            allEventStartEnds.push({
              start: moment.utc(e).startOf('day').toDate(),
              end: e,
            });
            continue;
          }

          //if it ends tomorrow
          if (!isTheEndingInside) {
            allEventStartEnds.push({
              start: s,
              end: moment.utc(s).endOf('day').toDate(),
            });
            continue;
          }

          //if fully inside
          allEventStartEnds.push({
            start: s,
            end: e,
          });
        }
      }
    }
  }

  let m = findGaps(allEventStartEnds);
  let allAvailabilityStartEnds = new Array();
  let allNonAvailabilityStartEnds = new Array();

  // get availabilities
  if (data.availabilities) {
    //loop thotigh availabilities for calculating the efficieny
    let availabilities = data.availabilities;
    for (let j = 0; j < availabilities.count; j++) {
      let availability = availabilities.rows[j];
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
          startOfRange.toISOString().split('T')[0] +
            ' ' +
            moment.utc(availability.startTime).format('HH:mm'),
          'YYYY-MM-DD HH:mm',
        )
        .add(-7, 'days')
        .toDate();
      const oneWeekLater = moment
        .utc(endOfRange.toISOString().split('T')[0], 'YYYY-MM-DD')
        .add(7, 'days')
        .toDate();

      if (start < oneWeekBefore) {
        start = oneWeekBefore;
      }

      if (end > oneWeekLater) {
        end = oneWeekLater;
      }

      let availabilityCreatedDate = moment
        .utc(availability.startTime)
        .startOf('day')
        .toDate();

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

        let isTheEndingInside = false;
        let isTheBeginningInside = false;

        //check if the availability lies in our range
        let s;
        let e;
        s = allAvailabilitiesWithRule[p];
        e = moment
          .utc(allAvailabilitiesWithRule[p])
          .add(duration, 'minutes')
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

        if (s >= startOfRange && s < endOfRange) {
          isTheBeginningInside = true;
          if (e <= endOfRange) {
            isTheEndingInside = true;
          }
        }

        if (!isTheBeginningInside) {
          if (e > startOfRange && e <= endOfRange) {
            isTheEndingInside = true;
          }
        }
        if (isTheBeginningInside || isTheEndingInside) {
          //if it starts yesterday
          if (!isTheBeginningInside) {
            if (availability.available === true) {
              allAvailabilityStartEnds.push({
                start: moment.utc(e).startOf('day').toDate(),
                end: e,
              });
            } else {
              allNonAvailabilityStartEnds.push({
                start: moment.utc(e).startOf('day').toDate(),
                end: e,
              });
            }

            continue;
          }

          //if it ends tomorrow
          if (!isTheEndingInside) {
            if (availability.available === true) {
              allAvailabilityStartEnds.push({
                start: s,
                end: moment.utc(s).endOf('day').toDate(),
              });
            } else {
              allNonAvailabilityStartEnds.push({
                start: s,
                end: moment.utc(s).endOf('day').toDate(),
              });
            }
            continue;
          }

          //if fully inside
          if (availability.available === true) {
            allAvailabilityStartEnds.push({
              start: s,
              end: e,
            });
          } else {
            allNonAvailabilityStartEnds.push({
              start: s,
              end: e,
            });
          }
        }
      }
    }
  }

  allAvailabilityStartEnds = findIntervalsNotInArray2(
    allAvailabilityStartEnds,
    allNonAvailabilityStartEnds,
  );

  // filter the gaps according the availabilities
  for (let l = 0; l < m.length; l++) {
    let gap = m[l];
    let gapIsOnAvailable = false;
    for (let q = 0; q < allAvailabilityStartEnds.length; q++) {
      if (
        gap.start >= allAvailabilityStartEnds[q].start &&
        gap.end <= allAvailabilityStartEnds[q].end
      ) {
        gapIsOnAvailable = true;
        break;
      }
    }
    if (gapIsOnAvailable) {
      gapsConstraintRelations.gaps.push(gap);
    }
  }

  for (let p = 0; p < gapsConstraintRelations.gaps.length; p++) {
    gapsConstraintRelations.totalGapDurationInSecond +=
      moment(gapsConstraintRelations.gaps[p].end).diff(
        moment(gapsConstraintRelations.gaps[p].start),
        'minutes',
      ) * 60;
  }

  return gapsConstraintRelations;
}

async function getBacktobackconstraintUserRelation(data) {
  const roleHierarchy = data.roleHierarchy;
  let backtobackConstraint = data.backtobackconstraint;

  let consequenceUserId = backtobackConstraint.consequenceUserId;
  let consequenceSubgroupId = backtobackConstraint.consequenceSubgroupId;
  let consequenceRoleHierarchy = [];

  if (!data.consequenceRoleHierarchy) {
    Object.entries(roleHierarchy).map((t) => {
      const [key, value] = t;
      //push the decendents
      if (
        backtobackConstraint.consequenceRole &&
        checkIntersection([backtobackConstraint.consequenceRole.name], value)
      ) {
        consequenceRoleHierarchy.push(key);
      }
    });
  } else {
    consequenceRoleHierarchy = data.consequenceRoleHierarchy;
  }

  let startOfRange = moment.utc(data.date).toDate();
  let endOfRange = moment.utc(data.date).add(1, 'days').toDate();

  let backtobackConstraintRelations = {
    id: backtobackConstraint.id,
    constraintType: 'backToBack',
    description: backtobackConstraint.description,
    backtobacks: [],
  };

  let result;
  let allEventStartEnds = new Array();
  if (!data.events) {
    result = await EventsDBApi.findAllEventsOfUserForConstraintBreakCheck({
      start: startOfRange,
      end: endOfRange,
      userId: data.userId,
    });

    const filteredEvents = result.rows.filter((e) => !e.isCancelled);

    result.rows = filteredEvents;
    result.count = filteredEvents.length;
  } else {
    result = data.events;
  }

  for (let j = 0; j < result.count; j++) {
    let event = result.rows[j];
    if (backtobackConstraint.antecedentLocationId) {
      if (
        event.location0 === null ||
        backtobackConstraint.antecedentLocationId !== event.location0.id
      ) {
        continue;
      }
    }

    if (backtobackConstraint.antecedentTypeActivityId) {
      if (
        backtobackConstraint.antecedentTypeActivityId !== event.activity0.id
      ) {
        continue;
      }
    }

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

    let rruleObject = {
      freq: rule_RRule.RRule[event.frequency.toUpperCase()],
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
    let allEventsWithRule = rule.between(startOfRange, endOfRange, true);
    for (let p = 0; p < allEventsWithRule.length; p++) {
      let duration = calculateMinutesBetweenTimesIgnoreDates(
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

      let createdInDaylightSaving = moment(event.start).isDST();
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

      if (s >= startOfRange && s < endOfRange) {
        isTheBeginningInside = true;
        if (e <= endOfRange) {
          isTheEndingInside = true;
        }
      }

      if (!isTheBeginningInside) {
        if (e > startOfRange && e <= endOfRange) {
          isTheEndingInside = true;
        }
      }
      if (isTheBeginningInside || isTheEndingInside) {
        let isEventHasConsequenceUser = false;
        //check the users
        for (let i = 0; i < event.users.length; i++) {
          let currentUser = event.users[i];
          if (currentUser.id === data.userId) {
            continue;
          }
          //check the id
          if (consequenceUserId) {
            if (currentUser.id !== consequenceUserId) {
              continue;
            }
          }
          //check the role
          if (consequenceRoleHierarchy.length > 0) {
            let usersRoles = currentUser.roles.map((role) => role.name);
            if (!checkIntersection(usersRoles, consequenceRoleHierarchy)) {
              continue;
            }
          }

          //check the subgroups
          if (consequenceSubgroupId) {
            let userSubgroups = currentUser.subgroups.map((sbg) => sbg.id);
            if (!checkIntersection(userSubgroups, [consequenceSubgroupId])) {
              continue;
            }
          }

          isEventHasConsequenceUser = true;
          break;
        }

        //check the activity and location
        if (!isEventHasConsequenceUser) {
          let activityMatches = true;
          let loactionMatches = true;

          //check the id of activity and location
          if (consequenceUserId) {
            if (event.activity0.id !== consequenceUserId) {
              activityMatches = false;
            }

            if (event.location0 && event.location0.id !== consequenceUserId) {
              loactionMatches = false;
            }
          }
          //check the role of activity and location
          if (consequenceRoleHierarchy.length > 0) {
            let activityRoles = event.activity0.roles.map((role) => role.name);
            let locationRoles = [];
            if (event.location0 !== null) {
              locationRoles = event.location0.roles.map((role) => role.name);
            }
            if (!checkIntersection(activityRoles, consequenceRoleHierarchy)) {
              activityMatches = false;
            }

            if (!checkIntersection(locationRoles, consequenceRoleHierarchy)) {
              loactionMatches = false;
            }
          }

          //check the subgroups of activity and location
          if (consequenceSubgroupId) {
            let activitySubgroups = event.activity0.subgroups.map(
              (sbg) => sbg.id,
            );

            let locationSubgroups = [];
            if (event.location0 !== null) {
              locationSubgroups = event.location0.subgroups.map(
                (sbg) => sbg.id,
              );
            }
            if (
              !checkIntersection(activitySubgroups, [consequenceSubgroupId])
            ) {
              activityMatches = false;
            }

            if (
              !checkIntersection(locationSubgroups, [consequenceSubgroupId])
            ) {
              loactionMatches = false;
            }
          }

          if (activityMatches || (loactionMatches && event.location0)) {
            isEventHasConsequenceUser = true;
          }
        }

        //if event has consequence user
        if (isEventHasConsequenceUser) {
          //if it starts yesterday
          if (!isTheBeginningInside) {
            allEventStartEnds.push({
              start: moment.utc(e).startOf('day').toDate(),
              end: e,
            });
            continue;
          }

          //if it ends tomorrow
          if (!isTheEndingInside) {
            allEventStartEnds.push({
              start: s,
              end: moment.utc(s).endOf('day').toDate(),
            });
            continue;
          }

          //if fully inside
          allEventStartEnds.push({
            start: s,
            end: e,
          });
        }
      }
    }
  }

  let startPoints = new Array();
  let endPoints = new Array();

  for (let k = 0; k < allEventStartEnds.length; k++) {
    startPoints.push(allEventStartEnds[k].start);
    endPoints.push(allEventStartEnds[k].end);
  }

  let m = findDateIntersection(startPoints, endPoints);
  backtobackConstraintRelations.backtobacks = m;

  return backtobackConstraintRelations;
}

async function getBreakQuantityconstraintUserRelation(data) {
  const roleHierarchy = data.roleHierarchy;
  let breakQuantityConstraint = data.breakQuantityconstraint;

  let consequenceUserId = breakQuantityConstraint.consequenceUserId;
  let consequenceSubgroupId = breakQuantityConstraint.consequenceSubgroupId;
  let consequenceRoleHierarchy = [];

  if (!data.consequenceRoleHierarchy) {
    Object.entries(roleHierarchy).map((t) => {
      const [key, value] = t;
      //push the decendents
      if (
        breakQuantityConstraint.consequenceRole &&
        checkIntersection([breakQuantityConstraint.consequenceRole.name], value)
      ) {
        consequenceRoleHierarchy.push(key);
      }
    });
  } else {
    consequenceRoleHierarchy = data.consequenceRoleHierarchy;
  }

  let startOfRange = moment.utc(data.date).toDate();
  let endOfRange = moment.utc(data.date).add(1, 'days').toDate();

  let breakQuantityConstraintRelations = {
    id: breakQuantityConstraint.id,
    constraintType: 'breakQuantity',
    description: breakQuantityConstraint.description,
    min: breakQuantityConstraint.min,
    max: breakQuantityConstraint.max,
    minSeconds: breakQuantityConstraint.min,
    maxSeconds: breakQuantityConstraint.max,
    unit: breakQuantityConstraint.units,
    actualNumberBreaks: 0,
    actualTotalDurationExceptBreaksInSeconds: 0,
    broken: false,
  };

  let result;
  if (!data.events) {
    result = await EventsDBApi.findAllEventsOfUserForConstraintBreakCheck({
      start: startOfRange,
      end: endOfRange,
      userId: data.userId,
    });

    const filteredEvents = result.rows.filter((e) => !e.isCancelled);

    result.rows = filteredEvents;
    result.count = filteredEvents.length;
  } else {
    result = data.events;
  }

  for (let j = 0; j < result.count; j++) {
    let event = result.rows[j];
    if (breakQuantityConstraint.antecedentLocationId) {
      if (
        event.location0 === null ||
        breakQuantityConstraint.antecedentLocationId !== event.location0.id
      ) {
        continue;
      }
    }

    if (breakQuantityConstraint.antecedentTypeActivityId) {
      if (
        breakQuantityConstraint.antecedentTypeActivityId !== event.activity0.id
      ) {
        continue;
      }
    }

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

    let rruleObject = {
      freq: rule_RRule.RRule[event.frequency.toUpperCase()],
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
    let allEventsWithRule = rule.between(startOfRange, endOfRange, true);
    for (let p = 0; p < allEventsWithRule.length; p++) {
      let duration = calculateMinutesBetweenTimesIgnoreDates(
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

      let createdInDaylightSaving = moment(event.start).isDST();
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

      if (s >= startOfRange && s < endOfRange) {
        isTheBeginningInside = true;
        if (e <= endOfRange) {
          isTheEndingInside = true;
        } else {
          duration = moment.utc(endOfRange).diff(moment.utc(s), 'minutes');
        }
      }

      if (!isTheBeginningInside) {
        if (e > startOfRange && e <= endOfRange) {
          isTheEndingInside = true;
          duration = moment.utc(e).diff(moment.utc(startOfRange), 'minutes');
        }
      }
      if (isTheBeginningInside || isTheEndingInside) {
        let isEventHasConsequenceUser = false;
        let isEventWorkingActivity = !event.activity0.notWorking;
        //check the users
        for (let i = 0; i < event.users.length; i++) {
          let currentUser = event.users[i];
          if (currentUser.id === data.userId) {
            continue;
          }
          //check the id
          if (consequenceUserId) {
            if (currentUser.id !== consequenceUserId) {
              continue;
            }
          }
          //check the role
          if (consequenceRoleHierarchy.length > 0) {
            let usersRoles = currentUser.roles.map((role) => role.name);
            if (!checkIntersection(usersRoles, consequenceRoleHierarchy)) {
              continue;
            }
          }

          //check the subgroups
          if (consequenceSubgroupId) {
            let userSubgroups = currentUser.subgroups.map((sbg) => sbg.id);
            if (!checkIntersection(userSubgroups, [consequenceSubgroupId])) {
              continue;
            }
          }

          isEventHasConsequenceUser = true;
          break;
        }

        //check the activity and location
        if (!isEventHasConsequenceUser) {
          let activityMatches = true;
          let loactionMatches = true;

          //check the id of activity and location
          if (consequenceUserId) {
            if (event.activity0.id !== consequenceUserId) {
              activityMatches = false;
            }

            if (event.location0 && event.location0.id !== consequenceUserId) {
              loactionMatches = false;
            }
          }
          //check the role of activity and location
          if (consequenceRoleHierarchy.length > 0) {
            let activityRoles = event.activity0.roles.map((role) => role.name);
            let locationRoles = [];
            if (event.location0 !== null) {
              locationRoles = event.location0.roles.map((role) => role.name);
            }
            if (!checkIntersection(activityRoles, consequenceRoleHierarchy)) {
              activityMatches = false;
            }

            if (!checkIntersection(locationRoles, consequenceRoleHierarchy)) {
              loactionMatches = false;
            }
          }

          //check the subgroups of activity and location
          if (consequenceSubgroupId) {
            let activitySubgroups = event.activity0.subgroups.map(
              (sbg) => sbg.id,
            );

            let locationSubgroups = [];
            if (event.location0 !== null) {
              locationSubgroups = event.location0.subgroups.map(
                (sbg) => sbg.id,
              );
            }
            if (
              !checkIntersection(activitySubgroups, [consequenceSubgroupId])
            ) {
              activityMatches = false;
            }

            if (
              !checkIntersection(locationSubgroups, [consequenceSubgroupId])
            ) {
              loactionMatches = false;
            }
          }

          if (activityMatches || (loactionMatches && event.location0)) {
            isEventHasConsequenceUser = true;
          }
        }

        //if event has consequence user
        if (isEventHasConsequenceUser) {
          breakQuantityConstraintRelations.actualNumberBreaks++;
        } else {
          if (isEventWorkingActivity) {
            breakQuantityConstraintRelations.actualTotalDurationExceptBreaksInSeconds +=
              duration * 60;
          }
        }
      }
    }
  }
  return breakQuantityConstraintRelations;
}

async function getGroupingconstraintUserRelation(data) {
  const roleHierarchy = data.roleHierarchy;
  let groupingConstraint = data.groupingconstraint;

  let consequenceUserId = groupingConstraint.consequenceUserId;
  let consequenceSubgroupId = groupingConstraint.consequenceSubgroupId;
  let consequenceRoleHierarchy = [];
  let mainUser = data.user;
  let subgroupIdsOfMainGroup = new Array();
  let subgroupsOfMainGroup = new Array();
  for (let k = 0; k < mainUser.subgroups.length; k++) {
    if (mainUser.subgroups[k].groupId === groupingConstraint.groupingId) {
      subgroupIdsOfMainGroup.push(mainUser.subgroups[k].id);
      subgroupsOfMainGroup.push(mainUser.subgroups[k]);
    }
  }

  let groupingConstraintRelations = {
    id: groupingConstraint.id,
    constraintType: 'grouping',
    description: groupingConstraint.description,
    brokenEvents: new Map(),
    antecedentUserSubgroups: subgroupsOfMainGroup,
  };

  if (!data.consequenceRoleHierarchy) {
    Object.entries(roleHierarchy).map((t) => {
      const [key, value] = t;
      //push the decendents
      if (
        groupingConstraint.consequenceRole &&
        checkIntersection([groupingConstraint.consequenceRole.name], value)
      ) {
        consequenceRoleHierarchy.push(key);
      }
    });
  } else {
    consequenceRoleHierarchy = data.consequenceRoleHierarchy;
  }

  let startOfRange = moment.utc(data.date).toDate();
  let endOfRange = moment.utc(data.date).add(1, 'days').toDate();

  let result;
  if (!data.events) {
    result = await EventsDBApi.findAllEventsOfUserForConstraintBreakCheck({
      start: startOfRange,
      end: endOfRange,
      userId: mainUser.userId,
    });

    const filteredEvents = result.rows.filter((e) => !e.isCancelled);

    result.rows = filteredEvents;
    result.count = filteredEvents.length;
  } else {
    result = data.events;
  }

  for (let j = 0; j < result.count; j++) {
    let event = result.rows[j];
    if (groupingConstraint.antecedentLocationId) {
      if (
        event.location0 === null ||
        groupingConstraint.antecedentLocationId !== event.location0.id
      ) {
        continue;
      }
    }

    if (groupingConstraint.antecedentTypeActivityId) {
      if (groupingConstraint.antecedentTypeActivityId !== event.activity0.id) {
        continue;
      }
    }

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

    let rruleObject = {
      freq: rule_RRule.RRule[event.frequency.toUpperCase()],
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
    let allEventsWithRule = rule.between(startOfRange, endOfRange, true);
    for (let p = 0; p < allEventsWithRule.length; p++) {
      let duration = calculateMinutesBetweenTimesIgnoreDates(
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

      let createdInDaylightSaving = moment(event.start).isDST();
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

      if (s >= startOfRange && s < endOfRange) {
        isTheBeginningInside = true;
        if (e <= endOfRange) {
          isTheEndingInside = true;
        }
      }

      if (!isTheBeginningInside) {
        if (e > startOfRange && e <= endOfRange) {
          isTheEndingInside = true;
        }
      }
      if (isTheBeginningInside || isTheEndingInside) {
        for (let i = 0; i < event.users.length; i++) {
          let currentUser = event.users[i];
          if (currentUser.id === mainUser.userId) {
            continue;
          }
          //check the id
          if (consequenceUserId) {
            if (currentUser.id !== consequenceUserId) {
              continue;
            }
          }
          //check the role
          if (consequenceRoleHierarchy.length > 0) {
            let usersRoles = currentUser.roles.map((role) => role.name);
            if (!checkIntersection(usersRoles, consequenceRoleHierarchy)) {
              continue;
            }
          }

          //check the subgroups
          if (consequenceSubgroupId) {
            let userSubgroups = currentUser.subgroups.map((sbg) => sbg.id);
            if (!checkIntersection(userSubgroups, [consequenceSubgroupId])) {
              continue;
            }
          }

          let userSubgroupIds = currentUser.subgroups.map((sbg) => sbg.id);
          if (checkIntersection(userSubgroupIds, subgroupIdsOfMainGroup)) {
            continue;
          }

          if (!groupingConstraintRelations.brokenEvents.has(event.id)) {
            groupingConstraintRelations.brokenEvents.set(event.id, {
              breakingUsers: [],
            });
          }

          let brokenEvent = groupingConstraintRelations.brokenEvents.get(
            event.id,
          );
          brokenEvent.breakingUsers.push({
            id: currentUser.id,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            subgroups: currentUser.subgroups.filter(
              (sbg) => sbg.groupId === groupingConstraint.groupingId,
            ),
          });
        }

        let shouldAddActivity = true;
        let shouldAddLocation = !!event.location0;

        //check the id of activity and location
        if (consequenceUserId) {
          if (event.activity0.id !== consequenceUserId) {
            shouldAddActivity = false;
          }

          if (event.location0 && event.location0.id !== consequenceUserId) {
            shouldAddLocation = false;
          }
        }
        //check the role of activity and location
        if (consequenceRoleHierarchy.length > 0) {
          let activityRoles = event.activity0.roles.map((role) => role.name);
          let locationRoles = [];
          if (event.location0 !== null) {
            locationRoles = event.location0.roles.map((role) => role.name);
          }
          if (!checkIntersection(activityRoles, consequenceRoleHierarchy)) {
            shouldAddActivity = false;
          }

          if (!checkIntersection(locationRoles, consequenceRoleHierarchy)) {
            shouldAddLocation = false;
          }
        }

        //check the subgroups of activity and location
        if (consequenceSubgroupId) {
          let activitySubgroups = event.activity0.subgroups.map(
            (sbg) => sbg.id,
          );

          let locationSubgroups = [];
          if (event.location0 !== null) {
            locationSubgroups = event.location0.subgroups.map((sbg) => sbg.id);
          }
          if (!checkIntersection(activitySubgroups, [consequenceSubgroupId])) {
            shouldAddActivity = false;
          }

          if (!checkIntersection(locationSubgroups, [consequenceSubgroupId])) {
            shouldAddLocation = false;
          }
        }

        //add activity
        if (shouldAddActivity) {
          let activitySubgroupIds = event.activity0.subgroups.map(
            (sbg) => sbg.id,
          );
          if (checkIntersection(activitySubgroupIds, subgroupIdsOfMainGroup)) {
            continue;
          }

          if (!groupingConstraintRelations.brokenEvents.has(event.id)) {
            groupingConstraintRelations.brokenEvents.set(event.id, {
              breakingUsers: [],
            });
          }

          let brokenEvent = groupingConstraintRelations.brokenEvents.get(
            event.id,
          );

          brokenEvent.breakingUsers.push({
            id: event.activity0.id,
            firstName: event.activity0.firstName,
            lastName: null,
          });
        }

        //add location
        if (event.location0 && shouldAddLocation) {
          let locationSubgroupIds = event.location0.subgroups.map(
            (sbg) => sbg.id,
          );
          if (checkIntersection(locationSubgroupIds, subgroupIdsOfMainGroup)) {
            continue;
          }

          if (!groupingConstraintRelations.brokenEvents.has(event.id)) {
            groupingConstraintRelations.brokenEvents.set(event.id, {
              breakingUsers: [],
            });
          }

          let brokenEvent = groupingConstraintRelations.brokenEvents.get(
            event.id,
          );

          brokenEvent.breakingUsers.push({
            id: event.location0.id,
            firstName: event.location0.firstName,
            lastName: null,
          });
        }
      }
    }
  }

  return groupingConstraintRelations;
}

async function getDriveconstraintUserRelation(data) {
  const roleHierarchy = data.roleHierarchy;
  let driveConstraint = data.driveConstraint;
  let distanceMatrix = data.distanceMatrix;

  let consequenceUserId = driveConstraint.consequenceUserId;
  let consequenceSubgroupId = driveConstraint.consequenceSubgroupId;
  let consequenceRoleHierarchy = [];

  if (!data.consequenceRoleHierarchy) {
    Object.entries(roleHierarchy).map((t) => {
      const [key, value] = t;
      //push the decendents
      if (
        driveConstraint.consequenceRole &&
        checkIntersection([driveConstraint.consequenceRole.name], value)
      ) {
        consequenceRoleHierarchy.push(key);
      }
    });
  } else {
    consequenceRoleHierarchy = data.consequenceRoleHierarchy;
  }

  let startOfRange = moment.utc(data.date).toDate();
  let endOfRange = moment.utc(data.date).add(1, 'days').toDate();

  let driveConstraintRelations = {
    id: driveConstraint.id,
    constraintType: 'drive',
    description: driveConstraint.description,
    totalDriveTimeInSecond: 0,
  };

  let result;
  let allEventStartEndLocations = new Array();
  if (!data.events) {
    result = await EventsDBApi.findAllEventsOfUserForConstraintBreakCheck({
      start: startOfRange,
      end: endOfRange,
      userId: data.userId,
    });

    const filteredEvents = result.rows.filter((e) => !e.isCancelled);

    result.rows = filteredEvents;
    result.count = filteredEvents.length;
  } else {
    result = data.events;
  }

  for (let j = 0; j < result.count; j++) {
    let event = result.rows[j];
    // move to next one if there is no location on this event
    if (event.location0 === null || event.location0.address === null) {
      continue;
    }

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

    let rruleObject = {
      freq: rule_RRule.RRule[event.frequency.toUpperCase()],
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
    let allEventsWithRule = rule.between(startOfRange, endOfRange, true);
    for (let p = 0; p < allEventsWithRule.length; p++) {
      let duration = calculateMinutesBetweenTimesIgnoreDates(
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

      let createdInDaylightSaving = moment(event.start).isDST();
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

      if (s >= startOfRange && s < endOfRange) {
        isTheBeginningInside = true;
        if (e <= endOfRange) {
          isTheEndingInside = true;
        }
      }

      if (!isTheBeginningInside) {
        if (e > startOfRange && e <= endOfRange) {
          isTheEndingInside = true;
        }
      }
      if (isTheBeginningInside || isTheEndingInside) {
        let isEventHasConsequenceUser = false;
        //check the users
        for (let i = 0; i < event.users.length; i++) {
          let currentUser = event.users[i];
          if (currentUser.id === data.userId) {
            continue;
          }
          //check the id
          if (consequenceUserId) {
            if (currentUser.id !== consequenceUserId) {
              continue;
            }
          }
          //check the role
          if (consequenceRoleHierarchy.length > 0) {
            let usersRoles = currentUser.roles.map((role) => role.name);
            if (!checkIntersection(usersRoles, consequenceRoleHierarchy)) {
              continue;
            }
          }

          //check the subgroups
          if (consequenceSubgroupId) {
            let userSubgroups = currentUser.subgroups.map((sbg) => sbg.id);
            if (!checkIntersection(userSubgroups, [consequenceSubgroupId])) {
              continue;
            }
          }

          isEventHasConsequenceUser = true;
          break;
        }

        //check the activity
        if (!isEventHasConsequenceUser) {
          let activityMatches = true;

          //check the id of activity
          if (consequenceUserId) {
            if (event.activity0.id !== consequenceUserId) {
              activityMatches = false;
            }
          }
          //check the role of activity
          if (consequenceRoleHierarchy.length > 0) {
            let activityRoles = event.activity0.roles.map((role) => role.name);
            if (!checkIntersection(activityRoles, consequenceRoleHierarchy)) {
              activityMatches = false;
            }
          }

          //check the subgroups of activity
          if (consequenceSubgroupId) {
            let activitySubgroups = event.activity0.subgroups.map(
              (sbg) => sbg.id,
            );

            if (
              !checkIntersection(activitySubgroups, [consequenceSubgroupId])
            ) {
              activityMatches = false;
            }
          }

          if (activityMatches) {
            isEventHasConsequenceUser = true;
          }
        }

        //if event has consequence user
        if (isEventHasConsequenceUser) {
          //if it starts yesterday
          if (!isTheBeginningInside) {
            allEventStartEndLocations.push({
              start: moment.utc(e).startOf('day').toDate(),
              end: e,
              location: event.location0.address,
            });
            continue;
          }

          //if it ends tomorrow
          if (!isTheEndingInside) {
            allEventStartEndLocations.push({
              start: s,
              end: moment.utc(s).endOf('day').toDate(),
              location: event.location0.address,
            });
            continue;
          }

          //if fully inside
          allEventStartEndLocations.push({
            start: s,
            end: e,
            location: event.location0.address,
          });
        }
      }
    }
  }

  // sort the events in ascending order
  allEventStartEndLocations.sort((a, b) => a.start - b.start);

  // add users home address at the beginning if the constraint is fromHome checked
  if (driveConstraint.fromHome && data.userAddress) {
    allEventStartEndLocations.unshift({
      start: null,
      end: null,
      location: data.userAddress,
    });
  }

  // calculate all durations for each interval
  for (
    let interval = 0;
    interval < allEventStartEndLocations.length - 1;
    interval++
  ) {
    let add1 = allEventStartEndLocations[interval].location;
    let add2 = allEventStartEndLocations[interval + 1].location;
    if (distanceMatrix.has([add1, add2].sort().join('|'))) {
      let d = distanceMatrix.get([add1, add2].sort().join('|'));
      if (d.durationInSecond) {
        driveConstraintRelations.totalDriveTimeInSecond += d.durationInSecond;
      }
    }
  }

  return driveConstraintRelations;
}

async function getDistanceconstraintUserRelation(data) {
  const roleHierarchy = data.roleHierarchy;
  let distanceConstraint = data.distanceConstraint;
  let distanceMatrix = data.distanceMatrix;

  let consequenceUserId = distanceConstraint.consequenceUserId;
  let consequenceSubgroupId = distanceConstraint.consequenceSubgroupId;
  let consequenceRoleHierarchy = [];

  if (!data.consequenceRoleHierarchy) {
    Object.entries(roleHierarchy).map((t) => {
      const [key, value] = t;
      //push the decendents
      if (
        distanceConstraint.consequenceRole &&
        checkIntersection([distanceConstraint.consequenceRole.name], value)
      ) {
        consequenceRoleHierarchy.push(key);
      }
    });
  } else {
    consequenceRoleHierarchy = data.consequenceRoleHierarchy;
  }

  let startOfRange = moment.utc(data.date).toDate();
  let endOfRange = moment.utc(data.date).add(1, 'days').toDate();

  let distanceConstraintRelations = {
    id: distanceConstraint.id,
    constraintType: 'distance',
    description: distanceConstraint.description,
    totalPassedDistanceInMeters: 0,
  };

  let result;
  let allEventStartEndLocations = new Array();
  if (!data.events) {
    result = await EventsDBApi.findAllEventsOfUserForConstraintBreakCheck({
      start: startOfRange,
      end: endOfRange,
      userId: data.userId,
    });

    const filteredEvents = result.rows.filter((e) => !e.isCancelled);

    result.rows = filteredEvents;
    result.count = filteredEvents.length;
  } else {
    result = data.events;
  }

  for (let j = 0; j < result.count; j++) {
    let event = result.rows[j];
    // move to next one if there is no location on this event
    if (event.location0 === null || event.location0.address === null) {
      continue;
    }

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

    let rruleObject = {
      freq: rule_RRule.RRule[event.frequency.toUpperCase()],
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
    let allEventsWithRule = rule.between(startOfRange, endOfRange, true);
    for (let p = 0; p < allEventsWithRule.length; p++) {
      let duration = calculateMinutesBetweenTimesIgnoreDates(
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

      let createdInDaylightSaving = moment(event.start).isDST();
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

      if (s >= startOfRange && s < endOfRange) {
        isTheBeginningInside = true;
        if (e <= endOfRange) {
          isTheEndingInside = true;
        }
      }

      if (!isTheBeginningInside) {
        if (e > startOfRange && e <= endOfRange) {
          isTheEndingInside = true;
        }
      }
      if (isTheBeginningInside || isTheEndingInside) {
        let isEventHasConsequenceUser = false;
        //check the users
        for (let i = 0; i < event.users.length; i++) {
          let currentUser = event.users[i];
          if (currentUser.id === data.userId) {
            continue;
          }
          //check the id
          if (consequenceUserId) {
            if (currentUser.id !== consequenceUserId) {
              continue;
            }
          }
          //check the role
          if (consequenceRoleHierarchy.length > 0) {
            let usersRoles = currentUser.roles.map((role) => role.name);
            if (!checkIntersection(usersRoles, consequenceRoleHierarchy)) {
              continue;
            }
          }

          //check the subgroups
          if (consequenceSubgroupId) {
            let userSubgroups = currentUser.subgroups.map((sbg) => sbg.id);
            if (!checkIntersection(userSubgroups, [consequenceSubgroupId])) {
              continue;
            }
          }

          isEventHasConsequenceUser = true;
          break;
        }

        //check the activity
        if (!isEventHasConsequenceUser) {
          let activityMatches = true;

          //check the id of activity
          if (consequenceUserId) {
            if (event.activity0.id !== consequenceUserId) {
              activityMatches = false;
            }
          }
          //check the role of activity
          if (consequenceRoleHierarchy.length > 0) {
            let activityRoles = event.activity0.roles.map((role) => role.name);
            if (!checkIntersection(activityRoles, consequenceRoleHierarchy)) {
              activityMatches = false;
            }
          }

          //check the subgroups of activity
          if (consequenceSubgroupId) {
            let activitySubgroups = event.activity0.subgroups.map(
              (sbg) => sbg.id,
            );

            if (
              !checkIntersection(activitySubgroups, [consequenceSubgroupId])
            ) {
              activityMatches = false;
            }
          }

          if (activityMatches) {
            isEventHasConsequenceUser = true;
          }
        }

        //if event has consequence user
        if (isEventHasConsequenceUser) {
          //if it starts yesterday
          if (!isTheBeginningInside) {
            allEventStartEndLocations.push({
              start: moment.utc(e).startOf('day').toDate(),
              end: e,
              location: event.location0.address,
            });
            continue;
          }

          //if it ends tomorrow
          if (!isTheEndingInside) {
            allEventStartEndLocations.push({
              start: s,
              end: moment.utc(s).endOf('day').toDate(),
              location: event.location0.address,
            });
            continue;
          }

          //if fully inside
          allEventStartEndLocations.push({
            start: s,
            end: e,
            location: event.location0.address,
          });
        }
      }
    }
  }

  // sort the events in ascending order
  allEventStartEndLocations.sort((a, b) => a.start - b.start);

  // add users home address at the beginning if the constraint is fromHome checked
  if (distanceConstraint.fromHome && data.userAddress) {
    allEventStartEndLocations.unshift({
      start: null,
      end: null,
      location: data.userAddress,
    });
  }

  // calculate all durations for each interval
  for (
    let interval = 0;
    interval < allEventStartEndLocations.length - 1;
    interval++
  ) {
    let add1 = allEventStartEndLocations[interval].location;
    let add2 = allEventStartEndLocations[interval + 1].location;
    if (distanceMatrix.has([add1, add2].sort().join('|'))) {
      let d = distanceMatrix.get([add1, add2].sort().join('|'));
      if (d.distanceInMeter) {
        distanceConstraintRelations.totalPassedDistanceInMeters +=
          d.distanceInMeter;
      }
    }
  }

  return distanceConstraintRelations;
}

async function getSupervisionRateconstraintUserRelation(data) {
  let supevisionRateConstraint = data.supervisionrateconstraint;
  let startOfConstraint = moment.utc(supevisionRateConstraint.start).toDate();
  let endOfConstraint = moment.utc(supevisionRateConstraint.end).toDate();

  let userInfo = {
    totalMinute: 0,
    supervisedMinute: 0,
    supervisionRate: 0,
  };

  if (supevisionRateConstraint.frequency === 'week') {
    // get the called date's week start and end dates
    startOfWeek = moment(data.date).startOf('week').toDate();
    endOfWeek = moment(data.date).endOf('week').toDate();
    // trim the interval if the week is not fully in interval
    if (startOfWeek < startOfConstraint) {
      startOfWeek = startOfConstraint;
    }

    if (endOfWeek > endOfConstraint) {
      endOfWeek = endOfConstraint;
    }

    let result;
    if (!data.events) {
      result = await EventsDBApi.findAllEventsOfUserForConstraintBreakCheck({
        start: startOfWeek,
        end: endOfWeek,
        userId: data.userId,
      });

      const filteredEvents = result.rows.filter((e) => !e.isCancelled);

      result.rows = filteredEvents;
      result.count = filteredEvents.length;
    } else {
      result = data.events;
    }

    // generate eventduration map for calculating the
    // supervised durations of each event
    let eventDurationMap = new Map();
    for (let p = 0; p < result.count; p++) {
      let duration = calculateMinutesBetweenTimesIgnoreDates(
        result.rows[p].end,
        result.rows[p].start,
      );
      eventDurationMap.set(result.rows[p].id, duration);
    }

    for (let j = 0; j < result.count; j++) {
      let event = result.rows[j];
      if (supevisionRateConstraint.antecedentLocationId) {
        if (
          event.location0 === null ||
          supevisionRateConstraint.antecedentLocationId !== event.location0.id
        ) {
          continue;
        }
      }

      if (
        supevisionRateConstraint.antecedentTypeActivityId !== event.activity0.id
      ) {
        continue;
      }

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

      let rruleObject = {
        freq: rule_RRule.RRule[event.frequency.toUpperCase()],
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
      let allEventsWithRule = rule.between(startOfWeek, endOfWeek, true);
      for (let p = 0; p < allEventsWithRule.length; p++) {
        let duration = calculateMinutesBetweenTimesIgnoreDates(
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

        let createdInDaylightSaving = moment(event.start).isDST();
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
        if (s >= startOfWeek && s < endOfWeek) {
          isTheBeginningInside = true;
          if (e <= endOfWeek) {
            isTheEndingInside = true;
          } else {
            duration = moment.utc(endOfWeek).diff(moment.utc(s), 'minutes');
          }
        }

        if (!isTheBeginningInside) {
          if (e > startOfWeek && e <= endOfWeek) {
            isTheEndingInside = true;
            duration = moment.utc(e).diff(moment.utc(startOfWeek), 'minutes');
          }
        }

        if (isTheBeginningInside || isTheEndingInside) {
          userInfo.totalMinute += duration;

          if (
            event.supervisionId &&
            eventDurationMap.has(event.supervisionId)
          ) {
            userInfo.supervisedMinute += eventDurationMap.get(
              event.supervisionId,
            );
          }
        }
      }
    }
  }

  if (supevisionRateConstraint.frequency === 'month') {
    // get the called date's month start and end dates
    startOfMonth = moment(data.date).startOf('month').toDate();
    endOfMonth = moment(data.date).endOf('month').toDate();
    // trim the interval if the month is not fully in interval
    if (startOfMonth < startOfConstraint) {
      startOfMonth = startOfConstraint;
    }

    if (endOfMonth > endOfConstraint) {
      endOfMonth = endOfConstraint;
    }

    let result;
    if (!data.events) {
      result = await EventsDBApi.findAllEventsOfUserForConstraintBreakCheck({
        start: startOfMonth,
        end: endOfMonth,
        userId: data.userId,
      });

      const filteredEvents = result.rows.filter((e) => !e.isCancelled);

      result.rows = filteredEvents;
      result.count = filteredEvents.length;
    } else {
      result = data.events;
    }

    // generate eventduration map for calculating the
    // supervised durations of each event
    let eventDurationMap = new Map();
    for (let p = 0; p < result.count; p++) {
      let duration = calculateMinutesBetweenTimesIgnoreDates(
        result.rows[p].end,
        result.rows[p].start,
      );
      eventDurationMap.set(result.rows[p].id, duration);
    }

    for (let j = 0; j < result.count; j++) {
      let event = result.rows[j];
      if (supevisionRateConstraint.antecedentLocationId) {
        if (
          event.location0 === null ||
          supevisionRateConstraint.antecedentLocationId !== event.location0.id
        ) {
          continue;
        }
      }

      if (
        supevisionRateConstraint.antecedentTypeActivityId !== event.activity0.id
      ) {
        continue;
      }

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

      let rruleObject = {
        freq: rule_RRule.RRule[event.frequency.toUpperCase()],
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
      let allEventsWithRule = rule.between(startOfMonth, endOfMonth, true);
      for (let p = 0; p < allEventsWithRule.length; p++) {
        let duration = calculateMinutesBetweenTimesIgnoreDates(
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

        let createdInDaylightSaving = moment(event.start).isDST();
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
        if (s >= startOfMonth && s < endOfMonth) {
          isTheBeginningInside = true;
          if (e <= endOfMonth) {
            isTheEndingInside = true;
          } else {
            duration = moment.utc(endOfMonth).diff(moment.utc(s), 'minutes');
          }
        }

        if (!isTheBeginningInside) {
          if (e > startOfMonth && e <= endOfMonth) {
            isTheEndingInside = true;
            duration = moment.utc(e).diff(moment.utc(startOfMonth), 'minutes');
          }
        }

        if (isTheBeginningInside || isTheEndingInside) {
          userInfo.totalMinute += duration;

          if (event.supervisionId) {
            userInfo.supervisedMinute += eventDurationMap.get(
              event.supervisionId,
            );
          }
        }
      }
    }
  }

  if (userInfo.supervisedMinute > 0) {
    userInfo.supervisionRate = Number(
      ((userInfo.supervisedMinute / userInfo.totalMinute) * 100).toFixed(2),
    );
  }

  return userInfo;
}

async function getSiblingBranchConstraintUserRelation(data) {
  let startOfRange = moment.utc(data.date).toDate();
  let endOfRange = moment.utc(data.date).add(1, 'days').toDate();

  let differentBranchPeopleEvents = [];

  let result;
  if (!data.events) {
    result = await EventsDBApi.findAllEventsOfUserForConstraintBreakCheck({
      start: startOfRange,
      end: endOfRange,
      userId: data.userId,
    });

    const filteredEvents = result.rows.filter((e) => !e.isCancelled);

    result.rows = filteredEvents;
    result.count = filteredEvents.length;
  } else {
    result = data.events;
  }

  for (let j = 0; j < result.count; j++) {
    let event = result.rows[j];

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

    let rruleObject = {
      freq: rule_RRule.RRule[event.frequency.toUpperCase()],
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
    let allEventsWithRule = rule.between(startOfRange, endOfRange, true);
    for (let p = 0; p < allEventsWithRule.length; p++) {
      let duration = calculateMinutesBetweenTimesIgnoreDates(
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

      let createdInDaylightSaving = moment(event.start).isDST();
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
      if (s >= startOfRange && s < endOfRange) {
        isTheBeginningInside = true;
        if (e <= endOfRange) {
          isTheEndingInside = true;
        }
      }

      if (!isTheBeginningInside) {
        if (e > startOfRange && e <= endOfRange) {
          isTheEndingInside = true;
        }
      }
      if (isTheBeginningInside || isTheEndingInside) {
        let peopleFromSiblingBranch = [];
        //check the users
        for (let i = 0; i < event.users.length; i++) {
          let currentUser = event.users[i];
          if (currentUser.id === data.userId) {
            continue;
          }

          let branchIdsOfSecondUser = currentUser.branches.map((br) => br.id);
          if (!checkIntersection(branchIdsOfSecondUser, data.userBranches)) {
            peopleFromSiblingBranch.push(
              currentUser.firstName + ' ' + currentUser?.lastName,
            );
          }
        }

        if (peopleFromSiblingBranch.length > 0) {
          differentBranchPeopleEvents.push({
            activity: event.activity0.firstName,
            conflictedPeople: peopleFromSiblingBranch,
            description: `<strong>${data.firstName} ${data.lastName}</strong> can not work with people from different branch.`,
          });
        }
      }
    }
  }

  return differentBranchPeopleEvents;
}

async function getGapsOnDayForUser(data) {
  let events = data.events;
  let startOfRange = data.start;
  let endOfRange = data.end;

  let allEventStartEnds = new Array();

  for (let j = 0; j < events.count; j++) {
    let event = events.rows[j];
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

    let rruleObject = {
      freq: rule_RRule.RRule[event.frequency.toUpperCase()],
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
    let allEventsWithRule = rule.between(startOfRange, endOfRange, true);
    for (let p = 0; p < allEventsWithRule.length; p++) {
      let duration = calculateMinutesBetweenTimesIgnoreDates(
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

      let createdInDaylightSaving = moment(event.start).isDST();
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

      if (s >= startOfRange && s < endOfRange) {
        isTheBeginningInside = true;
        if (e <= endOfRange) {
          isTheEndingInside = true;
        }
      }

      if (!isTheBeginningInside) {
        if (e > startOfRange && e <= endOfRange) {
          isTheEndingInside = true;
        }
      }
      if (isTheBeginningInside || isTheEndingInside) {
        //if it starts yesterday
        if (!isTheBeginningInside) {
          allEventStartEnds.push({
            start: moment.utc(e).startOf('day').toDate(),
            end: e,
          });
          continue;
        }

        //if it ends tomorrow
        if (!isTheEndingInside) {
          allEventStartEnds.push({
            start: s,
            end: moment.utc(s).endOf('day').toDate(),
          });
          continue;
        }

        //if fully inside
        allEventStartEnds.push({
          start: s,
          end: e,
        });
      }
    }
  }

  let m = findGaps(allEventStartEnds);
  return m;
}

async function getNotProperSlostOnDayForUser({ 
  events,
  availabilities,
  start: startOfRange,
  end: endOfRange,
  timezone: TZ,
  calculateEmptyAvailabilities = false,
  calculateNotAvailableBusy = false,
  calculateOverbookings = false,
 }) {
  let allEventStartEnds = new Array();
  let relatedEvents = new Array();
  let allAvailabilityStartEnds = new Array();
  let allNonAvailabilityStartEnds = new Array();
  let overbookingEvents = new Array();
  let emtptySlots = new Array();
  let mergedNotavailableBusySlots = new Array();

  //loop through events
  for (let j = 0; j < events.count; j++) {
    let event = events.rows[j];
    // generate the rule of event
    const startRuleAccordingEvent = moment
      .utc(
        event.startRecur + ' ' + moment2.tz(event.start, TZ).format('HH:mm'),
        'YYYY-MM-DD HH:mm',
      )
      .toDate();
    const endRuleAccordingEvent = moment2(event.endRecur).toDate();

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

    let rruleObject = {
      freq: rule_RRule.RRule[event.frequency.toUpperCase()],
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
    let allEventsWithRule = rule.between(startOfRange, endOfRange, true);
    for (let p = 0; p < allEventsWithRule.length; p++) {
      let duration = calculateMinutesBetweenTimesIgnoreDates(
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

      let createdInDaylightSaving = moment(event.start).isDST();
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

      if (s >= startOfRange && s < endOfRange) {
        isTheBeginningInside = true;
        if (e <= endOfRange) {
          isTheEndingInside = true;
        }
      }

      if (!isTheBeginningInside) {
        if (e > startOfRange && e <= endOfRange) {
          isTheEndingInside = true;
        }
      }
      if (isTheBeginningInside || isTheEndingInside) {
        //if it starts yesterday
        if (!isTheBeginningInside) {
          allEventStartEnds.push({
            start: moment.utc(e).startOf('day').toDate(),
            end: e,
          });
          relatedEvents.push(event);
          continue;
        }

        //if it ends tomorrow
        if (!isTheEndingInside) {
          allEventStartEnds.push({
            start: s,
            end: moment.utc(s).endOf('day').toDate(),
          });
          relatedEvents.push(event);
          continue;
        }

        //if fully inside
        allEventStartEnds.push({
          start: s,
          end: e,
        });
        relatedEvents.push(event);
      }
    }
  }

  if (calculateEmptyAvailabilities || calculateNotAvailableBusy) {
    //loop thotigh availabilities for calculating the efficieny
    for (let j = 0; j < availabilities.count; j++) {
      let availability = availabilities.rows[j];
      // generate the rule of event
      const startRule = moment
        .utc(
          availability.startRange +
            ' ' +
            moment2.tz(availability.startTime, TZ).format('HH:mm'),
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
          startOfRange.toISOString().split('T')[0] +
            ' ' +
            moment2.tz(availability.startTime, TZ).format('HH:mm'),
          'YYYY-MM-DD HH:mm',
        )
        .add(-7, 'days')
        .toDate();
      const oneWeekLater = moment
        .utc(endOfRange.toISOString().split('T')[0], 'YYYY-MM-DD')
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

      for (let p = 0; p < allAvailabilitiesWithRule.length; p++) {
        let duration = calculateMinutesBetweenTimesIgnoreDates(
          availability.endTime,
          availability.startTime,
        );

        let isTheEndingInside = false;
        let isTheBeginningInside = false;

        //check if the availability lies in our range
        let s;
        let e;
        s = allAvailabilitiesWithRule[p];
        e = moment
          .utc(allAvailabilitiesWithRule[p])
          .add(duration, 'minutes')
          .toDate();

        if (s >= startOfRange && s < endOfRange) {
          isTheBeginningInside = true;
          if (e <= endOfRange) {
            isTheEndingInside = true;
          }
        }

        if (!isTheBeginningInside) {
          if (e > startOfRange && e <= endOfRange) {
            isTheEndingInside = true;
          }
        }
        if (isTheBeginningInside || isTheEndingInside) {
          //if it starts yesterday
          if (!isTheBeginningInside) {
            if (availability.available === true) {
              allAvailabilityStartEnds.push({
                start: moment.utc(e).startOf('day').toDate(),
                end: e,
              });
            } else {
              allNonAvailabilityStartEnds.push({
                start: moment.utc(e).startOf('day').toDate(),
                end: e,
              });
            }
            continue;
          }

          //if it ends tomorrow
          if (!isTheEndingInside) {
            if (availability.available === true) {
              allAvailabilityStartEnds.push({
                start: s,
                end: moment.utc(s).endOf('day').toDate(),
              });
            } else {
              allNonAvailabilityStartEnds.push({
                start: s,
                end: moment.utc(s).endOf('day').toDate(),
              });
            }
            continue;
          }

          //if fully inside
          if (availability.available === true) {
            allAvailabilityStartEnds.push({
              start: s,
              end: e,
            });
          } else {
            allNonAvailabilityStartEnds.push({
              start: s,
              end: e,
            });
          }
        }
      }
    }

    allAvailabilityStartEnds = findIntervalsNotInArray2(
      allAvailabilityStartEnds,
      allNonAvailabilityStartEnds,
    );

    let clonedEventsOne = JSON.parse(JSON.stringify(allEventStartEnds));
    let clonedEventsTwo = JSON.parse(JSON.stringify(allEventStartEnds));

    let clonedAvailabilitiesOne = JSON.parse(
      JSON.stringify(allAvailabilityStartEnds),
    );
    let clonedAvailabilitiesTwo = JSON.parse(
      JSON.stringify(allAvailabilityStartEnds),
    );

    if (calculateEmptyAvailabilities) {
      /// calculate empty slots
      emtptySlots = findIntervalsNotInArray2(
        clonedAvailabilitiesOne,
        clonedEventsOne,
      );
    }

    if (calculateNotAvailableBusy) {
      // calculate not available busy slots
      let notavailableBusySlots = findIntervalsNotInArray2(
        clonedEventsTwo,
        clonedAvailabilitiesTwo,
      );

      cloneOfNotAvailableBusy = JSON.parse(
        JSON.stringify(notavailableBusySlots),
      );

      mergedNotavailableBusySlots = mergeOverlappingRanges(
        cloneOfNotAvailableBusy,
      );

      for (let i = 0; i < mergedNotavailableBusySlots.length; i++) {
        let currentSlot = mergedNotavailableBusySlots[i];
        if (currentSlot) {
          currentSlot.events = new Array();
          for (let j = 0; j < allEventStartEnds.length; j++) {
            if (
              currentSlot.start < allEventStartEnds[j].end &&
              currentSlot.end > allEventStartEnds[j].start
            ) {
              currentSlot.events.push(relatedEvents[j]);
            }
          }
        }
      }
    }
  }

  if (calculateOverbookings) {
    // calculate overbooking slots
    for (let m = 0; m < allEventStartEnds.length - 1; m++) {
      let event1 = allEventStartEnds[m];
      for (let n = m + 1; n < allEventStartEnds.length; n++) {
        let event2 = allEventStartEnds[n];
        let maxStart = event1.start;
        let minEnd = event1.end;

        // if the overlapping events are supervision of one another
        // then ignore the overlapping for that 2 events
        if (
          relatedEvents[n].id === relatedEvents[m].supervisionId ||
          relatedEvents[m].id === relatedEvents[n].supervisionId
        ) {
          continue;
        }

        if (event1.start < event2.start) {
          maxStart = event2.start;
        }

        if (event1.end > event2.end) {
          minEnd = event2.end;
        }

        if (minEnd > maxStart) {
          overbookingEvents.push({
            events: [relatedEvents[m], relatedEvents[n]],
            conflict: {
              start: maxStart,
              end: minEnd,
            },
          });
        }
      }
    }
  }

  return {
    empty: emtptySlots,
    notAvailableBusy: mergedNotavailableBusySlots,
    overbooking: overbookingEvents,
  };
}

function getStartOfWeekOfDate(date) {
  let calledDate = moment.utc(date).toDate();

  let weekDayOfDate = calledDate.getUTCDay();
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

function findIntervalsNotInArray2(array1, array2) {
  for (let i = 0; i < array1.length; ) {
    let interval1 = array1[i];
    const start1 = new Date(interval1.start).getTime();
    const end1 = new Date(interval1.end).getTime();
    let trimmed = false;
    for (const interval2 of array2) {
      const start2 = new Date(interval2.start).getTime();
      const end2 = new Date(interval2.end).getTime();

      if (start1 < end2 && end1 > start2) {
        let partlyTrimmed = false;
        // Check if interval1 starts before interval2
        if (start1 < start2) {
          array1.push({ start: interval1.start, end: interval2.start });
          partlyTrimmed = true;
          trimmed = true;
        }

        // Check if interval1 ends after interval2
        if (end1 > end2) {
          array1.push({ start: interval2.end, end: interval1.end });
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

function findGaps(intervals) {
  // Sort intervals by their start times
  intervals = mergeOverlappingRanges(intervals);
  intervals.sort((a, b) => a.start - b.start);

  const gaps = [];

  for (let i = 1; i < intervals.length; i++) {
    const previousEnd = intervals[i - 1].end;
    const currentStart = intervals[i].start;

    if (currentStart > previousEnd) {
      // Found a gap
      gaps.push({ start: previousEnd, end: currentStart });
    }
  }

  return gaps;
}

function mergeOverlappingRanges(ranges) {
  // Sort the ranges by start date
  if (ranges.length === 0) {
    return [];
  }
  ranges.sort((a, b) => new Date(a.start) - new Date(b.start));

  const mergedRanges = [];
  let currentRange = ranges[0];

  for (let i = 1; i < ranges.length; i++) {
    const nextRange = ranges[i];

    // Check for overlap
    if (currentRange.end >= nextRange.start) {
      // Merge the overlapping ranges
      if (nextRange.end > currentRange.end) {
        currentRange.end = nextRange.end;
      }
    } else {
      // No overlap, push the current merged range and start a new one
      mergedRanges.push(currentRange);
      currentRange = nextRange;
    }
  }

  // Push the last merged range
  mergedRanges.push(currentRange);
  return mergedRanges;
}

async function getMultiBranchUserEvents(data) {
  let events = data.events;
  let startOfRange = data.start;
  let endOfRange = data.end;
  let mainUserBranchStructure = data.usersBranchStructure;
  let mainUserId = data.userId;

  let multiBranchEvents = new Array();

  //loop through events
  for (let j = 0; j < events.count; j++) {
    let event = events.rows[j];
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

    let rruleObject = {
      freq: rule_RRule.RRule[event.frequency.toUpperCase()],
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
    let allEventsWithRule = rule.between(startOfRange, endOfRange, true);
    for (let p = 0; p < allEventsWithRule.length; p++) {
      let duration = calculateMinutesBetweenTimesIgnoreDates(
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

      let createdInDaylightSaving = moment(event.start).isDST();
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

      if (s >= startOfRange && s < endOfRange) {
        isTheBeginningInside = true;
        if (e <= endOfRange) {
          isTheEndingInside = true;
        }
      }

      if (!isTheBeginningInside) {
        if (e > startOfRange && e <= endOfRange) {
          isTheEndingInside = true;
        }
      }
      if (isTheBeginningInside || isTheEndingInside) {
        for (let p = 0; p < event.users.length; p++) {
          let currentUser = event.users[p];
          if (currentUser.id === mainUserId) {
            continue;
          }
          let branchIdsOfuser = currentUser.branches.map((branch) => branch.id);
          if (!checkIntersection(branchIdsOfuser, mainUserBranchStructure)) {
            multiBranchEvents.push({
              id: currentUser.id,
              firstName: currentUser.firstName,
              lastName: currentUser.lastName,
              branches: currentUser.branches,
              event: event,
            });
          }
        }
      }
    }
  }

  return multiBranchEvents;
}

module.exports = {
  getTimeconstraintUserRelation,
  getUnmatchingconstraintUserRelation,
  getMatchingconstraintUserRelation,
  getUserToUserFrequencyConstraintRelation,
  getUserToSessionFrequencyConstraintRelation,
  getStartOfWeekOfDate,
  getGapsOnDayForUser,
  getNotProperSlostOnDayForUser,
  getGapsconstraintUserRelation,
  getGroupingconstraintUserRelation,
  getAuthConstraintUserRelation,
  getSessionLengthconstraintUserRelation,
  getBreakQuantityconstraintUserRelation,
  getBacktobackconstraintUserRelation,
  getDriveconstraintUserRelation,
  getDistanceconstraintUserRelation,
  getMultiBranchUserEvents,
  getSupervisionRateconstraintUserRelation,
  getSiblingBranchConstraintUserRelation,
};
