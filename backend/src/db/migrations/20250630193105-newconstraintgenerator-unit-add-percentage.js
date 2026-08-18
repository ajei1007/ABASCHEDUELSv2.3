'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.changeColumn(
        'newconstraintgenerator',
        'units',
        {
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
            'percentage', // Add 'percentage' to the ENUM values
          ), // Replace with your values
          allowNull: true, // Modify as needed
        },
        {
          transaction,
        },
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.changeColumn(
        'newconstraintgenerator',
        'units',
        {
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
        },
        {
          transaction,
        },
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
