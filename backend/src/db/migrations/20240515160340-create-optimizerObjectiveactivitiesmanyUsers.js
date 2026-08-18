'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableExists = await queryInterface.sequelize.query(
      `SHOW TABLES LIKE 'optimizerObjectiveactivitiesmanyUsers';`
    );

    if (tableExists[0].length !== 0) {
      return;
    }
    await queryInterface.createTable('optimizerObjectiveactivitiesmanyUsers', {
      optimizerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'optimizer',
          key: 'id',
        },
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      createdAt: { type: Sequelize.DATE },
      updatedAt: { type: Sequelize.DATE },
    });
  },

  async down (queryInterface, Sequelize) {
  }
};
