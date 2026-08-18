'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'distancematrix',
        'duration_early',
        {
          type: Sequelize.DataTypes.INTEGER,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'distancematrix',
        'duration_late',
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
      await queryInterface.removeColumn('distancematrix', 'driveInterval', {
        transaction,
      });
      await queryInterface.removeColumn('distancematrix', 'driveInterval', {
        transaction,
      });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
