const { Expo } = require('expo-server-sdk');

const logger = require('../services/logger/logger');

const sendPushNotification = async (mobiletokens, message, context =  'Unknown') => {
  logger.info('Started sending push notification for expo tokens');
  logger.info(`Send push notifications with context: ${context}`);
  if (!mobiletokens || mobiletokens.length === 0) return;

  const { title, body, data } = message;
  const expo = new Expo();

  let messages = [];
  for (const tokenObj of mobiletokens) {
    const expoToken = tokenObj.token;
    if (Expo.isExpoPushToken(expoToken)) {
      messages.push({ to: expoToken, sound: 'default', title, body, data });
    }
  }
  if (messages.length === 0) return;
  const chunks = expo.chunkPushNotifications(messages);

  const sendChunks = async () => {
    logger.info('Sending chunks');
    for (const chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        if (error.code === 'PUSH_TOO_MANY_EXPERIENCE_IDS' && error.details) {
          logger.warn('Multiple experience IDs detected, retrying with separated tokens...');
          await retryWithSeparatedExperiences(error.details);
        } else {
          logger.error(error, {
            message: 'Error sending chunk',
            code: error.code,
            tokens: chunk.map(msg => msg.to)
          });
        }
      }
    }
    logger.info('Finished sending chunks');
  };

  const retryWithSeparatedExperiences = async (experienceDetails) => {
    logger.info('Retrying with separated tokens');
    for (const [experienceId, tokens] of Object.entries(experienceDetails)) {
      if (!tokens || tokens.length === 0) continue;
      
      const experienceMessages = tokens.map(token => {
        return { to: token, sound: 'default', title, body, data };
      });
      
      const experienceChunks = expo.chunkPushNotifications(experienceMessages);
      
      for (const chunk of experienceChunks) {
        try {
          await expo.sendPushNotificationsAsync(chunk);
        } catch (retryError) {
          logger.error(retryError, {
            message: 'Failed to send notifications for experience',
            experienceId,
            error: retryError.message,
            code: retryError.code,
            tokens: chunk.map(msg => msg.to)
          });
        }
      }
    }
    logger.info('Finished retrying with separated tokens');
  };

  await sendChunks();

  logger.info('Finished sending push notification for expo tokens');
};

module.exports = sendPushNotification;