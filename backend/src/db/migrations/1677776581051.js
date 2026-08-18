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

                    await queryInterface.createTable('pushnotifications', {
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

                    await queryInterface.createTable('notes', {
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
                      'roles',
                      'adminPushNotification',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'pushnotifications',
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
                      'pushnotifications',
                      'date',
                      {
                          type: Sequelize.DataTypes.DATEONLY,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'pushnotifications',
                      'message',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'pushnotifications',
                      'checked',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'notes',
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
                      'notes',
                      'date',
                      {
                          type: Sequelize.DataTypes.DATEONLY,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'notes',
                      'notes',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'notes',
                      'checked',
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
                        'notes',
                        'checked',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'notes',
                        'notes',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'notes',
                        'date',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'notes',
                        'eventId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'pushnotifications',
                        'checked',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'pushnotifications',
                        'message',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'pushnotifications',
                        'date',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'pushnotifications',
                        'eventId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'adminPushNotification',
                        { transaction }
                    );

                    await queryInterface.dropTable('notes', { transaction });

                    await queryInterface.dropTable('pushnotifications', { transaction });

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
