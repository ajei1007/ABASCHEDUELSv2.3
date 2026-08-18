'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Check if the column exists (optional but useful for debugging)
      const tableDescription = await queryInterface.describeTable('authTheralytics');
      if (!tableDescription.token) {
        throw new Error('Column "token" does not exist in "authTheralytics" table.');
      }

      // Change the column type to MEDIUMTEXT
      await queryInterface.changeColumn(
        'authTheralytics',
        'token',
        {
          type: Sequelize.DataTypes.TEXT,
          allowNull: true,
        },
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      console.error('Error during migration up:', err);
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Change the column type back to TEXT
      await queryInterface.changeColumn(
        'authTheralytics',
        'token',
        {
          type: Sequelize.DataTypes.TEXT,
          allowNull: true,
        },
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      console.error('Error during migration down:', err);
      throw err;
    }
  },
};
