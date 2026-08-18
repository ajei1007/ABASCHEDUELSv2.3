'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('settingscompany', 'customLabels', {
      type: Sequelize.DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('settingscompany', 'customLabels');
  },
};
