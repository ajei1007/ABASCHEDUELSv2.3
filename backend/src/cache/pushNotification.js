const redisClient = require('.');
const crypto = require('crypto');
const sendPushNotification = require('../utils/sendPushNotification');
const { redis: redisConfig } = require('../config');
const UsersDBApi = require('../db/api/users');
const validateNotification = require('../services/notifications/validation/validators');

const expirationInSeconds = 43200 // 12 hours

// Function to generate a unique notification ID
function generateNotificationId() {
  return crypto.randomBytes(6).toString('hex');
}

// Function to store a notification in Redis
async function storePushNotificationToRedis(
  eventId,
  timestamp,
  notificationData,
) {
  // Skip Redis operations if disabled
  if (redisConfig.isDisabled) {
    console.log('Redis disabled: Skipping push notification storage');
    return;
  }

  // Create a unique notification ID
  const notificationId = generateNotificationId();

  // // Add the notification to the sorted set
  await redisClient.ZADD('notifications', {
    score: timestamp,
    value: notificationId,
  });

  // // Create a hash for the notification details
  const notificationKey = `notification:${notificationId}`;
  await redisClient.hSet(notificationKey, 'event_id', eventId);
  await redisClient.hSet(notificationKey, 'user_id', notificationData.user_id)
  await redisClient.hSet(notificationKey, 'message', notificationData.message);
  await redisClient.hSet(notificationKey, 'title', notificationData.title);
  await redisClient.hSet(notificationKey, 'time', notificationData.time);
  await redisClient.hSet(notificationKey, 'data', JSON.stringify(notificationData.data));

  if (notificationData.validatorKey) {
    await redisClient.hSet(notificationKey, 'validator_key', notificationData.validatorKey);
  }

  await redisClient.expire(notificationKey, expirationInSeconds);
}

async function removePushNotificationFromRedisById(notificationId) {
  if (redisConfig.isDisabled) {
    console.log('Redis disabled: Skipping push notification removal');
    return;
  }

  const notificationKey = `notification:${notificationId}`;
  await redisClient.zRem('notifications', notificationId);
  await redisClient.del(notificationKey);
}

// Function to remove a notification from Redis
function removePushNotificationFromRedis(eventId) {
  // Skip Redis operations if disabled
  if (redisConfig.isDisabled) {
    console.log('Redis disabled: Skipping push notification removal');
    return;
  }

  // Search for the notification associated with the event ID
  const notificationKeyPattern = `notification:*`;
  redisClient.scan(
    0,
    'MATCH',
    notificationKeyPattern,
    'COUNT',
    100,
    (err, result) => {
      if (err) {
        console.error('Error searching for notification:', err);
        return;
      }

      const [cursor, keys] = result;

      // Iterate over the matching keys
      for (const key of keys) {
        // Retrieve the event ID from the hash
        redisClient.hget(key, 'event_id', (err, storedEventId) => {
          if (err) {
            console.error('Error retrieving event ID:', err);
            return;
          }

          // Check if the stored event ID matches the provided event ID
          if (storedEventId === eventId) {
            // Remove the notification from the sorted set
            const notificationId = key.split(':')[1];
            redisClient.zRem('notifications', notificationId);

            // Delete the associated hash
            redisClient.del(key);
            console.log('Notification removed for the event ID:', eventId);
            return;
          }
        });
      }

      // If no matching notification is found
      if (cursor === '0') {
        console.log('No notification found for the event ID:', eventId);
      }
    },
  );
}

// Function to retrieve notifications for the current minute
async function getPushNotificationsForCurrentMinute(minute) {
  // Skip Redis operations if disabled
  if (redisConfig.isDisabled) {
    return;
  }

  try {
    const notificationIds = await redisClient.zRangeByScore('notifications', minute, minute + 60 * 1000);
    
    for (const notificationId of notificationIds) {
      const notificationKey = `notification:${notificationId}`;
      const notificationDetails = await redisClient.hGetAll(notificationKey);

      if (notificationDetails.data) {
        notificationDetails.data = JSON.parse(notificationDetails.data);
      }

      const title = notificationDetails.title
      const body = notificationDetails.message
      const data = notificationDetails.data ? notificationDetails.data : {};

      const validatorKey = notificationDetails.validator_key;

      const isValid = await validateNotification(validatorKey, notificationDetails);

      if (!isValid) {
        await removePushNotificationFromRedisById(notificationId);
        continue;
      }

      const userId = notificationDetails.user_id

      const user = await UsersDBApi.findBy({ id: userId })

      sendPushNotification(user.mobiletokens, {title, body, data})

      await removePushNotificationFromRedisById(notificationId);
    }
  } catch (err) {
    console.error('Error retrieving notifications:', err);
  }
}

module.exports = {
  storePushNotificationToRedis,
  removePushNotificationFromRedis,
  getPushNotificationsForCurrentMinute,
};
