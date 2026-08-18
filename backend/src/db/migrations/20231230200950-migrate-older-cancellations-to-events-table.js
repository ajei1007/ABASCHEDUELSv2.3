'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Migrate data from cancellations to events
    await queryInterface.sequelize.query(`
      UPDATE events e
      JOIN cancellations c ON e.id = c.eventId
      SET
        e.cancelledByUserId = c.userId,
        e.cancellationReasonId = c.reasonId,
        e.isCancelled = true
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove new columns from events table
  },
};
