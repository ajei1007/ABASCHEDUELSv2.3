'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex(
      'availabilities',
      ['deletedAt', 'startRange', 'endRange'],
      {
        name: 'availabilities_composite_index', // optional, for custom index name
        unique: false, // set to true if this index should enforce uniqueness
      },
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex(
      'availabilities',
      'availabilities_composite_index',
    );
  },
};
