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
                      'paid',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['Paid','Unpaid'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'timeoff',
                      'datetimeend',
                      {
                          type: Sequelize.DataTypes.DATE,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'mobiletoken',
                      {
                          type: Sequelize.DataTypes.TEXT,

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
                        'mobiletoken',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'timeoff',
                        'datetimeend',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'timeoff',
                        'paid',
                        { transaction }
                    );

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
