const EventsDBApi = require('../db/api/events');
const SettingsDBApi = require('../db/api/settings');

const moment = require('moment');
const rule_RRule = require('rrule');

const {
  storePushNotificationToRedis,
  getPushNotificationsForCurrentMinute,
} = require('../cache/pushNotification');
const sendPushNotification = require('./sendPushNotification');

const MinutesBeforeSendNotification = 10;

const fillCacheWithPushNotifications = async () => {
  console.log('sagatdaky push nitificationlary cache-a yazyp basladym');
  console.time('sagatdaky cron task');

  const now = new Date();
  const beginning = moment.utc(now).add(15, 'minutes').toDate();
  const ending = moment.utc(now).add(75, 'minutes').toDate();

  const beginningTime = moment.utc(now).add(15, 'minutes').format('HH:mm:ss');
  const endingTime = moment.utc(now).add(75, 'minutes').format('HH:mm:ss');
  console.time('eventlary aldym ine');
  const events = await EventsDBApi.findAllForPushNotificationReminder({
    start: beginning,
    end: ending,
    startTime: beginningTime,
    endTime: endingTime,
  });
  console.timeEnd('eventlary aldym ine');
  console.log(events.count);

  for (let i = 0; i < events.count; i++) {
    let event = events.rows[i];

    // if event is cancelled then just continue
    if (event.isCancelled) {
      continue;
    }

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

    let rruleObject = {
      freq: rule_RRule.RRule[event.frequency.toUpperCase()],
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
    let allEventsWithRuleInRange = rule.between(beginning, ending);
    if (allEventsWithRuleInRange.length > 0) {
      const timestampOfDate =
        allEventsWithRuleInRange[0].getTime() -
        MinutesBeforeSendNotification * 60 * 1000;
      for (let j = 0; j < event.users.length; j++) {
        let user = event.users[j];

        await storePushNotificationToRedis(event.id, timestampOfDate, {
          user_id: user.id,
          title: 'Upcoming appointment',
          time: moment
            .utc(allEventsWithRuleInRange[0])
            .add(-MinutesBeforeSendNotification, 'minutes')
            .format('YYYY-MM-DD HH:mm:ss'),
          message:
            'Dear ' +
            user.firstName +
            ' ' +
            user.lastName +
            ', you have upcoming ' +
            event.activity0.firstName +
            ' in 10 minutes. Have a nice day.',
        });
      }
    }
  }
  console.timeEnd('sagatdaky cron task');
};

const sendReminderPushNotifications = async () => {
  const now = new Date();
  const timeStamp = moment.utc(now).startOf('minute').toDate().getTime();

  await getPushNotificationsForCurrentMinute(timeStamp);
};

const sendReminderPushNotificationsDirectlyToUsers = async (minuteBefore) => {
  console.time(`push notofications of upcoming ${minuteBefore} minute`);
  console.log(`Started to send notification of upcoming ${minuteBefore} minute`);

  const now = new Date();
  const beginning = moment
    .utc(now)
    .add(minuteBefore, 'minutes')
    .startOf('minute')
    .toDate();
  const ending = moment.utc(now).add(minuteBefore+1, 'minutes').startOf('minute').toDate();
  const beginningTime = moment
    .utc(now)
    .add(minuteBefore, 'minutes')
    .startOf('minute')
    .format('HH:mm:ss');
  const endingTime = moment
    .utc(now)
    .add(minuteBefore+1, 'minutes')
    .startOf('minute')
    .format('HH:mm:ss');
  console.time('Got events in');
  const events =
    await EventsDBApi.findEventsForPushNotificationReminderUpcomingMinute({
      start: beginning,
      end: ending,
      startTime: beginningTime,
      endTime: endingTime,
    });
  console.timeEnd('Got events in');

  let enabledUsers =
    await SettingsDBApi.findAllReminderNotificationEnabledUserIds();

  let reminderEnabledUsers = new Map();

  for (let j = 0; j < enabledUsers.count; j++) {
    reminderEnabledUsers.set(enabledUsers.rows[j].createdById, true);
  }

 
  
  for (let i = 0; i < events.count; i++) {
    let event = events.rows[i];
    
    // if event is cancelled then just continue
    if (event.isCancelled) {
      continue;
    }

    // generate the rule of event
    const startRule = moment
      .utc(
        event.startRecur + ' ' + moment.utc(event.start).format('HH:mm'),
        'YYYY-MM-DD HH:mm',
      )
      .toDate();
    const endRule = moment.utc(event.endRecur).toDate();
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
    // -1 second for getting the beginning of current minute
    let allEventsWithRuleInRange = rule.between(
      moment.utc(beginning).add(-1, 'seconds').toDate(),
      ending,
    );
    const eventActivity = event.activity0.firstName;
    const eventLocation = event?.location0?.firstName ?? '';

    if (allEventsWithRuleInRange.length > 0) {
      for (let j = 0; j < event.users.length; j++) {
        if (reminderEnabledUsers.has(event.users[j].id)) {
          let user = event.users[j];
          let title = 'Upcoming appointment';
          let body = `Dear ${user.firstName} ${user.lastName}, you have upcoming ${eventActivity} ${eventLocation ? `in ${eventLocation} ` : ''}in ${minuteBefore} minutes. Have a nice day.`
          let data = { eventId: event.id, date: event.start };
          sendPushNotification(user.mobiletokens, { title, body, data });
        }
      }
    }
  }
  console.timeEnd(`push notofications of upcoming ${minuteBefore} minute`);
};

module.exports = {
  fillCacheWithPushNotifications,
  sendReminderPushNotifications,
  sendReminderPushNotificationsDirectlyToUsers,
};
