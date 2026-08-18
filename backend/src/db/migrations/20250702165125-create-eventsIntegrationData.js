'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('eventsIntegrationData', {
        id: {
          type: Sequelize.DataTypes.UUID,
          defaultValue: Sequelize.DataTypes.UUIDV4,
          primaryKey: true,
        },
        integratingSoftware: {
          type: Sequelize.DataTypes.TEXT,
          allowNull: false,
          defaultValue: ""
        },
        eventId: {
          type: Sequelize.DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'events',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        eventIdOther: {
          type: Sequelize.DataTypes.TEXT,
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DataTypes.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DataTypes.DATE,
          allowNull: false,
        },
        deletedAt: {
          type: Sequelize.DataTypes.DATE,
          allowNull: true,
        },
      }, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('eventsIntegrationData', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
