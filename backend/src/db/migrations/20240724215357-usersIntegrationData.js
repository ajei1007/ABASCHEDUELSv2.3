'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.createTable('usersIntegrationData', {
        id: {
          type: Sequelize.DataTypes.UUID,
          defaultValue: Sequelize.DataTypes.UUIDV4,
          primaryKey: true,
        },
        userId: {
          type: Sequelize.DataTypes.UUID,
          allowNull: false,
          references: {
            key: 'id',
            model: 'users',
          },
        },
        integratingSoftware:{
          type: Sequelize.DataTypes.TEXT,
          allowNull: false,
          defaultValue : ""
        },
        dataInOtherSoftware:{
          type: Sequelize.DataTypes.JSON,
          allowNull: true,
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
      await queryInterface.dropTable('usersIntegrationData');

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
