'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Deleting colorsId association from users table
      await queryInterface.removeColumn(
        'users',
        'colorsId',
        {
          transaction, 
        }
      );


      await queryInterface.removeColumn(
        'roles',
        'colorsId',
        {
          transaction, 
        }
      );

      await queryInterface.removeColumn(
        'eventstatus',
        'colorId',
        {
          transaction, 
        }
      );

      // Deleting colors table
      await queryInterface.dropTable('colors', {
        transaction,
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }    
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Creating colors table
      await queryInterface.createTable(
        'colors',
        {
          id: {
            type: Sequelize.DataTypes.UUID,
            defaultValue: Sequelize.DataTypes.UUIDV4,
            primaryKey: true,
          },
          color: {
            type: Sequelize.DataTypes.TEXT,
          },
          hex: {
            type: Sequelize.DataTypes.TEXT,
          },
          importHash: {
            type: Sequelize.DataTypes.STRING(255),
            allowNull: true,
            unique: true,
          },
          createdById: {
            type: Sequelize.DataTypes.UUID,
            allowNull: true,
          },
          updatedById: {
            type: Sequelize.DataTypes.UUID,
            allowNull: true,
          },
          createdAt: { 
            type: Sequelize.DataTypes.DATE 
          },
          updatedAt: { 
            type: Sequelize.DataTypes.DATE 
          },
          deletedAt: { 
            type: Sequelize.DataTypes.DATE 
          },
        },
        { 
          transaction 
        },
      );

      // Adding colorsId association to users table
      await queryInterface.addColumn(
        'users',
        'colorsId',
        {
          type: Sequelize.DataTypes.UUID,
          allowNull: true,
          references: {
            model: 'colors',
            key: 'id'
          },
        },
        { 
          transaction,
        }
      );

      // Adding colorsId association to roles table
      await queryInterface.addColumn(
        'roles',
        'colorsId',
        {
          type: Sequelize.DataTypes.UUID,
          allowNull: true,
          
          references: {
            model: 'colors',
            key: 'id'
          },
        },
        { 
          transaction,
        }
      );

      // Adding colorId association to eventstatus table
      await queryInterface.addColumn(
        'eventstatus',
        'colorId',
        {
          type: Sequelize.DataTypes.UUID,
          allowNull: true,
          references: {
            model: 'colors',
            key: 'id'
          },
        },
        { 
          transaction,
        }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    } 
  }
};
