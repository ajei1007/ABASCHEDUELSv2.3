'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('newconstraintgeneratorBranches', {
      newconstraintgeneratorId: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'newconstraintgenerator',
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

    await queryInterface.addConstraint('newconstraintgeneratorBranches', {
      fields: ['newconstraintgeneratorId'],
      type: 'foreign key',
      references: {
        table: 'newconstraintgenerator',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      name: 'fk_newconstraintgeneratorBranches_newconstraintgeneratorId',
    });

    await queryInterface.addConstraint('newconstraintgeneratorBranches', {
      fields: ['branchId'],
      type: 'foreign key',
      references: {
        table: 'branches',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      name: 'fk_newconstraintgeneratorBranches_branchId',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint(
      'newconstraintgeneratorBranches',
      'fk_newconstraintgeneratorBranches_newconstraintgeneratorId'
    );
    await queryInterface.removeConstraint(
      'newconstraintgeneratorBranches',
      'fk_newconstraintgeneratorBranches_branchId'
    );
    await queryInterface.dropTable('newconstraintgeneratorBranches');
  }
};
