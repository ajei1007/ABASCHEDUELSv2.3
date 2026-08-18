'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.createTable('authTheralytics', {
        id: {
          type: Sequelize.DataTypes.UUID,
          defaultValue: Sequelize.DataTypes.UUIDV4,
          primaryKey: true,
        },
        username: {
          type: Sequelize.DataTypes.STRING,
          allowNull: false,
        },
        password: {
          type: Sequelize.DataTypes.STRING,
          allowNull: false,
        },
        magicQuestionsAnswer: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
        },
        userId: {
          type: Sequelize.DataTypes.UUID,
          allowNull: false,
          references: {
            key: 'id',
            model: 'users',
          },
        },
        createdById: {
          type: Sequelize.DataTypes.UUID,
          references: {
            key: 'id',
            model: 'users',
          },
        },
        updatedById: {
          type: Sequelize.DataTypes.UUID,
          references: {
            key: 'id',
            model: 'users',
          },
        },
        createdAt: { type: Sequelize.DataTypes.DATE },
        updatedAt: { type: Sequelize.DataTypes.DATE },
        deletedAt: { type: Sequelize.DataTypes.DATE },
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('authTheralytics');

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
