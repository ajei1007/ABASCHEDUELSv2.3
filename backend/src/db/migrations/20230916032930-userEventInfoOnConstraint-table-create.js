'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      //create table
      await queryInterface.createTable(
        'userEventHistoryPerConstraint',
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

          consequenceUserId: {
            type: Sequelize.DataTypes.UUID,
            allowNull: true,
            references: {
              key: 'id',
              model: 'users',
            },
          },

          antecedentUserId: {
            type: Sequelize.DataTypes.UUID,
            allowNull: false,
            references: {
              key: 'id',
              model: 'users',
            },
          },
          start: {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
          },
          end: {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
          },
          constraintFrequency: {
            type: Sequelize.DataTypes.ENUM,
            values: ['day', 'week', 'session', 'month', 'year', 'custom'],
            allowNull: false,
          },
          eventDuration: {
            type: Sequelize.DataTypes.INTEGER,
          },
          eventCount: {
            type: Sequelize.DataTypes.INTEGER,
          },
          createdAt: { type: Sequelize.DataTypes.DATE },
          updatedAt: { type: Sequelize.DataTypes.DATE },
          deletedAt: { type: Sequelize.DataTypes.DATE },
        },
        { transaction },
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      //drop table
      await queryInterface.dropTable('userEventHistoryPerConstraint', {
        transaction,
      });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
