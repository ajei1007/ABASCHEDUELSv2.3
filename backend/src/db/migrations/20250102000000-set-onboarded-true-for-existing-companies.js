'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkUpdate('companies', 
      { onboarded: true },
      { onboarded: false },
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkUpdate('companies',
      { onboarded: false },
      { onboarded: true }
    );
  }
}; 