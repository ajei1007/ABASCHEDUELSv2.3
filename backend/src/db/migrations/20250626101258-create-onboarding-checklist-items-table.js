'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Create onboardingChecklistItems table
      await queryInterface.createTable('onboardingChecklistItems', {
        id: {
          type: Sequelize.DataTypes.UUID,
          defaultValue: Sequelize.DataTypes.UUIDV4,
          primaryKey: true,
        },
        templateId: {
          type: Sequelize.DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'onboardingChecklistTemplates',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        title: {
          type: Sequelize.DataTypes.STRING(255),
          allowNull: false,
        },
        content: {
          type: Sequelize.DataTypes.TEXT,
          allowNull: true,
        },
        order: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        createdAt: {
          type: Sequelize.DataTypes.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DataTypes.DATE,
          allowNull: false,
        },
      }, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.dropTable('onboardingChecklistItems', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};