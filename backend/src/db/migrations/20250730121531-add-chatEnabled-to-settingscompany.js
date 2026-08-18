module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const tableDefinition = await queryInterface.describeTable('settingscompany');

      if (!tableDefinition['chatEnabled']) {
        await queryInterface.addColumn(
          'settingscompany',
          'chatEnabled',
          {
            type: Sequelize.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            after: 'integrationEnabled',
          },
          { transaction },
        );
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const tableDefinition = await queryInterface.describeTable('settingscompany');

      if (tableDefinition['chatEnabled']) {
        await queryInterface.removeColumn('settingscompany', 'chatEnabled', {
          transaction,
        });
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
