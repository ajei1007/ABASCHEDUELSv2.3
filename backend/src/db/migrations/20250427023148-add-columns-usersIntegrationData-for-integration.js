'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'usersIntegrationData',
        'idOther',
        {
          type: Sequelize.DataTypes.STRING,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'usersIntegrationData',
        'tableName',
        {
          type: Sequelize.DataTypes.STRING,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'usersIntegrationData',
        'otherTableName',
        {
          type: Sequelize.DataTypes.STRING,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'usersIntegrationData',
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
      await queryInterface.removeColumn('usersIntegrationData', 'idOther', {
        transaction,
      });

      await queryInterface.removeColumn('usersIntegrationData', 'tableName', {
        transaction,
      });

      await queryInterface.removeColumn('usersIntegrationData','otherTableName',{
        transaction,
      });

      await queryInterface.removeColumn('usersIntegrationData', 'companyId', {
        transaction,
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};