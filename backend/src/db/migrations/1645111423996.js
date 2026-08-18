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

                    await queryInterface.createTable('users', {
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
                      'users',
                      'firstName',
                      {
                          type: Sequelize.DataTypes.STRING,
                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'lastName',
                      {
                          type: Sequelize.DataTypes.STRING,
                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'phoneNumber',
                      {
                          type: Sequelize.DataTypes.TEXT,
                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'email',
                      {
                          type: Sequelize.DataTypes.STRING,
                          // unique: true,
                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'role',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['admin','user'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'disabled',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'password',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'emailVerified',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'emailVerificationToken',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'emailVerificationTokenExpiresAt',
                      {
                          type: Sequelize.DataTypes.DATE,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'passwordResetToken',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'passwordResetTokenExpiresAt',
                      {
                          type: Sequelize.DataTypes.DATE,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'provider',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.createTable('industries', {
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
                      'industries',
                      'name',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.createTable('companies', {
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
                      'companies',
                      'name',
                      {
                          type: Sequelize.DataTypes.STRING,
                          unique: true,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'companies',
                      'industryId',
                      {
                          type: Sequelize.DataTypes.UUID,

                            references: {
                                model: 'industries',
                                key: 'id',
                            },

                      },
                      { transaction }
                    );

                    await queryInterface.createTable('funderstype', {
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
                      'funderstype',
                      'name',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.createTable('codetype', {
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
                      'codetype',
                      'name',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.createTable('daysofweek', {
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
                      'daysofweek',
                      'name',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.createTable('locationstypes', {
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
                      'locationstypes',
                      'name',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.createTable('resources', {
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
                      'resources',
                      'name',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'resources',
                      'reusable',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.createTable('groupings', {
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
                      'groupings',
                      'name',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'groupings',
                      'min',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'groupings',
                      'max',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'groupings',
                      'active',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.createTable('cancellationtypes', {
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
                      'cancellationtypes',
                      'name',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.createTable('dataconstraints', {
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
                      'dataconstraints',
                      'name',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'dataconstraints',
                      'active',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.createTable('funders', {
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
                      'funders',
                      'name',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'funders',
                      'typeId',
                      {
                          type: Sequelize.DataTypes.UUID,

                            references: {
                                model: 'funderstype',
                                key: 'id',
                            },

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'funders',
                      'codeTypeId',
                      {
                          type: Sequelize.DataTypes.UUID,

                            references: {
                                model: 'codetype',
                                key: 'id',
                            },

                      },
                      { transaction }
                    );

                    await queryInterface.createTable('roles', {
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
                      'name',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'typeId',
                      {
                          type: Sequelize.DataTypes.UUID,

                            references: {
                                model: 'resources',
                                key: 'id',
                            },

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'dataAccess',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['All','Branch','User'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'availability',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['E','V','NA'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'scheduler',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['E','V','NA'],

                      },
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

                    await queryInterface.createTable('branches', {
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
                      'branches',
                      'name',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.createTable('availabilities', {
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
                      'availabilities',
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
                      'availabilities',
                      'startTime',
                      {
                          type: Sequelize.DataTypes.DATE,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'availabilities',
                      'endTime',
                      {
                          type: Sequelize.DataTypes.DATE,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'availabilities',
                      'available',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'availabilities',
                      'startRange',
                      {
                          type: Sequelize.DataTypes.DATEONLY,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'availabilities',
                      'endRange',
                      {
                          type: Sequelize.DataTypes.DATEONLY,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'availabilities',
                      'locationId',
                      {
                          type: Sequelize.DataTypes.UUID,

                            references: {
                                model: 'locationstypes',
                                key: 'id',
                            },

                      },
                      { transaction }
                    );

                    await queryInterface.createTable('events', {
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
                      'events',
                      'start',
                      {
                          type: Sequelize.DataTypes.DATE,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'events',
                      'end',
                      {
                          type: Sequelize.DataTypes.DATE,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'events',
                      'startRecur',
                      {
                          type: Sequelize.DataTypes.DATEONLY,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'events',
                      'endRecur',
                      {
                          type: Sequelize.DataTypes.DATEONLY,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'events',
                      'frequency',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['Weekly','Monthly','Yearly','Daily'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'events',
                      'interval',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'events',
                      'background',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'events',
                      'border',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'events',
                      'notes',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'events',
                      'secondary',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'events',
                      'eventConnectId',
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
                      'events',
                      'allDay',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.createTable('subgroups', {
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
                      'subgroups',
                      'name',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'subgroups',
                      'groupId',
                      {
                          type: Sequelize.DataTypes.UUID,

                            references: {
                                model: 'groupings',
                                key: 'id',
                            },

                      },
                      { transaction }
                    );

                    await queryInterface.createTable('matches', {
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
                      'matches',
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
                      'matches',
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
                      'matches',
                      'compatible',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.createTable('exclusions', {
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
                      'exclusions',
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
                      'exclusions',
                      'datetime',
                      {
                          type: Sequelize.DataTypes.DATE,

                      },
                      { transaction }
                    );

                    await queryInterface.createTable('tags', {
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
                      'tags',
                      'name',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.createTable('distanceconstraints', {
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
                      'distanceconstraints',
                      'name',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.createTable('timeconstraints', {
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
                      'timeconstraints',
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
                      'timeconstraints',
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
                      'timeconstraints',
                      'min',
                      {
                          type: Sequelize.DataTypes.DECIMAL,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'timeconstraints',
                      'max',
                      {
                          type: Sequelize.DataTypes.DECIMAL,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'timeconstraints',
                      'unit',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['Hours','Minutes','Seconds','Units'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'timeconstraints',
                      'frequency',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['Per Session','Total','Daily','Weekly','Monthly','Annually'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'timeconstraints',
                      'start',
                      {
                          type: Sequelize.DataTypes.DATEONLY,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'timeconstraints',
                      'end',
                      {
                          type: Sequelize.DataTypes.DATEONLY,

                      },
                      { transaction }
                    );

                    await queryInterface.createTable('capacityconstraints', {
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
                      'capacityconstraints',
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
                      'capacityconstraints',
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
                      'capacityconstraints',
                      'op1',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['('],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'capacityconstraints',
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

                    await queryInterface.addColumn(
                      'capacityconstraints',
                      'min1',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'capacityconstraints',
                      'max1',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'capacityconstraints',
                      'op2',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: [') AND','AND','AND (','OR (','OR',') OR',')','('],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'capacityconstraints',
                      'role2Id',
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
                      'min2',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'capacityconstraints',
                      'max2',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'capacityconstraints',
                      'op3',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: [') AND','AND','AND (','OR (','OR',') OR',')','('],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'capacityconstraints',
                      'role3Id',
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
                      'min3',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'capacityconstraints',
                      'max3',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'capacityconstraints',
                      'op4',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: [') AND','AND','AND (','OR (','OR',') OR',')','('],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'capacityconstraints',
                      'role4Id',
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
                      'min4',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'capacityconstraints',
                      'max4',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'capacityconstraints',
                      'op5',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: [') AND','AND','AND (','OR (','OR',') OR',')','('],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'gender',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['M','F'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'alias',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'otherPhones',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'otherEmails',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'resourceId',
                      {
                          type: Sequelize.DataTypes.UUID,

                            references: {
                                model: 'resources',
                                key: 'id',
                            },

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'companyId',
                      {
                          type: Sequelize.DataTypes.UUID,

                            references: {
                                model: 'companies',
                                key: 'id',
                            },

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'address',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'longitude',
                      {
                          type: Sequelize.DataTypes.DECIMAL(10, 7),

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'latitude',
                      {
                          type: Sequelize.DataTypes.DECIMAL(10, 7),

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'locationTypeId',
                      {
                          type: Sequelize.DataTypes.UUID,

                            references: {
                                model: 'locationstypes',
                                key: 'id',
                            },

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'active',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'minHours',
                      {
                          type: Sequelize.DataTypes.DECIMAL,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'maxHours',
                      {
                          type: Sequelize.DataTypes.DECIMAL,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'color',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'birthday',
                      {
                          type: Sequelize.DataTypes.DATEONLY,

                      },
                      { transaction }
                    );

                    await queryInterface.createTable('cancellations', {
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

                    await queryInterface.addConstraint('users', {
                        fields: ['companyId', 'firstName', 'lastName', 'deletedAt'],
                        type: 'unique',
                        name: 'custom_unique_constraint_name'
                      });
                      
                    await queryInterface.addConstraint('users', {
                        fields: ['email', 'deletedAt'],
                        type: 'unique',
                        name: 'email'
                      });

                    await queryInterface.addColumn(
                      'cancellations',
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
                      'cancellations',
                      'date',
                      {
                          type: Sequelize.DataTypes.DATEONLY,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'cancellations',
                      'reasonId',
                      {
                          type: Sequelize.DataTypes.UUID,

                            references: {
                                model: 'cancellationtypes',
                                key: 'id',
                            },

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'cancellations',
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
                        'cancellations',
                        'userId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'cancellations',
                        'reasonId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'cancellations',
                        'date',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'cancellations',
                        'eventId',
                        { transaction }
                    );

                    await queryInterface.dropTable('cancellations', { transaction });

                    await queryInterface.removeColumn(
                        'users',
                        'birthday',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'color',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'maxHours',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'minHours',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'active',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'locationTypeId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'latitude',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'longitude',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'address',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'companyId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'resourceId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'otherEmails',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'otherPhones',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'alias',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'gender',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'op5',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'max4',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'min4',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'role4Id',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'op4',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'max3',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'min3',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'role3Id',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'op3',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'max2',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'min2',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'role2Id',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'op2',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'max1',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'min1',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'role1Id',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'op1',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'user2Id',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'user1Id',
                        { transaction }
                    );

                    await queryInterface.dropTable('capacityconstraints', { transaction });

                    await queryInterface.removeColumn(
                        'timeconstraints',
                        'end',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'timeconstraints',
                        'start',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'timeconstraints',
                        'frequency',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'timeconstraints',
                        'unit',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'timeconstraints',
                        'max',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'timeconstraints',
                        'min',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'timeconstraints',
                        'user2Id',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'timeconstraints',
                        'user1Id',
                        { transaction }
                    );

                    await queryInterface.dropTable('timeconstraints', { transaction });

                    await queryInterface.removeColumn(
                        'distanceconstraints',
                        'name',
                        { transaction }
                    );

                    await queryInterface.dropTable('distanceconstraints', { transaction });

                    await queryInterface.removeColumn(
                        'tags',
                        'name',
                        { transaction }
                    );

                    await queryInterface.dropTable('tags', { transaction });

                    await queryInterface.removeColumn(
                        'exclusions',
                        'datetime',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'exclusions',
                        'eventId',
                        { transaction }
                    );

                    await queryInterface.dropTable('exclusions', { transaction });

                    await queryInterface.removeColumn(
                        'matches',
                        'compatible',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'matches',
                        'user2Id',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'matches',
                        'user1Id',
                        { transaction }
                    );

                    await queryInterface.dropTable('matches', { transaction });

                    await queryInterface.removeColumn(
                        'subgroups',
                        'groupId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'subgroups',
                        'name',
                        { transaction }
                    );

                    await queryInterface.dropTable('subgroups', { transaction });

                    await queryInterface.removeColumn(
                        'events',
                        'allDay',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'events',
                        'eventConnectId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'events',
                        'secondary',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'events',
                        'notes',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'events',
                        'border',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'events',
                        'background',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'events',
                        'interval',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'events',
                        'frequency',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'events',
                        'endRecur',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'events',
                        'startRecur',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'events',
                        'end',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'events',
                        'start',
                        { transaction }
                    );

                    await queryInterface.dropTable('events', { transaction });

                    await queryInterface.removeColumn(
                        'availabilities',
                        'locationId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'availabilities',
                        'endRange',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'availabilities',
                        'startRange',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'availabilities',
                        'available',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'availabilities',
                        'endTime',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'availabilities',
                        'startTime',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'availabilities',
                        'userId',
                        { transaction }
                    );

                    await queryInterface.dropTable('availabilities', { transaction });

                    await queryInterface.removeColumn(
                        'branches',
                        'name',
                        { transaction }
                    );

                    await queryInterface.dropTable('branches', { transaction });

                    await queryInterface.removeColumn(
                        'roles',
                        'cancellations',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'scheduler',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'availability',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'dataAccess',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'typeId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'name',
                        { transaction }
                    );

                    await queryInterface.dropTable('roles', { transaction });

                    await queryInterface.removeColumn(
                        'funders',
                        'codeTypeId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'funders',
                        'typeId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'funders',
                        'name',
                        { transaction }
                    );

                    await queryInterface.dropTable('funders', { transaction });

                    await queryInterface.removeColumn(
                        'dataconstraints',
                        'active',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'dataconstraints',
                        'name',
                        { transaction }
                    );

                    await queryInterface.dropTable('dataconstraints', { transaction });

                    await queryInterface.removeColumn(
                        'cancellationtypes',
                        'name',
                        { transaction }
                    );

                    await queryInterface.dropTable('cancellationtypes', { transaction });

                    await queryInterface.removeColumn(
                        'groupings',
                        'active',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'groupings',
                        'max',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'groupings',
                        'min',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'groupings',
                        'name',
                        { transaction }
                    );

                    await queryInterface.dropTable('groupings', { transaction });

                    await queryInterface.removeColumn(
                        'resources',
                        'reusable',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'resources',
                        'name',
                        { transaction }
                    );

                    await queryInterface.dropTable('resources', { transaction });

                    await queryInterface.removeColumn(
                        'locationstypes',
                        'name',
                        { transaction }
                    );

                    await queryInterface.dropTable('locationstypes', { transaction });

                    await queryInterface.removeColumn(
                        'daysofweek',
                        'name',
                        { transaction }
                    );

                    await queryInterface.dropTable('daysofweek', { transaction });

                    await queryInterface.removeColumn(
                        'codetype',
                        'name',
                        { transaction }
                    );

                    await queryInterface.dropTable('codetype', { transaction });

                    await queryInterface.removeColumn(
                        'funderstype',
                        'name',
                        { transaction }
                    );

                    await queryInterface.dropTable('funderstype', { transaction });

                    await queryInterface.removeColumn(
                        'companies',
                        'industryId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'companies',
                        'name',
                        { transaction }
                    );

                    await queryInterface.dropTable('companies', { transaction });

                    await queryInterface.removeColumn(
                        'industries',
                        'name',
                        { transaction }
                    );

                    await queryInterface.dropTable('industries', { transaction });

                    await queryInterface.removeColumn(
                        'users',
                        'provider',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'passwordResetTokenExpiresAt',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'passwordResetToken',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'emailVerificationTokenExpiresAt',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'emailVerificationToken',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'emailVerified',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'password',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'disabled',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'role',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'email',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'phoneNumber',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'lastName',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'firstName',
                        { transaction }
                    );

                    await queryInterface.dropTable('users', { transaction });

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
