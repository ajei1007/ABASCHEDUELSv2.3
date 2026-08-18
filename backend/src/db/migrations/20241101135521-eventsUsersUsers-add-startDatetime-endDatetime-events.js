'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new columns `startDatetime` and `endDatetime`
    await queryInterface.addColumn('eventsUsersUsers', 'startDatetime', {
      type: Sequelize.DataTypes.DATE,
      allowNull: true, // Temporarily allow null for data migration
    });

    await queryInterface.addColumn('eventsUsersUsers', 'endDatetime', {
      type: Sequelize.DataTypes.DATE,
      allowNull: true, // Temporarily allow null for data migration
    });

    // Populate new columns with combined values
    await queryInterface.sequelize.query(`
      UPDATE eventsUsersUsers euu
JOIN events e ON euu.eventId = e.id
SET euu.startDatetime = e.startDatetime,
    euu.endDatetime = e.endDatetime;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Reverse the migration
    await queryInterface.removeColumn('eventsUsersUsers', 'startDatetime');
    await queryInterface.removeColumn('eventsUsersUsers', 'endDatetime');
  },
};
