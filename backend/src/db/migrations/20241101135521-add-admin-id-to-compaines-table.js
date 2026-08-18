'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('companies', 'adminId', {
      type: Sequelize.DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users', // Assumes the related table is 'users'
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Adjust as per your cascading delete policy
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('companies', 'adminId');
  },
};
