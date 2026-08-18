'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'availabilities',
        'timeoff',
        {
          type: Sequelize.DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'availabilities',
        'paid',
        {
          type: Sequelize.DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'availabilities',
        'statusType',
        {
          type: Sequelize.DataTypes.ENUM,
          defaultValue: 'Add',
          values: ['Add', 'Delete', 'Edit'],
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'availabilities',
        'requestedAt',
        {
          type: Sequelize.DataTypes.DATE,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'availabilities',
        'decidedAt',
        {
          type: Sequelize.DataTypes.DATE,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'availabilities',
        'oldAvailabilityId',
        {
          type: Sequelize.DataTypes.UUID,

          references: {
            model: 'availabilities',
            key: 'id',
          },
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'availabilities',
        'reason',
        {
          type: Sequelize.DataTypes.ENUM,

          values: ['Vacation', 'Holiday', 'Sick', 'Personal', 'Other'],
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'availabilities',
        'notes',
        {
          type: Sequelize.DataTypes.TEXT,
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
        'availabilities',
        'timeoff',
        'paid',
        'statusType',
        'oldAvailabilityId',
        'reason',
        'notes',
        'decidedAt',
        'requestedAt',
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
