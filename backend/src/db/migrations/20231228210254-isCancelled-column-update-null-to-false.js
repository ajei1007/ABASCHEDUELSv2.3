'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Migrate data from cancellations to events
    await queryInterface.sequelize.query(`
      UPDATE events e
      SET
        e.isCancelled = false
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove new columns from events table
  },
};
