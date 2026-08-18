'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Modify the ENUM to add 'superAdmin' to the 'role' column
    await queryInterface.sequelize.query(`
      ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'user', 'superAdmin') NULL DEFAULT 'user';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Modify the ENUM to remove 'superAdmin' (if needed)
    // Note: ENUM values cannot be removed directly; this recreates the column without 'superAdmin'
    await queryInterface.sequelize.query(`
      ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'user') NULL DEFAULT 'user';
    `);
  },
};
