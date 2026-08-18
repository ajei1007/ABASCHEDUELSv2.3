'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('cancellationtypes', 'customId', {
      type: Sequelize.TEXT,
      allowNull: true, // Adjust if you need a NOT NULL constraint
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('cancellationtypes', 'customId');
  }
};
