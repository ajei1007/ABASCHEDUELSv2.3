'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = await queryInterface.sequelize.query('SELECT id FROM users;', { type: Sequelize.QueryTypes.SELECT });

    // Update the new column for each user
    const promises = users.map(user => {
      const uuid = uuidv4();
      return queryInterface.sequelize.query(`UPDATE users SET siblingGroupId = '${uuid}' WHERE id = '${user.id}'`);
    });

    // Wait for all updates to complete
    await Promise.all(promises);
  },

  down: async (queryInterface, Sequelize) => {
    // In case of rollback, you may want to revert the changes made by the up function.
    // This could involve resetting the value of the new column or removing it altogether.
    // For simplicity, we'll just leave it as a no-op in this example.
  }
};
