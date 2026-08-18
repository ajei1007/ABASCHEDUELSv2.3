'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = 'surveyData';

    const tableExists = await queryInterface
      .describeTable(tableName)
      .then(() => true)
      .catch(() => false);

    if (!tableExists) {
      // Table doesn't exist, create it
      await queryInterface.createTable(tableName, {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.DataTypes.UUIDV4,
          primaryKey: true,
        },
        userId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        feedback: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        createdAt: { type: Sequelize.DataTypes.DATE },
        updatedAt: { type: Sequelize.DataTypes.DATE },
        deletedAt: { type: Sequelize.DataTypes.DATE },
      });
    } else {
      // Table exists, check if the 'feedback' column exists
      const tableDescription = await queryInterface.describeTable(tableName);
      if (!tableDescription.feedback) {
        await queryInterface.addColumn(tableName, 'feedback', {
          type: Sequelize.STRING,
          allowNull: true,
        });
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const tableName = 'surveyData';

    const tableExists = await queryInterface
      .describeTable(tableName)
      .then(() => true)
      .catch(() => false);

    if (!tableExists) return;

    const tableDescription = await queryInterface.describeTable(tableName);
    if (tableDescription.feedback) {
      await queryInterface.removeColumn(tableName, 'feedback');
    }
  },
};
