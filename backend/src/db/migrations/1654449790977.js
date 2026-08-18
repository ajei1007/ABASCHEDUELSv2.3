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

                    await queryInterface.createTable('statusevents', {
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

                    await queryInterface.createTable('rescheduled', {
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

                    await queryInterface.createTable('timeoff', {
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
                      'statusevents',
                      'eventId',
                      {
                          type: Sequelize.DataTypes.UUID,

                            references: {
                                model: 'events',
                                key: 'id',
                            },

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'statusevents',
                      'startdatetime',
                      {
                          type: Sequelize.DataTypes.DATE,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'statusevents',
                      'userId',
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
                      'statusevents',
                      'status',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['Confirmed','Pending Confirmation','Pending Cancelation','Canceled'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'rescheduled',
                      'eventId',
                      {
                          type: Sequelize.DataTypes.UUID,

                            references: {
                                model: 'events',
                                key: 'id',
                            },

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'rescheduled',
                      'startDatetime',
                      {
                          type: Sequelize.DataTypes.DATE,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'rescheduled',
                      'rescheduled',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'timeoff',
                      'userId',
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
                      'timeoff',
                      'date',
                      {
                          type: Sequelize.DataTypes.DATEONLY,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'timeoff',
                      'hours',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'timeoff',
                      'reason',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['Vacation','Holiday','Sick','Personal'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'timeoff',
                      'notes',
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
                        'timeoff',
                        'notes',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'timeoff',
                        'reason',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'timeoff',
                        'hours',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'timeoff',
                        'date',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'timeoff',
                        'userId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'rescheduled',
                        'rescheduled',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'rescheduled',
                        'startDatetime',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'rescheduled',
                        'eventId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'statusevents',
                        'status',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'statusevents',
                        'userId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'statusevents',
                        'startdatetime',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'statusevents',
                        'eventId',
                        { transaction }
                    );

                    await queryInterface.dropTable('timeoff', { transaction });

                    await queryInterface.dropTable('rescheduled', { transaction });

                    await queryInterface.dropTable('statusevents', { transaction });

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
