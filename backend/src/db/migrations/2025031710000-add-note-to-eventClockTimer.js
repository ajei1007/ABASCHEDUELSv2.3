'use strict';

async function columnExists(queryInterface, tableName, columnName) {
  const tableDescription = await queryInterface.describeTable(tableName);
  return !!tableDescription[columnName];
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    const exists = await columnExists(queryInterface, 'eventClockTimer', 'note');
    if(exists) return;
    try {
      await queryInterface.addColumn(
        'eventClockTimer',
        'note',
        {
          type: Sequelize.DataTypes.TEXT,
          allowNull: true,
        },
        { transaction },
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    const exists = await columnExists(queryInterface, 'eventClockTimer', 'note');
    if(!exists) return;
    try {
      await queryInterface.removeColumn('eventClockTimer', 'note', {
        transaction,
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};