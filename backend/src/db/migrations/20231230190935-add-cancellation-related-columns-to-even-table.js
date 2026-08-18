'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      //cancellation reason relations
      await queryInterface.addColumn(
        'events',
        'cancellationReasonId',
        {
          type: Sequelize.DataTypes.UUID,
          allowNull: true,
          references: {
            model: 'cancellationtypes',
            key: 'id',
          },
        },
        { transaction },
      );

      //cancelling user relations
      await queryInterface.addColumn(
        'events',
        'cancelledByUserId',
        {
          type: Sequelize.DataTypes.UUID,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
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
      //remove columns
      await queryInterface.removeColumn('events', 'cancellationReasonId', {
        transaction,
      });

      await queryInterface.removeColumn('events', 'cancelledByUserId', {
        transaction,
      });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
