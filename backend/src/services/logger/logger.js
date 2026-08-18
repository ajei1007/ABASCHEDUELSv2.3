// logger.js
const CloudWatchLogService = require('./cloudWatchLogService');
const config = require('../../config');

const AWS_REGION = config.aws.region || 'us-east-1';
const LOG_GROUP_NAME = `${config.appEnv}-backend-logs`;

const cloudWatchLogService = new CloudWatchLogService({
  logGroupName: LOG_GROUP_NAME,
  awsRegion: AWS_REGION,
  jsonMessage: true, 
});

const logger = {
  /**
   * Log an error with context
   * @param {Error} error - The error object
   * @param {object} context - Additional context
   */
  error: (error, context = {}) => {
    cloudWatchLogService.logError(error, context);
  },
  
  /**
   * Log an info message
   * @param {string} message - The message to log
   * @param {object} data - Additional data
   */
  info: (message, data = {}) => {
    cloudWatchLogService.logApplication('info', message, data);
  },
  
  /**
   * Log a warning message
   * @param {string} message - The message to log
   * @param {object} data - Additional data
   */
  warn: (message, data = {}) => {
    cloudWatchLogService.logApplication('warn', message, data);
  },
  
  /**
   * Log a debug message
   * @param {string} message - The message to log
   * @param {object} data - Additional data
   */
  debug: (message, data = {}) => {
    cloudWatchLogService.logApplication('debug', message, data);
  },

  /**
   * Log an email message
   * @param {object} data - Email data
   */
  logEmail: (level, data = {}) => {
    cloudWatchLogService.logEmail(level, data);
  },
  
  /**
   * Log scheduler actions
   * @param {object} currentUser - The user performing the action
   * @param {object} data - Additional data
   */
  schedulerAction: (currentUser, data = {}) => {
    cloudWatchLogService.logSchedulerLockUnlockAction(currentUser, data);
  },

  /**
   * Log Central Reach actions
   * @param {string} level - The log level
   * @param {string} message - The message to log
   * @param {object} data - Additional data
   */
  centralReach: (level, message, data = {}) => {
    cloudWatchLogService.logCentralReach(level, message, data);
  },

  /**
   * Log socket actions
   * @param {string} level - The log level
   * @param {string} message - The message to log
   * @param {object} data - Additional data
   */
  socket: (level, message, data = {}) => {
    cloudWatchLogService.logSocket(level, message, data);
  }
};

module.exports = logger;
