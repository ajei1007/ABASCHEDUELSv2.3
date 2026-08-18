module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(
        `UPDATE companies SET membership = 'basic' WHERE membership IS NULL`,
        { transaction }
      );

      // Then, attempt to change the column
      await queryInterface.changeColumn(
        'companies',
        'membership',
        {
          type: Sequelize.DataTypes.ENUM('basic', 'standard', 'pro'),
          defaultValue: 'basic',
          allowNull: false,
        },
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('companies', 'membership', { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
