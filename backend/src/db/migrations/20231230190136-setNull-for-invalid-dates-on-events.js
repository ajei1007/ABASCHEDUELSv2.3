'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      //////////////////////////////END-RECUR///////////////////////////////////////
      // Retrieve eventIDs where endRecur = '0000-00-00'
      const [eventsToUpdateEndRecur] = await queryInterface.sequelize.query(
        `
        SELECT id
        FROM events
        WHERE endRecur < '0001-01-01'
      `,
        { transaction },
      );

      const eventIdsEndRecur = eventsToUpdateEndRecur.map((event) => event.id);

      for (let eventID of eventIdsEndRecur) {
        // Update events table, setting endRecur to NULL for the retrieved eventIDs
        await queryInterface.sequelize.query(
          `
            UPDATE events
            SET endRecur = NULL
            WHERE id = '${eventID}'
            `,
          { transaction },
        );
      }

      //////////////////////////////START-RECUR////////////////////////////////////////

      // Retrieve eventIDs where startRecur = '0000-00-00'
      const [eventsToUpdateStartRecur] = await queryInterface.sequelize.query(
        `
        SELECT id
        FROM events
        WHERE startRecur < '0001-01-01'
      `,
        { transaction },
      );

      const eventIdsStartRecur = eventsToUpdateStartRecur.map(
        (event) => event.id,
      );

      for (let eventID of eventIdsStartRecur) {
        // Update events table, setting startRecur to NULL for the retrieved eventIDs
        await queryInterface.sequelize.query(
          `
            UPDATE events
            SET startRecur = NULL
            WHERE id = '${eventID}'
            `,
          { transaction },
        );
      }

      /////////////////////////////////END///////////////////////////////////////
      // Retrieve eventIDs where end = '0000-00-00 00:00:00'
      const [eventsToUpdateEnd] = await queryInterface.sequelize.query(
        `
        SELECT id
        FROM events
        WHERE end < '0001-01-01 00:00:00'
      `,
        { transaction },
      );

      const eventIdsEnd = eventsToUpdateEnd.map((event) => event.id);

      for (let eventID of eventIdsEnd) {
        // Update events table, setting end to NULL for the retrieved eventIDs
        await queryInterface.sequelize.query(
          `
            UPDATE events
            SET end = NULL
            WHERE id = '${eventID}'
            `,
          { transaction },
        );
      }

      /////////////////////////////////START///////////////////////////////////////
      // Retrieve eventIDs where start = '0000-00-00 00:00:00'
      const [eventsToUpdateStart] = await queryInterface.sequelize.query(
        `
        SELECT id
        FROM events
        WHERE start < '0001-01-01 00:00:00'
      `,
        { transaction },
      );

      const eventIdsStart = eventsToUpdateStart.map((event) => event.id);

      for (let eventID of eventIdsStart) {
        // Update events table, setting start to NULL for the retrieved eventIDs
        await queryInterface.sequelize.query(
          `
            UPDATE events
            SET start = NULL
            WHERE id = '${eventID}'
            `,
          { transaction },
        );
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Reversal of the migration (if needed)
    // You might want to add specific logic here based on your needs
  },
};
