'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Step 2: Populate the `userIds` column
    await queryInterface.sequelize.query(`
      UPDATE events
      SET userIds = (
        SELECT JSON_ARRAYAGG(userId)
        FROM eventsUsersUsers
        WHERE eventsUsersUsers.eventId = events.id
      )
    `);
    // Step 3: Make the `userIds` column NOT NULL (optional, if required)
    // await queryInterface.changeColumn('events', 'userIds', {
    //   type: Sequelize.JSON,
    //   allowNull: false, // Change to NOT NULL if necessary
    // });
  },
  down: async (queryInterface, Sequelize) => {},
};
