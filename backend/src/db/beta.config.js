const config = require('../config');

module.exports = {
  beta: {
    ...config.database.generalProdConfig,
    replication: {
      read: config.database.rds.beta.read,
      write: config.database.rds.beta.write,
    },
  },
};
