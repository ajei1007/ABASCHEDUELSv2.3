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
                      'roles',
                      'relationships',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['E','V','NA'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'roles',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['E','V','NA'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'settings',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['E','V','NA'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'settingscompany',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['E','V','NA'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'statusevents',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['E','V','NA'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'timeconstraints',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['E','V','NA'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'timeoff',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['E','V','NA'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'timeofftypes',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['E','V','NA'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'users',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['E','V','NA'],

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
                        'roles',
                        'users',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'timeofftypes',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'timeoff',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'timeconstraints',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'statusevents',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'settingscompany',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'settings',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'roles',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'relationships',
                        { transaction }
                    );

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
