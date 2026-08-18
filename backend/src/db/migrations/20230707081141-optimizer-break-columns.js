'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    await queryInterface.addColumn(
      'optimizer',
      'breakQuantity',
      {
        type: Sequelize.DataTypes.INTEGER,
        defaultValue: 0,
      },
      { transaction },
    );
    await queryInterface.addColumn(
      'optimizer',
      'oneBreakHours',
      {
        type: Sequelize.DataTypes.DECIMAL(5, 2),
      },
      { transaction },
    );
    await queryInterface.addColumn(
      'optimizer',
      'twoBreakHours',
      {
        type: Sequelize.DataTypes.DECIMAL(5, 2),
      },
      { transaction },
    );
  },

  async down (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    await queryInterface.removeColumn('optimizer', 'breakQuantity', { transaction });
    await queryInterface.removeColumn('optimizer', 'oneBreakHours', { transaction });
    await queryInterface.removeColumn('optimizer', 'twoBreakHours', { transaction });
  }
};
