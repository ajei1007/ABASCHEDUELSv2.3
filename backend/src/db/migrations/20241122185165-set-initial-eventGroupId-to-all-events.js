'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const batchSize = 1000; // Adjust this based on your database capacity
    let totalUpdateCount = 0;
    let rowsUpdated;

    console.log('Starting migration to update eventGroupId in batches...');

    do {
      // Fetch a batch of events where eventGroupId is NULL
      const events = await queryInterface.sequelize.query(
        `SELECT id FROM events WHERE eventGroupId IS NULL LIMIT ${batchSize};`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      // Break the loop if no events are returned
      if (events.length === 0) break;

      // Generate UUIDs and update events in parallel within the batch
      const updates = events.map(e => {
        const uuid = uuidv4();
        return queryInterface.sequelize.query(
          `UPDATE events SET eventGroupId = '${uuid}' WHERE id = '${e.id}';`
        );
      });

      await Promise.all(updates);

      // Update totalUpdateCount for the next batch
      totalUpdateCount += events.length;
      rowsUpdated = events.length;

      console.log(`Processed ${totalUpdateCount} rows so far...`);
    } while (rowsUpdated > 0);
    console.log('Migration completed successfully!');
  },

  down: async (queryInterface, Sequelize) => {
    // Revert eventGroupId to NULL for rollback
    console.log('Reverting eventGroupId updates...');
    await queryInterface.sequelize.query(
      `UPDATE events SET eventGroupId = NULL WHERE eventGroupId IS NOT NULL;`
    );
    console.log('Rollback completed.');
  },
};
