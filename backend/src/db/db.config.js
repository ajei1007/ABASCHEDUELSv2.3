const config = require('../config');

const env = config.appEnv || 'dev';
let cfg;
try {
  cfg = require(`./${env}.config.js`);
} catch (err) {
  console.warn(`No config for "${env}".`);
}

module.exports = cfg;
