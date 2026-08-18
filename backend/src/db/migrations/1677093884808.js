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
                      'users',
                      'hourlyrate',
                      {
                          type: Sequelize.DataTypes.DECIMAL,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'salary',
                      {
                          type: Sequelize.DataTypes.DECIMAL,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'hourlyrevenue',
                      {
                          type: Sequelize.DataTypes.DECIMAL,

                      },
                      { transaction }
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

                    await queryInterface.removeColumn(
                        'users',
                        'hourlyrevenue',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'salary',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'hourlyrate',
                        { transaction }
                    );

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
