'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'optimizer',
        'allOrNothingBlocks',
        {
          type: Sequelize.DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'optimizer',
        'maxEmployeeHoursPerDay',
        {
          type: Sequelize.DataTypes.INTEGER,
          defaultValue: 8,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'optimizer',
        'maxClientHoursPerDay',
        {
          type: Sequelize.DataTypes.INTEGER,
          defaultValue: 8,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'optimizer',
        'maxGapEmployeeSchedule',
        {
          type: Sequelize.DataTypes.INTEGER,
          defaultValue: 60,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'optimizer',
        'maxGapClientSchedule',
        {
          type: Sequelize.DataTypes.INTEGER,
          defaultValue: 0,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'optimizer',
        'clientsMaxAppointmentsPerDay',
        {
          type: Sequelize.DataTypes.INTEGER,
          defaultValue: 5,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        'optimizer',
        'employeesMaxAppointmentsPerDay',
        {
          type: Sequelize.DataTypes.INTEGER,
          defaultValue: 5,
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
      await queryInterface.removeColumn('optimizer', 'allOrNothingBlocks', {
        transaction,
      });
      await queryInterface.removeColumn('optimizer', 'maxEmployeeHoursPerDay', {
        transaction,
      });
      await queryInterface.removeColumn('optimizer', 'maxClientHoursPerDay', {
        transaction,
      });
      await queryInterface.removeColumn('optimizer', 'maxGapEmployeeSchedule', {
        transaction,
      });
      await queryInterface.removeColumn('optimizer', 'maxGapClientSchedule', {
        transaction,
      });
      await queryInterface.removeColumn('optimizer', 'clientsMaxAppointmentsPerDay', {
        transaction,
      });
      await queryInterface.removeColumn('optimizer', 'employeesMaxAppointmentsPerDay', {
        transaction,
      });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
