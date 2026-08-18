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
                      'statistics',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['E','V','NA'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'constraints',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['V','E','NA'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'events',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['E','V','NA'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'subgroups',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['E','V','NA'],

                      },
                      { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'cancellations',
                        { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'cancelations',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['E','V','NA'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'timeconstraints',
                      'subgroupId',
                      {
                          type: Sequelize.DataTypes.UUID,

                            references: {
                                model: 'subgroups',
                                key: 'id',
                            },

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'companies',
                      'membership',
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
                        'companies',
                        'membership',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'timeconstraints',
                        'subgroupId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'cancelations',
                        { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'cancellations',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['V','E','NA'],

                      },
                      { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'subgroups',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'events',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'constraints',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'statistics',
                        { transaction }
                    );

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
