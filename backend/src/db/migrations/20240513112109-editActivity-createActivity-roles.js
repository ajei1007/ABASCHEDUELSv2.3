'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'roles',
        'createActivity',
        {
          type: Sequelize.DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'roles',
        'editActivity',
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
      await queryInterface.removeColumn('roles', 'createActivity', {
        transaction,
      });
      await queryInterface.removeColumn('roles', 'editActivity', {
        transaction,
      });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
