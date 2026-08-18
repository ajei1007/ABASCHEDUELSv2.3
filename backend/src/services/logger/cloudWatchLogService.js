// cloudWatchLogService.js
const winston = require('winston');
const WinstonCloudWatch = require('winston-cloudwatch');


/* LOG STREAMS (LOG GROUPS) */
const LOG_STREAMS = {
  SCHEDULER: 'scheduler-locking-stream',
  CENTRAL_REACH: 'central-reach-stream',
  ERROR: 'error-stream',
  APPLICATION: 'application-stream',
  EMAIL: 'email-stream',
  SOCKET: 'socket-stream'
};

class CloudWatchLogService {
  /**
   * @param {object} config
   * @param {string} config.logGroupName - The name of the CloudWatch Logs group
   * @param {string} config.awsRegion - The AWS region for CloudWatch
   * @param {string} [config.level='info'] - Minimum log level: 'info', 'error', 'debug', etc.
   * @param {boolean} [config.jsonMessage=true] - Whether logs should be structured JSON
   */
  constructor({
    logGroupName,
    awsRegion,
    jsonMessage = true,
  }) {
    this.logGroupName = logGroupName;
    this.awsRegion = awsRegion;
    this.jsonMessage = jsonMessage;

    // Initialize loggers
    this.loggers = {};

    // Create default loggers
    this.createLogger(LOG_STREAMS.SCHEDULER);
    this.createLogger(LOG_STREAMS.CENTRAL_REACH);
    this.createLogger(LOG_STREAMS.ERROR, 'error');
    this.createLogger(LOG_STREAMS.APPLICATION);
    this.createLogger(LOG_STREAMS.EMAIL);
    this.createLogger(LOG_STREAMS.SOCKET);
  }

  /**
   * Creates a new logger for a specific stream
   * @param {string} streamName - Name of the log stream
   * @param {string} [level='info'] - Minimum log level
   * @returns {winston.Logger} - The created logger
   */
  createLogger(streamName, level = 'info') {
    const transport = new WinstonCloudWatch({
      logGroupName: this.logGroupName,
      logStreamName: streamName,
      awsRegion: this.awsRegion,
      jsonMessage: this.jsonMessage,
    });

    const logger = winston.createLogger({
      level,
      format: winston.format.json(),
      transports: [transport]
    });

    this.loggers[streamName] = logger;
    return logger;
  }

  /**
   * Get a logger by stream name
   * @param {string} streamName - Name of the log stream
   * @returns {winston.Logger} - The logger for the specified stream
   */
  getLogger(streamName) {
    return this.loggers[streamName];
  }

  /**
   * Log a message to a specific stream with a specific level
   * @param {string} streamName - Name of the log stream
   * @param {string} level - Log level (info, error, warn, debug)
   * @param {object} data - Data to log
   */
  log(streamName, level, data) {
    // Skip logging in development environment
    if (process.env.NODE_ENV === 'development') return;
    
    const logger = this.getLogger(streamName);
    if (!logger) {
      throw new Error(`Logger for stream "${streamName}" not found`);
    }
    
    const logData = {
      stream: streamName,
      timestamp: new Date().toISOString(),
      ...data
    };
    
    logger[level](logData);
  }

  /**
   * Log an error
   * @param {Error} error - The error object
   * @param {object} context - Additional context information
   */
  logError(error, context = {}) {
    const { getCleanedStack } = require('../../utils/errorUtils');
    
    this.log(LOG_STREAMS.ERROR, 'error', {
      name: error.name,
      stack: getCleanedStack(error),
      statusCode: error.statusCode || 500,
      message: error.message,
      ...context
    });
  }

  /**
   * Log application events
   * @param {string} level - Log level (info, warn, debug)
   * @param {string} message - Log message
   * @param {object} data - Additional data
   */
  logApplication(level, message, data = {}) {
    this.log(LOG_STREAMS.APPLICATION, level, {
      message,
      ...data
    });
  }

  /** 
   * Log email events
   * @param {object} data - Email data
   */
  logEmail(level, data = {}) {
    this.log(LOG_STREAMS.EMAIL, level, {
      ...data
    });
  }
  
  /* Logs a "Scheduler lock/unlock" action to CloudWatch. */
  logSchedulerLockUnlockAction(currentUser, data) {
    const now = new Date().toISOString();

    const logData = {
      stream: LOG_STREAMS.SCHEDULER,
      updatedBy: `${currentUser.firstName} ${currentUser.lastName ?? ''}`,
      updatedAt: now,
      companyId: currentUser?.company?.id ?? '',
      companyName: currentUser?.company?.name ?? '',
      // Additional structured fields
      ...data
    };
    this.log(LOG_STREAMS.SCHEDULER, 'info', logData);
  }

  logCentralReach(level, message, data = {}) {
    this.log(LOG_STREAMS.CENTRAL_REACH, level, {
      message,
      ...data
    });
  }

  logSocket(level, message, data = {}) {
    this.log(LOG_STREAMS.SOCKET, level, {
      message,
      ...data
    });
  }
}

module.exports = CloudWatchLogService;
