'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Add recurrence columns
      await queryInterface.addColumn(
        'availabilities',
        'frequency',
        {
          type: Sequelize.DataTypes.ENUM(
            'Weekly',
            'Monthly',
            'Yearly',
            'Daily',
          ),
          allowNull: true,
        },
        {
          transaction,
        },
      );

      await queryInterface.addColumn(
        'availabilities',
        'interval',
        {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: true,
        },
        {
          transaction,
        },
      );

      await queryInterface.addColumn(
        'availabilities',
        'bysetpos',
        {
          type: Sequelize.DataTypes.ENUM('-1', '1', '2', '3', '4'),
          allowNull: true,
        },
        {
          transaction,
        },
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Remove recurrence columns
      await queryInterface.removeColumn('availabilities', 'frequency', {
        transaction,
      });
      await queryInterface.removeColumn('availabilities', 'interval', {
        transaction,
      });
      await queryInterface.removeColumn('availabilities', 'bysetpos', {
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
