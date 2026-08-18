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
                      'timeoff',
                      'duration',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.removeColumn(
                        'timeoff',
                        'hours',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'timeoff',
                        'date',
                        { transaction }
                    );

                    await queryInterface.addColumn(
                      'timeoff',
                      'datetimestart',
                      {
                          type: Sequelize.DataTypes.DATE,

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
                        'timeoff',
                        'datetimestart',
                        { transaction }
                    );

                    await queryInterface.addColumn(
                      'timeoff',
                      'date',
                      {
                          type: Sequelize.DataTypes.DATEONLY,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'timeoff',
                      'hours',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.removeColumn(
                        'timeoff',
                        'duration',
                        { transaction }
                    );

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
