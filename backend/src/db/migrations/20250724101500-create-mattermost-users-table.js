'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        'mattermostUsers',
        {
          id: {
            type: Sequelize.DataTypes.UUID,
            defaultValue: Sequelize.DataTypes.UUIDV4,
            primaryKey: true,
          },
          userId: {
            type: Sequelize.DataTypes.UUID,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          mattermostUserId: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
          },
          mattermostUsername: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true,
          },
          mattermostPassword: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true,
          },
          mattermostTeamId: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true,
          },
          createdAt: {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.DataTypes.NOW,
          },
          updatedAt: {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.DataTypes.NOW,
          },
          deletedAt: {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
          },
        },
        { transaction }
      );

      // Add unique constraint to prevent duplicate mappings
      await queryInterface.addConstraint(
        'mattermostUsers',
        {
          fields: ['userId'],
          type: 'unique',
          name: 'mattermostUsers_userId_unique',
        },
        { transaction }
      );

      await queryInterface.addConstraint(
        'mattermostUsers',
        {
          fields: ['mattermostUserId'],
          type: 'unique',
          name: 'mattermostUsers_mattermostUserId_unique',
        },
        { transaction }
      );

      // Add index for better query performance
      await queryInterface.addIndex(
        'mattermostUsers',
        ['userId'],
        { transaction }
      );

      await queryInterface.addIndex(
        'mattermostUsers',
        ['mattermostUserId'],
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('mattermostUsers', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
}; 