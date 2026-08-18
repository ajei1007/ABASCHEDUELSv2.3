'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'subgroups',
        'relatedUserId',
        {
          type: Sequelize.DataTypes.UUID,
          allowNull: true,
          references: {
            key: 'id',
            model: 'users',
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
        'subgroups',
        'relatedUserId',
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
