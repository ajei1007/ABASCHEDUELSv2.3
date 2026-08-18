/**
 * Custom application error classes
 */

const http = require('http-status-codes');
const HTTP_STATUS = http.StatusCodes;

class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.name = this.constructor.name;
      
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      }
    }
}
  
class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, HTTP_STATUS.CONFLICT);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, HTTP_STATUS.NOT_FOUND);
  }
}
  
class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, HTTP_STATUS.BAD_REQUEST);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, HTTP_STATUS.FORBIDDEN);
  }
}
  
module.exports = {
  AppError,
  ConflictError,
  NotFoundError,
  ValidationError,
  UnauthorizedError
};