'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('roles', 'standardRoles', {
      type: Sequelize.ENUM('superAdmin', 'admin', 'clinician', 'technician', 'patient', 'unspecified'),
      allowNull: false,
      defaultValue: 'unspecified',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('roles', 'standardRoles');
  }
};

