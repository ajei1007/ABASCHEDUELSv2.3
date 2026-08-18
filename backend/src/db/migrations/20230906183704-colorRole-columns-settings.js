module.exports = {
  /**
   * @param {QueryInterface} queryInterface
   * @param {Sequelize} Sequelize
   * @returns {Promise<void>}
   */
  async up(queryInterface, Sequelize) {
    /**
     * @type {Transaction}
     */
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'settings',
        'backgroundColorRole',
        {
          type: Sequelize.DataTypes.TEXT,
          allowNull: true,
        },
        { transaction },
      );
       await queryInterface.addColumn(
        'settings',
        'borderColorRole',
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
  /**
   * @param {QueryInterface} queryInterface
   * @param {Sequelize} Sequelize
   * @returns {Promise<void>}
   */
  async down(queryInterface, Sequelize) {
    /**
     * @type {Transaction}
     */
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('settings', 'backgroundColorRole', { transaction });
      await queryInterface.removeColumn('settings', 'borderColorRole', { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
