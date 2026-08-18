const config = require('../config');

module.exports = {
  dev: {
    ...config.database.generalProdConfig,
    replication: {
      read: config.database.rds.dev.read,
      write: config.database.rds.dev.write,
    },
  },
};

