'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'authIntegrations',
        'credentials',
        {
          type: Sequelize.DataTypes.JSON,
          allowNull: true,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'authIntegrations',
        'companyId',
        {
          type: Sequelize.DataTypes.UUID,
          references: {
            model: 'companies',
            key: 'id',
          },
        },
        { transaction },
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('authIntegrations', 'companyId', {
        transaction,
      });

      await queryInterface.removeColumn('authIntegrations', 'credentials', {
        transaction,
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};