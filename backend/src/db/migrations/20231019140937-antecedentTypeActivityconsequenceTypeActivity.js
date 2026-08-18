'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'newconstraintgenerator',
        'antecedentTypeActivityId',
        {
          type: Sequelize.DataTypes.UUID,
          allowNull: true,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'newconstraintgenerator',
        'consequenceTypeActivityId',
        {
          type: Sequelize.DataTypes.UUID,
          allowNull: true,
        },
        { transaction },
      );
      await queryInterface.addConstraint('newconstraintgenerator', {
        fields: ['antecedentTypeActivityId'],
        type: 'foreign key',
        references: {
          table: 'users',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'fk_newconstraintgenerator_antecedent_activity',
      });
      await queryInterface.addConstraint('newconstraintgenerator', {
        fields: ['consequenceTypeActivityId'],
        type: 'foreign key',
        references: {
          table: 'users',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'fk_newconstraintgenerator_consequence_activity',
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn(
        'newconstraintgenerator',
        'antecedentTypeActivityId',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'newconstraintgenerator',
        'consequenceTypeActivityId',
        {
          transaction,
        },
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
