'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.renameColumn('events', 'startactual', 'startActual', {
        transaction,
      });
      await queryInterface.renameColumn('events', 'endactual', 'endActual', {
        transaction,
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
      await queryInterface.renameColumn('events', 'startActual', 'startactual', {
        transaction,
      });
      await queryInterface.renameColumn('events', 'endActual', 'endactual', {
        transaction,
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
