'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Change the column type from ENUM to VARCHAR
    await queryInterface.changeColumn('settings', 'timezone', {
      type: Sequelize.STRING(255),
      allowNull: true, // Update allowNull according to your requirements
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the column type back to ENUM if needed
    await queryInterface.changeColumn('settings', 'timezone', {
      type: Sequelize.ENUM('America/Pangnirtung'), // Define your enum values
      allowNull: false, // Update allowNull according to your requirements
    });
  }
};
