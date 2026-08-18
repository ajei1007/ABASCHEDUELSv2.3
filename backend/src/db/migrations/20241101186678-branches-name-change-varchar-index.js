'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Change the column type from ENUM to VARCHAR
    await queryInterface.changeColumn('branches', 'name', {
      type: Sequelize.STRING(255),
    });

    // Add an index to the name column
    await queryInterface.addIndex('branches', ['name'], {
      name: 'branches_name_index', // Optional: specify a name for the index
      unique: false, // Set to true if you want the index to enforce uniqueness
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the index from the name column
    await queryInterface.removeIndex('branches', 'branches_name_index');

    // Revert the column type back to ENUM if needed
    await queryInterface.changeColumn('branches', 'name', {
      type: Sequelize.STRING, // Define your enum values
    });
  },
};
