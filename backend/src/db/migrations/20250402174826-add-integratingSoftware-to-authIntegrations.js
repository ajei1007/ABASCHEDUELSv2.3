'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Adding the integratingSoftware column with a default value of an empty string
    await queryInterface.addColumn('authIntegrations', 'integratingSoftware', {
      type: Sequelize.DataTypes.TEXT,
      allowNull: false,
      defaultValue: ''
    });

    await queryInterface.sequelize.query(`
      CREATE INDEX idx_integratingSoftware_authIntegrations
      ON authIntegrations (integratingSoftware(255));
    `);
  },

  async down(queryInterface, Sequelize) {
    // Removing the index first
    await queryInterface.sequelize.query(`
      DROP INDEX idx_integratingSoftware_authIntegrations 
      ON authIntegrations;
    `);

    // Removing the integratingSoftware column
    await queryInterface.removeColumn('authIntegrations', 'integratingSoftware');
  }
};
