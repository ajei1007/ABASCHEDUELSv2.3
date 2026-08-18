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

                    await queryInterface.createTable('genderconstraints', {
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
                      'genderconstraints',
                      'gender1',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['M','F'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'genderconstraints',
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
                      'genderconstraints',
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
                      'genderconstraints',
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
                      'genderconstraints',
                      'gender2',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['M','F'],

                      },
                      { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'op1',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'op2',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'op3',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'op4',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'capacityconstraints',
                        'op5',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'typeId',
                        { transaction }
                    );

                    await queryInterface.addColumn(
                      'events',
                      'longitude',
                      {
                          type: Sequelize.DataTypes.DECIMAL,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'events',
                      'latitude',
                      {
                          type: Sequelize.DataTypes.DECIMAL,

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
                        'events',
                        'latitude',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'events',
                        'longitude',
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
                      'capacityconstraints',
                      'op5',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: [') AND','AND','AND (','OR (','OR',') OR',')','('],

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
                      'op3',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: [') AND','AND','AND (','OR (','OR',') OR',')','('],

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
                      'op1',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['('],

                      },
                      { transaction }
                    );

                    await queryInterface.removeColumn(
                        'genderconstraints',
                        'gender2',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'genderconstraints',
                        'role2Id',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'genderconstraints',
                        'userId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'genderconstraints',
                        'role1Id',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'genderconstraints',
                        'gender1',
                        { transaction }
                    );

                    await queryInterface.dropTable('genderconstraints', { transaction });

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
