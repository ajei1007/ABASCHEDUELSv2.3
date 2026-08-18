/**
 * rateLimiter.js
 *
 * Toggle the whole feature with one constant.
 *   ENABLE_RATE_LIMIT = false → ALL rate-limiting disabled (noop middleware).
 *   ENABLE_RATE_LIMIT = true  → Same behaviour as before (memory or Redis store).
 */

const ENABLE_RATE_LIMIT = false;            // <---- Hard-coded switch

// ───────────────────────────────────────────────────────────────────────────────
// Fast exit when disabled
// ───────────────────────────────────────────────────────────────────────────────
if (!ENABLE_RATE_LIMIT) {
  console.log('[RateLimiter] Globally DISABLED – no limits applied');
  module.exports = {
    applyRateLimiterByRoute: (_, __, next) => next(),
  };
  return;                                   // nothing else is loaded
}

// ───────────────────────────────────────────────────────────────────────────────
// FULL ORIGINAL LOGIC (unchanged) – only evaluated when enabled
// ───────────────────────────────────────────────────────────────────────────────
const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redisClient = require('../cache');
const { redis: redisConfig } = require('../config');

const RATE_LIMIT_CONSTANTS = {
  DEFAULT:            { WINDOW_MS: 1_000,  MAX_REQUESTS: 100, KEY_PREFIX: 'rate-limit:default:'           },
  AUTH:               { WINDOW_MS: 60_000, MAX_REQUESTS: 10,  KEY_PREFIX: 'rate-limit:auth:'              },
  OPTIMIZER:          { WINDOW_MS: 60_000, MAX_REQUESTS: 30,  KEY_PREFIX: 'rate-limit:optimizer:'         },
  SOLUTION_GENERATOR: { WINDOW_MS: 60_000, MAX_REQUESTS: 30,  KEY_PREFIX: 'rate-limit:solution-generator:' },
};

const DEFAULT_ERROR_MESSAGE = 'Too many requests from this IP, please try again later';

const buildLimiter = ({ WINDOW_MS, MAX_REQUESTS, KEY_PREFIX }) => {
  const options = {
    windowMs: WINDOW_MS,
    max:      MAX_REQUESTS,
    message:  DEFAULT_ERROR_MESSAGE,
    standardHeaders: true,
    legacyHeaders:   false,
  };

  if (!redisConfig.isDisabled) {
    options.store = new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
      prefix: KEY_PREFIX,
    });
  }

  return rateLimit(options);
};

const limiters = {
  default:          buildLimiter(RATE_LIMIT_CONSTANTS.DEFAULT),
  auth:             buildLimiter(RATE_LIMIT_CONSTANTS.AUTH),
  optimizer:        buildLimiter(RATE_LIMIT_CONSTANTS.OPTIMIZER),
  solutionGenerator:buildLimiter(RATE_LIMIT_CONSTANTS.SOLUTION_GENERATOR),
};

console.log(`[RateLimiter] Enabled with ${redisConfig.isDisabled ? 'Memory' : 'Redis'} store`);

const applyRateLimiterByRoute = (req, res, next) => {
  if (req.path.startsWith('/api/auth/'))                 return limiters.auth(req, res, next);
  if (req.path.startsWith('/api/optimizer'))             return limiters.optimizer(req, res, next);
  if (req.path.startsWith('/api/solution-generator'))    return limiters.solutionGenerator(req, res, next);
  return limiters.default(req, res, next);
};

module.exports = { applyRateLimiterByRoute };
