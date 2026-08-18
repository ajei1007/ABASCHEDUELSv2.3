'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.changeColumn(
        'newconstraintgenerator',
        'constraintType',
        {
          type: Sequelize.ENUM(
            'matching',
            'unmatching',
            'usertouser',
            'usertosession',
            'time',
            'grouping',
            'drive',
            'distance',
            'gaps',
            'backToBack',
            'breakQuantity',
            'priority',
            'authorization',
          ), // Replace with your values
          allowNull: false, // Modify as needed
        },
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
      await queryInterface.removeColumn(
        'newconstraintgenerator',
        'constraintType',
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
