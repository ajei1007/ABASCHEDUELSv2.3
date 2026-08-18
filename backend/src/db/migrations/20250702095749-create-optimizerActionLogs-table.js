'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Create optimizerActionLogs table
      await queryInterface.createTable(
        'optimizerActionLogs',
        {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.DataTypes.UUIDV4,
            primaryKey: true,
          },
          startTime: {
            type: Sequelize.DATE,
            allowNull: true,
          },
          endTime: {
            type: Sequelize.DATE,
            allowNull: true,
          },
          status: {
            type: Sequelize.ENUM('success', 'failed'),
            allowNull: true,
          },
          requestPayload: {
            type: Sequelize.JSON,
            allowNull: true,
          },
          responsePayload: {
            type: Sequelize.JSON,
            allowNull: true,
          },
          triggerBy: {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
              key: 'id',
              model: 'users',
            },
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
          deletedAt: {
            type: Sequelize.DATE,
            allowNull: true,
          },
        },
        { transaction },
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Drop optimizerActionLogs table
      await queryInterface.dropTable('optimizerActionLogs', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
