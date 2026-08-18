'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'distancematrix',
        'user1Id',
        {
          type: Sequelize.DataTypes.UUID,

          references: {
            model: 'users',
            key: 'id',
          },
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'distancematrix',
        'user2Id',
        {
          type: Sequelize.DataTypes.UUID,

          references: {
            model: 'users',
            key: 'id',
          },
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'newconstraintgenerator',
        'fromHome',
        {
          type: Sequelize.DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false,
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
      await queryInterface.removeColumn(
        'newconstraintgenerator',
        'user1Id',
        'user2Id',
        {
          transaction,
        },
      );
      await queryInterface.removeColumn('newconstraintgenerator', 'fromHome', {
        transaction,
      });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
