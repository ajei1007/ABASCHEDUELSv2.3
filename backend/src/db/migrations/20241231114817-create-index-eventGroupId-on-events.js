'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add an index to the eventGroupId column
    await queryInterface.addIndex('events', ['eventGroupId'], {
      name: 'event_group_id_index', // Optional: specify a name for the index
      unique: false, // Set to true if you want the index to enforce uniqueness
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the index from the eventGroupId column
    await queryInterface.removeIndex('events', 'event_group_id_index');
  },
};
