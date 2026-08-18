'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex(
      'eventsUsersUsers',
      ['userId', 'startDatetime2', 'endDatetime2'],
      {
        name: 'composite_index_userId_start_end', // Choose a descriptive name for the index
        unique: false, // Set to true if you want the index to enforce uniqueness
      },
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex(
      'eventsUsersUsers',
      'composite_index_userId_start_end',
    );
  },
};
