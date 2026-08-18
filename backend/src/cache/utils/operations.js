const redisClient = require('..');
const { redis: redisConfig } = require('../../config');

const redisHashGet = async (name, key) => {
  // Skip Redis operations if disabled
  if (redisConfig.isDisabled) {
    return null;
  }

  try {
    const res = await redisClient.hGet(name, key);
    return res;
  } catch (error) {
    return [];
  }
}

const redisKeys = async (name) => {
  // Skip Redis operations if disabled
  if (redisConfig.isDisabled) {
    return [];
  }

  try {
    const res = await redisClient.hKeys(name);
    return res;
  } catch (error) {
    return [];
  }
}

const redisGetAll = async (name) => {
  // Skip Redis operations if disabled
  if (redisConfig.isDisabled) {
    return [];
  }
  
  try {
    const keys = await redisClient.hKeys(name);
    return keys;
  } catch (error) {
    return [];
  }
}

const redisHashSet = async (name, key, value) => {
  // Skip Redis operations if disabled
  if (redisConfig.isDisabled) {
    return true;
  }
  
  try {
    await redisClient.hSet(name, key, value);
    return true;
  } catch (error) {
    return false;
  }
}

const redisSet = async (key, value) => {
  // Skip Redis operations if disabled
  if (redisConfig.isDisabled) {
    return true;
  }
  
  try {
    await redisClient.set(key, value);
    return true;
  } catch (error) {
    return false;
  }
}

const redisGet = async (key) => {
  // Skip Redis operations if disabled
  if (redisConfig.isDisabled) {
    return null;
  }
  
  try {
    const res = await redisClient.get(key);
    return res;
  } catch (error) {
    return null;
  }
}

const redisDel = async (key) => {
  // Skip Redis operations if disabled
  if (redisConfig.isDisabled) {
    return;
  }

  await redisClient.del(key);
}

const redisSetMultiple = async (name, values) => {
  // Skip Redis operations if disabled
  if (redisConfig.isDisabled) {
    return;
  }

  for (const val of values) {
    const findVal = await redisHashGet(name, val.id);
    if (!findVal) {
      await redisHashSet(name, val.id, JSON.stringify(val));
    }
  }
}

const redisUpdateMultiple = async (name, values) => {
  // Skip Redis operations if disabled
  if (redisConfig.isDisabled) {
    return;
  }

  for (const val of values) {
    await redisHashSet(name, val.id, JSON.stringify(val));
  }
}

const redisRemoveAll = async (name) => {
  // Skip Redis operations if disabled
  if (redisConfig.isDisabled) {
    return;
  }

  const values = await redisGetAll(name);
  if (values && values.length) {
    for (const val of values) {
      await redisClient.hDel(name, val);
    }
  }
}

const redisRemoveById = async (name, id) => {
  // Skip Redis operations if disabled
  if (redisConfig.isDisabled) {
    return;
  }

  await redisClient.hDel(name, id);
}

const flushCache = () => {
  // Skip Redis operations if disabled
  if (redisConfig.isDisabled) {
    console.log('Redis disabled: Skipping cache flush');
    return Promise.resolve('OK');
  }
  
  return redisClient.flushAll()
    .then(reply => console.log('Flushall done:', reply))
    .catch(err => console.error('Error:', err));
}

module.exports = {
  redisHashGet,
  redisKeys,
  redisGetAll,
  redisHashSet,
  redisSet,
  redisGet,
  redisSetMultiple,
  redisRemoveById,
  redisRemoveAll,
  redisUpdateMultiple,
  redisDel,
  flushCache
}