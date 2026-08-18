'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()

    try {
      await queryInterface.createTable('onboardingCompanyChecklistItems', {
        id: {
          type: Sequelize.DataTypes.UUID,
          defaultValue: Sequelize.DataTypes.UUIDV4,
          primaryKey: true,
        },
        companyId: {
          type: Sequelize.DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'companies',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        checklistItemId: {
          type: Sequelize.DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'onboardingChecklistItems',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        isCompleted: {
          type: Sequelize.DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        completedAt: {
          type: Sequelize.DataTypes.DATE,
          allowNull: true,
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

      // Add unique constraint for company_id and checklist_item_id
      await queryInterface.addConstraint('onboardingCompanyChecklistItems', {
        fields: ['companyId', 'checklistItemId'],
        type: 'unique',
        name: 'unique_task_per_company',
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
      await queryInterface.dropTable('onboardingCompanyChecklistItems', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};