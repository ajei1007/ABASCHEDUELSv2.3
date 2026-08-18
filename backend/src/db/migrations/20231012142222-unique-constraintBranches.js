'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addConstraint('newconstraintgeneratorBranches', {
      fields: ['newconstraintgeneratorId', 'branchId'],
      type: 'unique',
      name: 'unique_column1_column2',
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint(
      'newconstraintgeneratorBranches',
      'unique_column1_column2',
    );
  },
};
