'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // create table
      await queryInterface.createTable(
        'emailSentPendingConfirmations',
        {
          id: {
            type: Sequelize.DataTypes.UUID,
            defaultValue: Sequelize.DataTypes.UUIDV4,
            primaryKey: true,
          },
          
          userId: {
            type: Sequelize.DataTypes.UUID,
            allowNull: true,
            references: {
              key: 'id',
              model: 'users',
            },
          },
          eventIdConcatenation: {
            type: Sequelize.DataTypes.TEXT,
            allowNull: false,
            defaultValue: "",
          },
          createdAt: { type: Sequelize.DataTypes.DATE },
          updatedAt: { type: Sequelize.DataTypes.DATE },
          deletedAt: { type: Sequelize.DataTypes.DATE },
        },
        { transaction },
      );
      
    } catch (error) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      //drop table
      await queryInterface.dropTable('emailSentPendingConfirmations', {
        transaction,
      });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
