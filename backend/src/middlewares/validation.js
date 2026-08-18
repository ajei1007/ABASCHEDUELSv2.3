const Joi = require('joi');
const { ValidationError } = require('../common/errors');

/**
 * Creates a validation middleware using the provided Joi schema and source
 * @param {Joi.Schema} schema - Joi schema to validate against
 * @param {'body' | 'query' | 'params' | 'headers' } source - Request property to validate
 * @returns {Function} Express middleware function
 */
const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    if (!req[source]) {
      return next(new ValidationError(`Request req.${source} is not provided`));
    }
    const { error } = schema.validate(req[source]);

    if (error) {
      return next(new ValidationError(error.details[0].message));
    }
    
    next();
  };
};

module.exports = validateRequest
