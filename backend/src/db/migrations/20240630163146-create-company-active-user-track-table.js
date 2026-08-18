'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        'companyActiveUserStats',
        {
          id: {
            type: Sequelize.DataTypes.UUID,
            defaultValue: Sequelize.DataTypes.UUIDV4,
            primaryKey: true,
          },
          companyId: {
            type: Sequelize.DataTypes.UUID,
            allowNull: false,
            references: {
              key: 'id',
              model: 'companies',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          employeeNumber: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },

          clientNumber: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },

          date: {
            type: Sequelize.DataTypes.DATEONLY,
            allowNull: false,
          },

          createdAt: { type: Sequelize.DataTypes.DATE },
          updatedAt: { type: Sequelize.DataTypes.DATE },
          deletedAt: { type: Sequelize.DataTypes.DATE },
        },
        { transaction },
      );
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      //drop table
      await queryInterface.dropTable('companyActiveUserStats', {
        transaction,
      });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
