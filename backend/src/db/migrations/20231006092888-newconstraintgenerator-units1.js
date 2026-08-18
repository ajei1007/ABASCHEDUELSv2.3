'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.changeColumn('newconstraintgenerator', 'units', {
        type: Sequelize.ENUM(
          'seconds',
          'minutes',
          'hours',
          'days',
          'weeks',
          'months',
          'years',
          'unit',
          'miles',
          'kilometers',
        ), // Replace with your values
        allowNull: true, // Modify as needed
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('newconstraintgenerator', 'units', {
        transaction,
      });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
