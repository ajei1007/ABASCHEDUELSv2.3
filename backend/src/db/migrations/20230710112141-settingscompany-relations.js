'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create the junction table for staffTrackerBranches
    await queryInterface.createTable('settingsStaffTrackerBranches', {
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
      branchId: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'branches',
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

    // Create the junction table for staffTrackerActivities
    await queryInterface.createTable('settingsStaffTrackerActivities', {
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
      userId: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
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

    // Add the foreign keys for staffTrackerBranches
    await queryInterface.addConstraint('settingsStaffTrackerBranches', {
      fields: ['settingsCompanyId'],
      type: 'foreign key',
      references: {
        table: 'settingscompany',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      name: 'fk_staffTrackerBranches_settingsCompanyId_5', // Unique constraint name
    });

    await queryInterface.addConstraint('settingsStaffTrackerBranches', {
      fields: ['branchId'],
      type: 'foreign key',
      references: {
        table: 'branches',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      name: 'fk_staffTrackerBranches_branchId_5', // Unique constraint name
    });

    await queryInterface.addConstraint('settingsStaffTrackerActivities', {
      fields: ['userId'],
      type: 'foreign key',
      references: {
        table: 'users',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      name: 'fk_staffTrackerActivities_userId_5', // Unique constraint name
    });

    // Add the foreign keys for staffTrackerActivities
    await queryInterface.addConstraint('settingsStaffTrackerActivities', {
      fields: ['settingsCompanyId'],
      type: 'foreign key',
      references: {
        table: 'settingscompany',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      name: 'fk_staffTrackerActivities_settingsCompanyId_5', // Unique constraint name
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the foreign keys and junction tables
    await queryInterface.removeConstraint(
      'settingsStaffTrackerBranches',
      'fk_staffTrackerBranches_settingsCompanyId_5'
    );
    await queryInterface.removeConstraint(
      'settingsStaffTrackerBranches',
      'fk_staffTrackerBranches_branchId_5'
    );
    await queryInterface.dropTable('settingsStaffTrackerBranches');

    await queryInterface.removeConstraint(
      'settingsStaffTrackerActivities',
      'fk_staffTrackerActivities_settingsCompanyId_5'
    );
    await queryInterface.removeConstraint(
      'settingsStaffTrackerActivities',
      'fk_staffTrackerActivities_userId_5'
    );
    await queryInterface.dropTable('settingsStaffTrackerActivities');
  },
};
