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
                      'capacityconstraints',
                      'subgroup1Id',
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
                      'capacityconstraints',
                      'subgroup2Id',
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
                      'capacityconstraints',
                      'subgroup3Id',
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
                      'capacityconstraints',
                      'subgroup4Id',
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
                      'capacityconstraints',
                      'role5Id',
                      {
                          type: Sequelize.DataTypes.UUID,

                            references: {
                                model: 'roles',
                                key: 'id',
                            },

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'capacityconstraints',
                      'min5',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'capacityconstraints',
                      'max5',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'capacityconstraints',
                      'subgroup5Id',
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
                      'capacityconstraints',
                      'locationDisabled',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'capacityconstraints',
                      'disabled',
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
                        'capacityconstraints',
                        'disabled',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'locationDisabled',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'subgroup5Id',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'max5',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'min5',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'role5Id',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'subgroup4Id',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'subgroup3Id',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'subgroup2Id',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'subgroup1Id',
                        { transaction }
                    );

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
