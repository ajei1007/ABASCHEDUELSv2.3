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

                    await queryInterface.createTable('clock', {
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
                      'clock',
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
                      'clock',
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
                      'clock',
                      'clockIn',
                      {
                          type: Sequelize.DataTypes.DATE,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'clock',
                      'clockOut',
                      {
                          type: Sequelize.DataTypes.DATE,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'clock',
                      'notes',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.createTable('scheduler', {
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
                      'scheduler',
                      'field',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.createTable('stats', {
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
                      'stats',
                      'field',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.createTable('settings', {
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
                      'settings',
                      'overbooking',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'settings',
                      'weekends',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'settings',
                      'blockScheduling',
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

                            values: ['DD-MM-YYYY','DD/MM/YY','DD-MM-YY','MM/DD/YY','MM-DD-YYYY','MM-DD-YY'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'settings',
                      'titleFormatYear',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['numeric','2-digit'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'settings',
                      'titleFormatMonth',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['long','short','narrow','numeric','2-digit'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'settings',
                      'titleFormatDay',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['long','short','narrow'],

                      },
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
                      'scrollTime',
                      {
                          type: Sequelize.DataTypes.DATE,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'settings',
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
                      'settings',
                      'initialView',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['Day TimeLine','Week TimeLine','Day TimeGrid','Week TimeGrid'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'settings',
                      'timezone',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['America/Pangnirtung'],

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
                        'timezone',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'settings',
                        'initialView',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'settings',
                        'userId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'settings',
                        'scrollTime',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'settings',
                        'hour12',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'settings',
                        'titleFormatDay',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'settings',
                        'titleFormatMonth',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'settings',
                        'titleFormatYear',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'settings',
                        'dateFormat',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'settings',
                        'blockScheduling',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'settings',
                        'weekends',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'settings',
                        'overbooking',
                        { transaction }
                    );

                    await queryInterface.dropTable('settings', { transaction });

                    await queryInterface.removeColumn(
                        'stats',
                        'field',
                        { transaction }
                    );

                    await queryInterface.dropTable('stats', { transaction });

                    await queryInterface.removeColumn(
                        'scheduler',
                        'field',
                        { transaction }
                    );

                    await queryInterface.dropTable('scheduler', { transaction });

                    await queryInterface.removeColumn(
                        'clock',
                        'notes',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'clock',
                        'clockOut',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'clock',
                        'clockIn',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'clock',
                        'eventId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'clock',
                        'userId',
                        { transaction }
                    );

                    await queryInterface.dropTable('clock', { transaction });

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
