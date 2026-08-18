
const { Transaction } = require('sequelize');
require('dotenv').config({ path: '.env.test', override: true });  

module.exports = {
  test: {
    // Since testing config have different env file we cannot get the values form config.js
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    seederStorage: 'sequelize',
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
      acquire: 30000,
    },
    dialectOptions: {
      decimalNumbers: true,
      connectTimeout: 10000,
    },
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
    logging: false,
  },
};