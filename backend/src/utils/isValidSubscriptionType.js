const isValidSubscriptionType = (subscription) => {
    return ['employee', 'client', 'person'].includes(subscription)
  };
  
  module.exports = isValidSubscriptionType;
  