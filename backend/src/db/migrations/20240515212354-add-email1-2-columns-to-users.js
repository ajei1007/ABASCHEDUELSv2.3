'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'users',
        'email1',
        {
          type: Sequelize.DataTypes.STRING,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'users',
        'email2',
        {
          type: Sequelize.DataTypes.STRING,
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
      await queryInterface.removeColumn('users', 'email1', {
        transaction,
      });

      await queryInterface.removeColumn('users', 'email2', {
        transaction,
      });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
