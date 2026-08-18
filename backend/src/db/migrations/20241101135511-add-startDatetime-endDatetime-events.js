'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new columns `startDatetime` and `endDatetime`
    await queryInterface.addColumn('events', 'startDatetime', {
      type: Sequelize.DataTypes.DATE,
      allowNull: true, // Temporarily allow null for data migration
    });

    await queryInterface.addColumn('events', 'endDatetime', {
      type: Sequelize.DataTypes.DATE,
      allowNull: true, // Temporarily allow null for data migration
    });

    // Populate new columns with combined values
    await queryInterface.sequelize.query(`
      UPDATE events
      SET 
        startDatetime = TIMESTAMP(CONCAT(DATE(startRecur), ' ', TIME(start))),
        endDatetime = TIMESTAMP(CONCAT(DATE(endRecur), ' ', TIME(end)))
    `);

    // Make new columns NOT NULL
    await queryInterface.changeColumn('events', 'startDatetime', {
      type: Sequelize.DataTypes.DATE,
      allowNull: false,
    });

    await queryInterface.changeColumn('events', 'endDatetime', {
      type: Sequelize.DataTypes.DATE,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Reverse the migration
    await queryInterface.removeColumn('events', 'startDatetime');
    await queryInterface.removeColumn('events', 'endDatetime');
  },
};
