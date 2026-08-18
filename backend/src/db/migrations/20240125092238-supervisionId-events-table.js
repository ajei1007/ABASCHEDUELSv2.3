'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'events',
        'supervisionId',
        {
          type: Sequelize.DataTypes.UUID,
          allowNull: true,
          references: {
            key: 'id',
            model: 'events',
          },
          
        },
        { transaction },
      );

      await transaction.commit();
    }
    catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn(
        'events',
        'supervisionId',
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
