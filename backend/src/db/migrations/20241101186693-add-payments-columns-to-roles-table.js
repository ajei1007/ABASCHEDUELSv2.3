'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('roles', 'viewPayments', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,    
    });

    await queryInterface.addColumn('roles', 'managePayments', {
      type: Sequelize.BOOLEAN,
      defaultValue: false, 
      allowNull: false,    
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('roles', 'viewPayments');
    await queryInterface.removeColumn('roles', 'managePayments');
  }
};
