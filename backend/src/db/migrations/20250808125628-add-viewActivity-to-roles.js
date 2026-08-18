'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const table = await queryInterface.describeTable('roles');

       // Add the column only if it doesn't exist
      if (!table.viewActivity) {
        await queryInterface.addColumn(
          'roles',
          'viewActivity',
          {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          { transaction }
        );
      }
  
      // Update Super Admin roles to have viewActivity = true
      await queryInterface.sequelize.query(`
        UPDATE roles
        SET viewActivity = true
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
      if (table.viewActivity) {
        await queryInterface.removeColumn('roles', 'viewActivity', { transaction });
      }
      await transaction.commit()
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}; 