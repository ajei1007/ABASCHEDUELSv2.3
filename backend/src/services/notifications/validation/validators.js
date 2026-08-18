const EventClockTimerDBApi = require('../../../db/api/eventClockTimer');
const NOTIFICATION_VALIDATOR_KEYS = require('./validatorKeys');

const validators = {
  [NOTIFICATION_VALIDATOR_KEYS.CLOCK_OUT_REMINDER]: async (notification) => {
    const { eventClockTimerId } = notification.data;

    const eventClockTimer = await EventClockTimerDBApi.findById(eventClockTimerId, {
      attributes: ['end_time']
    });

    return eventClockTimer && !eventClockTimer.end_time;
  },
};

async function validateNotification(validatorKey, notification) {
  if (!validatorKey || !validators[validatorKey]) return true;
  return validators[validatorKey](notification);
}

module.exports = validateNotification;
