'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const table = await queryInterface.describeTable('roles');

       // Add the column only if it doesn't exist
      if (!table.deleteActivity) {
        await queryInterface.addColumn(
          'roles',
          'deleteActivity',
          {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          { transaction }
        );
      }
  
      // Update Super Admin roles to have deleteActivity = true
      await queryInterface.sequelize.query(`
        UPDATE roles
        SET deleteActivity = true
        WHERE name = 'Super Admin'
      `, {transaction});

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
    
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const table = await queryInterface.describeTable('roles');

      // Remove the column only if it exists
      if (table.deleteActivity) {
        await queryInterface.removeColumn('roles', 'deleteActivity', { transaction });
      }
      await transaction.commit()
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}; 