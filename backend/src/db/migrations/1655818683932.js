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
                      'dateformats',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['DD-MM-YYYY','DD/MM/YYYY','MM-DD-YYYY','MM/DD/YYYY','YYYY-MM-DD','YYYY/MM/DD'],

                      },
                      { transaction }
                    );

                    await queryInterface.removeColumn(
                        'settings',
                        'dateFormat',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'settings',
                        'hour12',
                        { transaction }
                    );

                    await queryInterface.addColumn(
                      'settings',
                      'hour24',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
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
                        'settings',
                        'hour24',
                        { transaction }
                    );

                    await queryInterface.addColumn(
                      'settings',
                      'hour12',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'settings',
                      'dateFormat',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['DD-MM-YYYY','DD/MM/YY','DD-MM-YYYY','DD-MM-YY','MM-DD-YYYY','MM/DD/YY','MM-DD-YYYY','MM-DD-YY'],

                      },
                      { transaction }
                    );

                    await queryInterface.removeColumn(
                        'settings',
                        'dateformats',
                        { transaction }
                    );

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
