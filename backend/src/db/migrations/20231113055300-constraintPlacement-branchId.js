'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'constraintPlacement',
        'branchId',
        {
          type: Sequelize.DataTypes.UUID,
          allowNull: true,
          references: {
            key: 'id',
            model: 'branches',
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

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn(
        'constraintPlacement',
        'branchId',
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
