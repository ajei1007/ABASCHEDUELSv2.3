'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'users',
        'employeeratio',
        {
          type: Sequelize.DataTypes.INTEGER,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'users',
        'clientratio',
        {
          type: Sequelize.DataTypes.INTEGER,
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
      await queryInterface.removeColumn('users', 'employeeratio', {
        transaction,
      });
      await queryInterface.removeColumn('users', 'clientratio', {
        transaction,
      });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
