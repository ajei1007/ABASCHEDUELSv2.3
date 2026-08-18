'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('companies', 'onboarded', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether the company has completed all onboarding checklist items'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('companies', 'onboarded');
  }
}; 