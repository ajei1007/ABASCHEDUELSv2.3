const redis = require('redis');
const { redis: redisConfig } = require('../src/config');

(async () => {
  try {
    if (redisConfig.isDisabled) {
      console.log('Redis is disabled. Skipping Redis flush.');
      process.exit(0); // Exit successfully
    }

    // Create a client using your environment variable
    console.log('+++++++ REDIS_URL', redisConfig.url)
    const client = redis.createClient({ url: redisConfig.url });

    // Connect to Redis
    await client.connect();

    // Flush the database
    await client.flushAll();

    console.log('Redis cache has been flushed!');
  } catch (err) {
    console.error('Error flushing Redis:', err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();