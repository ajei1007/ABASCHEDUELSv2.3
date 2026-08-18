'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('siblingsUsers', {
      id: {
        type: Sequelize.DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.DataTypes.CHAR(36),
        primaryKey: true,
        allowNull: false,
      },
    });
    await queryInterface.addColumn('users', 'siblingUserId', {
      type: Sequelize.DataTypes.CHAR(36),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      'siblingsUsers',
      'unique_sibling_users_constraint',
    );
    await queryInterface.dropTable('siblingsUsers');
    await queryInterface.removeColumn('users', 'siblingUserId');
  },
};
