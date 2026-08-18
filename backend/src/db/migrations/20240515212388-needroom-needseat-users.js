'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'users',
        'needroom',
        {
          type: Sequelize.DataTypes.BOOLEAN,
          default: false,
          allowNull: false,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'users',
        'needseat',
        {
          type: Sequelize.DataTypes.BOOLEAN,
          default: false,
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
      await queryInterface.removeColumn('users', 'needroom', {
        transaction,
      });
      await queryInterface.removeColumn('users', 'needseat', {
        transaction,
      });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
