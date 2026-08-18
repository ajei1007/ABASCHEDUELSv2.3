'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add a `userIds` column of type JSON
    await queryInterface.addColumn('events', 'userIds', {
      type: Sequelize.DataTypes.JSON,
      allowNull: true, // Allow NULL initially; populate later if needed
    });
  },
  down: async (queryInterface, Sequelize) => {
    // Remove the `userIds` column
    await queryInterface.removeColumn('events', 'userIds');
  },
};
