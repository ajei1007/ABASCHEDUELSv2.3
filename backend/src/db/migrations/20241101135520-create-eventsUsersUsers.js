'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const [results] = await queryInterface.sequelize.query(
      `SHOW TABLES LIKE 'eventsUsersUsers';`
    );

    if (results.length !== 0) {
      return;
    }
    await queryInterface.createTable('eventsUsersUsers', {
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
      eventId: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'events',
          key: 'id',
        },
      },
      userId: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
    });
    await queryInterface.addIndex('eventsUsersUsers', ['eventId']);
  },

  async down (queryInterface, Sequelize) {
  }
};
