'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Start a transaction
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Set empty SQL mode for this session
      await queryInterface.sequelize.query("SET SESSION sql_mode = ''", {
        transaction,
      });

      await queryInterface.changeColumn(
        'events',
        'latitude',
        {
          type: Sequelize.DECIMAL(10, 7),
          allowNull: true, // Adjust as needed based on your current schema
        },
        { transaction },
      );

      await queryInterface.changeColumn(
        'events',
        'longitude',
        {
          type: Sequelize.DECIMAL(10, 7),
          allowNull: true, // Adjust as needed based on your current schema
        },
        { transaction },
      );

      // Commit the transaction
      await transaction.commit();
    } catch (error) {
      // If anything fails, roll back the transaction
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Set empty SQL mode for this session
      await queryInterface.sequelize.query("SET SESSION sql_mode = ''", {
        transaction,
      });

      // Revert back to the original type
      await queryInterface.changeColumn(
        'events',
        'latitude',
        {
          type: Sequelize.DECIMAL(10, 0), // MySQL default precision
          allowNull: true, // Adjust as needed based on your current schema
        },
        { transaction },
      );

      await queryInterface.changeColumn(
        'events',
        'longitude',
        {
          type: Sequelize.DECIMAL(10, 0), // MySQL default precision
          allowNull: true, // Adjust as needed based on your current schema
        },
        { transaction },
      );

      // Commit the transaction
      await transaction.commit();
    } catch (error) {
      // If anything fails, roll back the transaction
      await transaction.rollback();
      throw error;
    }
  },
};
