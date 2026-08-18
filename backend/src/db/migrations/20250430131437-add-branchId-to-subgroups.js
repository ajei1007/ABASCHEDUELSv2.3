'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'subgroups', // table name
      'branchId', // name of the foreign key column
      {
        type: Sequelize.DataTypes.UUID,
        allowNull: true, // setting to true because constraints: false in your association
        references: {
          model: 'branches', // referenced table name
          key: 'id', // referenced column name
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // since constraints: false, using SET NULL instead of CASCADE
      },
    );
  },

  async down(queryInterface, Sequelize) {
    // Then remove the column
    await queryInterface.removeColumn('subgroups', 'branchId');
  },
};
