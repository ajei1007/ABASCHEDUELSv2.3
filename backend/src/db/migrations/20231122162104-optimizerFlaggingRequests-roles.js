'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'roles',
        'optimizerFeature',
        {
          type: Sequelize.DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'roles',
        'flaggingFeature',
        {
          type: Sequelize.DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'roles',
        'requestsFeature',
        {
          type: Sequelize.DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false,
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
      await queryInterface.removeColumn(
        'roles',
        'optimizerFeature',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'roles',
        'flaggingFeature',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn(
        'roles',
        'requestsFeature',
        {
          transaction,
        },
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
