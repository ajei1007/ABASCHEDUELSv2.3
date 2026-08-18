const ValidationError = require('../services/notifications/errors/validation');

const validateEventInputData = (data) => {
   if (!data.frequency || !data.interval) {
    throw new ValidationError('events.invalidEventFrequencyInterval');
  }
  
  if (!data.activity0Id) {
    throw new ValidationError('events.invalidEventActivity');
  }
};

module.exports = validateEventInputData;
