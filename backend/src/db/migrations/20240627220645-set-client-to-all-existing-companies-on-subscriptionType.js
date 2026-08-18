'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Update all existing records to have "client" as the default subscriptionType
      await queryInterface.bulkUpdate(
        'companies',
        { subscriptionType: 'client' },
        {}, // The condition is an empty object to match all rows
        { transaction }
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
      // Revert the subscriptionType to NULL for all records
      await queryInterface.bulkUpdate(
        'companies',
        { subscriptionType: null },
        {}, // The condition is an empty object to match all rows
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
