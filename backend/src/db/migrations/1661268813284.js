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
                      'driveTimeQuantity',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'settings',
                      'driveTimeUnit',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['Minutes','Hours'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'settings',
                      'driveDistanceMax',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'settings',
                      'driveDistanceMaxQuantity',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'settings',
                      'driveDistanceMaxUnit',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['mi','km'],

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
                        'driveDistanceMaxUnit',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'settings',
                        'driveDistanceMaxQuantity',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'settings',
                        'driveDistanceMax',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'settings',
                        'driveTimeUnit',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'settings',
                        'driveTimeQuantity',
                        { transaction }
                    );

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
