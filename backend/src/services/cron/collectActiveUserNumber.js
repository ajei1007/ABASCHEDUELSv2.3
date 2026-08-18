const cron = require('node-cron');
const {
  collectActiveUserNumber,
} = require('../../utils/collectActiveUserNumber');

const collectActiveUserNumberPerCompany = () => {
  cron.schedule('0 7 * * *', () => collectActiveUserNumber());
};

module.exports = {
  collectActiveUserNumberPerCompany,
};
