'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('settingsStaffTrackerRoles', {
      settingsCompanyId: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'settingscompany',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      roleId: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    await queryInterface.addConstraint('settingsStaffTrackerRoles', {
      fields: ['roleId'],
      type: 'foreign key',
      references: {
        table: 'roles',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      name: 'fk_staffTrackerRoles_roleId', // Unique constraint name
    });
    await queryInterface.addConstraint('settingsStaffTrackerRoles', {
      fields: ['settingsCompanyId'],
      type: 'foreign key',
      references: {
        table: 'settingscompany',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      name: 'fk_staffTrackerRoles_settingsCompanyId', // Unique constraint name
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint(
      'settingsStaffTrackerRoles',
      'fk_staffTrackerRoles_settingsCompanyId'
    );
    await queryInterface.removeConstraint(
      'settingsStaffTrackerRoles',
      'fk_staffTrackerRoles_roleId'
    );
    await queryInterface.dropTable('settingsStaffTrackerRoles');
  },
};
