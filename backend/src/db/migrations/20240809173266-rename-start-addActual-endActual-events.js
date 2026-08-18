'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.renameColumn('events', 'startreal', 'startactual', {
        transaction,
      });
      await queryInterface.renameColumn('events', 'endreal', 'endactual', {
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
      await queryInterface.renameColumn('events', 'startactual', 'startreal', {
        transaction,
      });
      await queryInterface.renameColumn('events', 'endactual', 'endreal', {
        transaction,
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
