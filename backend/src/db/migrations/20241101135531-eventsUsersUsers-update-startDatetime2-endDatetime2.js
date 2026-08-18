'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn(
      'eventsUsersUsers',
      'startDatetime',
      'startDatetime2',
    );
    await queryInterface.renameColumn(
      'eventsUsersUsers',
      'endDatetime',
      'endDatetime2',
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn(
      'eventsUsersUsers',
      'startDatetime2',
      'startDatetime',
    );
    await queryInterface.renameColumn(
      'eventsUsersUsers',
      'endDatetime2',
      'endDatetime',
    );
  },
};
