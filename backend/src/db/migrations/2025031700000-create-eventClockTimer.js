'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('eventClockTimer', {
      id: {
        primaryKey: true,
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.DataTypes.UUIDV4,
      },
      user_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users', // name of the users table
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      event_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'events', // name of the events table
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      start_time: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
      },
      end_time: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
      },
      duration_seconds: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
      },
      lat_start: {
        type: Sequelize.DataTypes.DECIMAL(10, 8),
        allowNull: true,
      },
      lon_start: {
        type: Sequelize.DataTypes.DECIMAL(11, 8),
        allowNull: true,
      },
      lat_end: {
        type: Sequelize.DataTypes.DECIMAL(10, 8),
        allowNull: true,
      },
      lon_end: {
        type: Sequelize.DataTypes.DECIMAL(11, 8),
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DataTypes.DATE,
      },
      updatedAt: {
        type: Sequelize.DataTypes.DATE,
      },
      deletedAt: {
        type: Sequelize.DataTypes.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('eventClockTimer');
  }
};
