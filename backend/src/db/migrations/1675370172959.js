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
                      'optimizer',
                      'branchId',
                      {
                          type: Sequelize.DataTypes.UUID,

                            references: {
                                model: 'branches',
                                key: 'id',
                            },

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'is_events',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'overlap_roleId',
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
                      'optimizer',
                      'break_roleId',
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
                      'optimizer',
                      'break_length',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'part1',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'is_overlap_constraint',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'is_minSession_constraint',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'is_delete',
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
                        'optimizer',
                        'is_delete',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'is_minSession_constraint',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'is_overlap_constraint',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'part1',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'break_length',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'break_roleId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'overlap_roleId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'is_events',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'branchId',
                        { transaction }
                    );

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
