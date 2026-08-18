'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Query to check if the index exists
      const indexes = await queryInterface.sequelize.query(`
        SHOW INDEX FROM usersIntegrationData WHERE Key_name = 'idx_integratingSoftware';
      `, { transaction, type: queryInterface.sequelize.QueryTypes.SELECT });

      // If the index exists, then drop it
      if (indexes.length > 0) {
        await queryInterface.sequelize.query(`
          DROP INDEX idx_integratingSoftware ON usersIntegrationData;
        `, { transaction });
      }
      //==================================================================================//

      // REVERSE usersIntegrationData new columns
      if (await columnExists(queryInterface, 'usersIntegrationData', 'companyId')) {
        await queryInterface.removeColumn('usersIntegrationData', 'companyId', {
          transaction,
        });
      }

      if (await columnExists(queryInterface, 'usersIntegrationData', 'otherTableName')) {
        await queryInterface.removeColumn('usersIntegrationData', 'otherTableName', { 
          transaction 
        });
      }

      if (await columnExists(queryInterface, 'usersIntegrationData', 'idOther')) {
        await queryInterface.removeColumn('usersIntegrationData', 'idOther', {
          transaction,
        });
      }

      if (await columnExists(queryInterface, 'usersIntegrationData', 'tableName')) {
        await queryInterface.removeColumn('usersIntegrationData', 'tableName', {
          transaction,
        });
      }

      //==================================================================================//

      // REVERSE authIntegrations new columns
      if (await columnExists(queryInterface, 'authIntegrations', 'credentials')) {
        await queryInterface.removeColumn('authIntegrations', 'credentials', {
          transaction,
        });
      }

      if (await columnExists(queryInterface, 'authIntegrations', 'companyId')) {
        await queryInterface.removeColumn('authIntegrations', 'companyId', {
          transaction,
        });
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // This part of the script can be used to re-add the columns if necessary.
  },
};

// Helper function to check if a column exists
async function columnExists(queryInterface, tableName, columnName) {
  const query = `
      SELECT 1
       FROM information_schema.columns 
      WHERE table_name = '${tableName}' 
        AND column_name = '${columnName}'
        AND table_schema = DATABASE()
  `;
  const result = await queryInterface.sequelize.query(query, {
    type: queryInterface.sequelize.QueryTypes.SELECT,
  });
  return result.length > 0 ;
}
