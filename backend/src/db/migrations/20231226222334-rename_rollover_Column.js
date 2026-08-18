'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('newconstraintgenerator', 'notRolledOver', 'rollover');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('newconstraintgenerator', 'rollover', 'notRolledOver');
  }
};