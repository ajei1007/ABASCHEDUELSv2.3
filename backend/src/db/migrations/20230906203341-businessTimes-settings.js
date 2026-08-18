'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'settings',
        'businessStartTime',
        {
          type: Sequelize.DataTypes.DATE,
          allowNull: true,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'settings',
        'businessEndTime',
        {
          type: Sequelize.DataTypes.DATE,
          allowNull: true,
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
      await queryInterface.removeColumn('settings', 'businessStartTime', { transaction });
      await queryInterface.removeColumn('settings', 'businessEndTime', { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
