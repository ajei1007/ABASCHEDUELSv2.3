'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        'constraintPlacement',
        {
          id: {
            type: Sequelize.DataTypes.UUID,
            defaultValue: Sequelize.DataTypes.UUIDV4,
            primaryKey: true,
          },
          constraintId: {
            type: Sequelize.DataTypes.UUID,
            allowNull: false,
            references: {
              key: 'id',
              model: 'newconstraintgenerator',
            },
          },
          userId: {
            type: Sequelize.DataTypes.UUID,
            allowNull: true,
            references: {
              key: 'id',
              model: 'users',
            },
          },
          rank: {
            type: Sequelize.DataTypes.INTEGER,
          },
          importance: {
            type: Sequelize.DataTypes.ENUM,
            values: ['high', 'low', 'mandatory', 'disabled'],
          },
          flagging: {
            type: Sequelize.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          solutionGenerator: {
            type: Sequelize.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          optimizer: {
            type: Sequelize.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
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
      await queryInterface.dropTable('constraintPlacement', {
        transaction,
      });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
