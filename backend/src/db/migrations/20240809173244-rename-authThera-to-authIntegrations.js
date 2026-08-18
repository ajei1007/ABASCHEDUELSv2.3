'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Rename the table from authThera to authIntegrations
    await queryInterface.renameTable('authTheralytics', 'authIntegrations');

    // Remove the magicQuestionsAnswer column
    await queryInterface.removeColumn('authIntegrations', 'magicQuestionsAnswer');
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the table name back to authThera
    await queryInterface.renameTable('authIntegrations', 'authTheralytics');

    // Add the magicQuestionsAnswer column back
    await queryInterface.addColumn('authTheralytics', 'magicQuestionsAnswer', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
};
