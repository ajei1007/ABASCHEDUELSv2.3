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
                      'users',
                      'capacity',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'hasRooms',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'parentId',
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
                      'timeconstraints',
                      'role1Id',
                      {
                          type: Sequelize.DataTypes.UUID,

                            references: {
                                model: 'roles',
                                key: 'id',
                            },

                      },
                      { transaction }
                    );

                    await queryInterface.createTable('placematrix', {
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
                      'placematrix',
                      'address',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'placematrix',
                      'long',
                      {
                          type: Sequelize.DataTypes.DECIMAL,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'placematrix',
                      'lat',
                      {
                          type: Sequelize.DataTypes.DECIMAL,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'distancematrix',
                      'addy1Id',
                      {
                          type: Sequelize.DataTypes.UUID,

                            references: {
                                model: 'placematrix',
                                key: 'id',
                            },

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'distancematrix',
                      'addy2Id',
                      {
                          type: Sequelize.DataTypes.UUID,

                            references: {
                                model: 'placematrix',
                                key: 'id',
                            },

                      },
                      { transaction }
                    );

                    await queryInterface.createTable('colors', {
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
                      'colors',
                      'color',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'colors',
                      'hex',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'colorsId',
                      {
                          type: Sequelize.DataTypes.UUID,

                            references: {
                                model: 'colors',
                                key: 'id',
                            },

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'colorsId',
                      {
                          type: Sequelize.DataTypes.UUID,

                            references: {
                                model: 'colors',
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
                        'roles',
                        'colorsId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'colorsId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'colors',
                        'hex',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'colors',
                        'color',
                        { transaction }
                    );

                    await queryInterface.dropTable('colors', { transaction });

                    await queryInterface.removeColumn(
                        'distancematrix',
                        'addy2Id',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'distancematrix',
                        'addy1Id',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'placematrix',
                        'lat',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'placematrix',
                        'long',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'placematrix',
                        'address',
                        { transaction }
                    );

                    await queryInterface.dropTable('placematrix', { transaction });

                    await queryInterface.removeColumn(
                        'timeconstraints',
                        'role1Id',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'parentId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'hasRooms',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'capacity',
                        { transaction }
                    );

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
