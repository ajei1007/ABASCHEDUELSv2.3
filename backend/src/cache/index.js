const redis = require('redis');
const config = require('../config');

let redisClient

if (!config.redis.isDisabled) {
  const redisUrl = config.redis.url;

  redisClient = redis.createClient({
    url: redisUrl,
  });

redisClient.on('error', (error) => {
  console.error('REDIS CLIENT ERROR:', error);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis cluster:', redisUrl);
});

redisClient.connect()
  .catch((err) => {
    console.error('Error connecting to Redis:', err);
  });
}

module.exports = redisClient;
