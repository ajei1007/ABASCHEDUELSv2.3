const { AppError } = require('../common/errors');
const atatus = require('atatus-nodejs');
const http = require('http-status-codes');
const logger = require('../services/logger/logger');
const { getCleanedStack } = require('../utils/errorUtils');
const config = require('../config');

const isProduction = config.isProduction;

const HTTP_STATUS = http.StatusCodes;

/**
 * Centralized Error Handler
 */
function errorHandler(err, req, res, next) {
  logError(err, req?.currentUser);
  notifyAtatus(err, req);
  notifySentry(err, req);

  const response = buildErrorResponse(err, req);
  res.status(response.statusCode).json(response.body);
}

/**
 * Logs the error to the console (or future logging service)
 */
function logError(err, currentUser) {
  if (!err) return;
  
  console.error('Error caught:', err);

  if (isProduction) {
    logger.error(err, {
      userId: currentUser?.id,
    });
  }
}

/**
 * Notifies Atatus if in production
 */
function notifyAtatus(err, req) {
  if (!isProduction || !err) return;

  if (config.atatus.enabled && atatus.isStarted()) {
    atatus.notifyError(err, {
      req,
      user: req.currentUser
        ? { id: req.currentUser.id, email: req.currentUser.email }
        : undefined,
    });
  }
}

function notifySentry(err, req) {
  if (!err || !config.sentry.dsn) return;

  const Sentry = require('@sentry/node');
  Sentry.captureException(err, {
    tags: {
      tenant: req.currentUser?.companyId,
    },
    user: req.currentUser ? {
      id: req.currentUser.id,
      email: req.currentUser.email
    } : undefined,
  });
}

/**
 * Constructs the response based on the error type
 */
function buildErrorResponse(err, req) {
  let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = 'Internal server error';
  let details = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  const cleanedStack = getCleanedStack(err);

  const body = {
    error: message,
    ...(details && { details }),
    ...(!isProduction && { stack: cleanedStack }),
  };

  return { statusCode, body };
}

module.exports = errorHandler;
