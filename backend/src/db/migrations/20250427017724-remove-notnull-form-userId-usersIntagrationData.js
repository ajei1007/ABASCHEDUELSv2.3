'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Step 1: Check if the table exists
    const [tables] = await queryInterface.sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'usersIntegrationData';
    `);

    if (tables.length === 0) {
      return;
    }

    // Step 2: Use raw SQL to drop foreign key constraints safely
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE usersIntegrationData 
        DROP FOREIGN KEY IF EXISTS fk_usersIntegrationData_userId
      `);
    } catch (error) {      
      // Fallback: Try to find and drop the constraint by name
      const [foreignKeys] = await queryInterface.sequelize.query(`
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_NAME = 'usersIntegrationData' 
        AND COLUMN_NAME = 'userId' 
        AND REFERENCED_TABLE_NAME = 'users'
        AND CONSTRAINT_SCHEMA = DATABASE();
      `);

      for (const fk of foreignKeys) {
        const fkName = fk.CONSTRAINT_NAME;

        try {
          await queryInterface.sequelize.query(`
            ALTER TABLE usersIntegrationData DROP FOREIGN KEY ${fkName}
          `);
        } catch (dropError) {
          console.log(`Error removing constraint ${fkName}:`, dropError.message);
        }
      }
    }

    // Step 3: Change the 'userId' column to allow NULL values
    try {
      await queryInterface.changeColumn('usersIntegrationData', 'userId', {
        type: Sequelize.UUID,
        allowNull: true,  // Remove NOT NULL constraint
      });
    } catch (error) {
      throw error;
    }

    // Step 4: Re-add the foreign key constraint
    try {
      await queryInterface.addConstraint('usersIntegrationData', {
        fields: ['userId'],
        type: 'foreign key',
        name: 'fk_usersIntegrationData_userId',
        references: {
          table: 'users',
          field: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
      });
    } catch (error) {
      console.log('Error adding constraint:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Step 1: Check if the table exists
    const [tables] = await queryInterface.sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'usersIntegrationData';
    `);

    if (tables.length === 0) {
      console.log('Table usersIntegrationData does not exist. Skipping rollback.');
      return;
    }

    // Step 2: Drop foreign key constraint
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE usersIntegrationData 
        DROP FOREIGN KEY IF EXISTS fk_usersIntegrationData_userId
      `);
      console.log('Successfully dropped foreign key constraint in rollback');
    } catch (error) {
      console.log('Error dropping foreign key in rollback:', error.message);
      
      // Fallback: Try to find and drop the constraint by name
      const [foreignKeys] = await queryInterface.sequelize.query(`
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_NAME = 'usersIntegrationData' 
        AND COLUMN_NAME = 'userId' 
        AND REFERENCED_TABLE_NAME = 'users'
        AND CONSTRAINT_SCHEMA = DATABASE();
      `);

      for (const fk of foreignKeys) {
        const fkName = fk.CONSTRAINT_NAME;
        console.log("Attempting to remove constraint in rollback:", fkName);

        try {
          await queryInterface.sequelize.query(`
            ALTER TABLE usersIntegrationData DROP FOREIGN KEY ${fkName}
          `);
          console.log(`Successfully removed constraint: ${fkName}`);
        } catch (dropError) {
          console.log(`Error removing constraint ${fkName}:`, dropError.message);
        }
      }
    }

    // Step 3: Revert the 'userId' column to NOT NULL
    try {
      await queryInterface.changeColumn('usersIntegrationData', 'userId', {
        type: Sequelize.UUID,
        allowNull: false,  // Revert to NOT NULL
      });
      console.log('Successfully reverted userId column to NOT NULL');
    } catch (error) {
      console.log('Error reverting column:', error.message);
      throw error;
    }

    // Step 4: Re-add the foreign key constraint
    try {
      await queryInterface.addConstraint('usersIntegrationData', {
        fields: ['userId'],
        type: 'foreign key',
        name: 'fk_usersIntegrationData_userId',
        references: {
          table: 'users',
          field: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
      });
      console.log('Successfully added foreign key constraint in rollback');
    } catch (error) {
      console.log('Error adding constraint in rollback:', error.message);
      // Don't throw here as the constraint might already exist
    }
  },
};