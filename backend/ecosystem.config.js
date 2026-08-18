const config = require('./src/config');

module.exports = {
  apps: [
    {
      name: `backend-${config.appEnv}`,
      script: './src/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      cron_restart: '0 7 * * *',
      log_date_format: 'MM-DD-YYYY HH:mm Z',
    },
  ],
};
