const EventClockTimerDBApi = require('../db/api/eventClockTimer');
const db = require('../db/models');
const { storePushNotificationToRedis } = require('../cache/pushNotification');
const moment = require('moment-timezone');
const NOTIFICATION_VALIDATOR_KEYS = require('../services/notifications/validation/validatorKeys');
const { calculateMinutesBetweenTimesIgnoreDates } = require('./calculateMinutesBetweenTimesIgnoreDates');
const CLOCK_OUT_BUFFER_MINUTES = 10;

const scheduleClockOutReminder = async (eventClockTimerId, transaction) => {
    const eventClockTimer = await EventClockTimerDBApi.findById(eventClockTimerId, {
        attributes: ['id', 'start_time'],
        include: [
            {
                model: db.events,
                attributes: ['id', 'start', 'end', 'timezone']
            },
            {
              model: db.users,
              as: 'user',
              attributes: ['id'],
          }
        ],
        transaction
    });

    const { start_time } = eventClockTimer;
    const { start, end } = eventClockTimer.event;

    const startTimeUtc = moment.utc(start_time);

    const eventDurationMs = calculateMinutesBetweenTimesIgnoreDates(end, start) * 60 * 1000;   // in milliseconds
    const bufferMs = CLOCK_OUT_BUFFER_MINUTES * 60 * 1000;
    const now = moment.utc().valueOf();

    const reminderTimestamp = startTimeUtc + eventDurationMs + bufferMs;

    const delay = reminderTimestamp - now;

    if (delay > 0) {
      await storePushNotificationToRedis(eventClockTimer.event.id, reminderTimestamp, {
        user_id: eventClockTimer.user.id,
        time: moment
        .utc(reminderTimestamp)
        .format('YYYY-MM-DD HH:mm:ss'),
        title: 'Clock out reminder',
        message: `Please clock out from the event ${eventClockTimer.event.id}`,
        data: {
          eventClockTimerId: eventClockTimer.id,
          eventId: eventClockTimer.event.id,
        },
        validatorKey: NOTIFICATION_VALIDATOR_KEYS.CLOCK_OUT_REMINDER,
      });

      console.log(`Scheduled clock-out reminder for event ${eventClockTimer.event.id} after ${delay}ms`);
    } else {
      console.log(`Event ${eventClockTimer.event.id} already passed. No clock out reminder scheduled.`);
    }
};

module.exports = {
    scheduleClockOutReminder,
};
