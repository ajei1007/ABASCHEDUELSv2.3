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
                      'clock',
                      'on',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'clock',
                      'totalTime',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'settings',
                      'driveTime',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'settings',
                      'blocks',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'settings',
                      'orange',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'settings',
                      'recurring',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['Replace Only This Event','Replace Past Recurring Events','Replace Future Recurring Events','Replace All These Recurring Events'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'settings',
                      'defaultActivityId',
                      {
                          type: Sequelize.DataTypes.UUID,

                            references: {
                                model: 'users',
                                key: 'id',
                            },

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'settings',
                      'defaultLocationId',
                      {
                          type: Sequelize.DataTypes.UUID,

                            references: {
                                model: 'roles',
                                key: 'id',
                            },

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
                        'defaultLocationId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'settings',
                        'defaultActivityId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'settings',
                        'recurring',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'settings',
                        'orange',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'settings',
                        'blocks',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'settings',
                        'driveTime',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'clock',
                        'totalTime',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'clock',
                        'on',
                        { transaction }
                    );

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
