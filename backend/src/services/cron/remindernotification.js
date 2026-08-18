const cron = require('node-cron');
const generateCronFormulaForReminderNotifications = require('../../utils/generateCronFormulaForReminderNotifications');
const config = require('../../config');

const {
  fillCacheWithPushNotifications,
  sendReminderPushNotifications,
  sendReminderPushNotificationsDirectlyToUsers,
} = require('../../utils/reminderPushNotification');

const MINUTES_BEFORE_SEND_NOTIFICATION = 10;

const fillTheCacheWithNotifications = () => {
  cron.schedule('45 * * * *', () => fillCacheWithPushNotifications());
};

const sendReminderPushNotificationsToUsers = () => {
  cron.schedule('* * * * *', () => sendReminderPushNotifications());
};

const sendReminderPushNotificationsDirectly = () => {
  console.log(`Scheduled Notification is starting on ${config.nodeAppInstance} instance !`)
  let cronFormula = generateCronFormulaForReminderNotifications(MINUTES_BEFORE_SEND_NOTIFICATION)
  cron.schedule(cronFormula, () => sendReminderPushNotificationsDirectlyToUsers(MINUTES_BEFORE_SEND_NOTIFICATION));
};

module.exports = {
  fillTheCacheWithNotifications,
  sendReminderPushNotificationsToUsers,
  sendReminderPushNotificationsDirectly,
};
