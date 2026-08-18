const { ValidationError } = require('../common/errors');

class CompanyChatFeatureDisabledException extends ValidationError {
  constructor() {
    super('Cannot enable chat feature for this company because ' +
      'the chat feature is disabled in the company settings.');
  }
}

module.exports = CompanyChatFeatureDisabledException;