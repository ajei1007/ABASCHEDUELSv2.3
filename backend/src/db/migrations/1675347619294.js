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

                    await queryInterface.createTable('optimizer', {
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
                      'optimizer',
                      'slotduration',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'maxtime',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'timeconstraints',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'nogapsequation',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'nogapsequationroleId',
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
                      'constraintdrive',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'constraintteam',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'constraintlunch',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'constraintlunchduration',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'constraintbreak',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'orange',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'blocks',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'breaktime',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'lunchtime',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'isdaily',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'multi',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'workers',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'minsession',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'maxsession',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'teamamount',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'teammin',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'teamtolerance',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'teamtolormin',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'objectiveroleId',
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
                      'objectiveactivityId',
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
                      'optimizer',
                      'percentignore',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'scratchoroptimize',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'startdate',
                      {
                          type: Sequelize.DataTypes.DATEONLY,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'enddate',
                      {
                          type: Sequelize.DataTypes.DATEONLY,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'optimizer',
                      'nogapsroleId',
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
                        'optimizer',
                        'nogapsroleId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'enddate',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'startdate',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'scratchoroptimize',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'percentignore',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'objectiveactivityId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'objectiveroleId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'teamtolormin',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'teamtolerance',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'teammin',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'teamamount',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'maxsession',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'minsession',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'workers',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'multi',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'isdaily',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'lunchtime',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'breaktime',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'blocks',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'orange',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'constraintbreak',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'constraintlunchduration',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'constraintlunch',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'constraintteam',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'constraintdrive',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'nogapsequationroleId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'nogapsequation',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'timeconstraints',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'maxtime',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'optimizer',
                        'slotduration',
                        { transaction }
                    );

                    await queryInterface.dropTable('optimizer', { transaction });

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
