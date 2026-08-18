const config = require('../config');

module.exports = {
  /* JBK RDS */
  jbk: {
    ...config.database.generalProdConfig,
    replication: {
      read: config.database.rds.jbk.read,
      write: config.database.rds.jbk.write,
    },
  },
  /* PEDSPLUS RDS */
  pedsplus: {
    ...config.database.generalProdConfig,
    replication: {
      read: config.database.rds.pedsplus.read,
      write: config.database.rds.pedsplus.write,
    },
  },
  /* APP RDS */
  app: {
    ...config.database.generalProdConfig,
    replication: {
      read: config.database.rds.app.read,
      write: config.database.rds.app.write,
    },
  },
  /* ABC RDS */
  abc: {
    ...config.database.generalProdConfig,
    replication: {
      read: config.database.rds.abc.read,
      write: config.database.rds.abc.write,
    },
  },
};
