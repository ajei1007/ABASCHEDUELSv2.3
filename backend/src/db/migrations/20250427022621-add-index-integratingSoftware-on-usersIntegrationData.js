'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create the index using a raw query
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_integratingSoftware 
      ON usersIntegrationData (integratingSoftware(255));
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the index using a raw query
    await queryInterface.sequelize.query(`
      DROP INDEX idx_integratingSoftware 
      ON usersIntegrationData;
    `);
  },
};