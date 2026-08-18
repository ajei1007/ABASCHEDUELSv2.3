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

                    await queryInterface.createTable('pricing', {
                        id: {
                            type: Sequelize.DataTypes.UUID,
                            defaultValue: Sequelize.DataTypes.UUIDV4,
                            primaryKey: true,
                        },
                        createdById: {
                            type: Sequelize.DataTypes.UUID,
                            references: {
                                key: 'id',
                                model: 'users',
                            },
                        },
                        updatedById: {
                            type: Sequelize.DataTypes.UUID,
                            references: {
                                key: 'id',
                                model: 'users',
                            },
                        },
                        createdAt: { type: Sequelize.DataTypes.DATE },
                        updatedAt: { type: Sequelize.DataTypes.DATE },
                        deletedAt: { type: Sequelize.DataTypes.DATE },
                        importHash: {
                            type: Sequelize.DataTypes.STRING(255),
                            allowNull: true,
                            unique: true,
                        },
                    }, { transaction });

                    await queryInterface.addColumn(
                      'pricing',
                      'user1Id',
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
                      'pricing',
                      'user2Id',
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
                      'pricing',
                      'incoming',
                      {
                          type: Sequelize.DataTypes.DECIMAL,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'pricing',
                      'outgoing',
                      {
                          type: Sequelize.DataTypes.DECIMAL,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'pricing',
                      'unit',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['hourly','yearly'],

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
                        'pricing',
                        'unit',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'pricing',
                        'outgoing',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'pricing',
                        'incoming',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'pricing',
                        'user2Id',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'pricing',
                        'user1Id',
                        { transaction }
                    );

                    await queryInterface.dropTable('pricing', { transaction });

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
