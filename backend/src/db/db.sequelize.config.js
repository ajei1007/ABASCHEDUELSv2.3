const appConfig = require('../config');
const env = appConfig.appEnv || 'dev';
const dbConfig = require('./db.config');

module.exports = dbConfig[env];