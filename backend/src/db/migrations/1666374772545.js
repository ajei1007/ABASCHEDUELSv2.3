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

                    await queryInterface.createTable('branchtype', {
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
                      'branchtype',
                      'name',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'branchtype',
                      'parentId',
                      {
                          type: Sequelize.DataTypes.UUID,

                            references: {
                                model: 'branchtype',
                                key: 'id',
                            },

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'branches',
                      'branchTypeId',
                      {
                          type: Sequelize.DataTypes.UUID,

                            references: {
                                model: 'branchtype',
                                key: 'id',
                            },

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'branches',
                      'parentId',
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
                      'roles',
                      'branchTypeId',
                      {
                          type: Sequelize.DataTypes.UUID,

                            references: {
                                model: 'branchtype',
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
                        'branchTypeId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'branches',
                        'parentId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'branches',
                        'branchTypeId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'branchtype',
                        'parentId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'branchtype',
                        'name',
                        { transaction }
                    );

                    await queryInterface.dropTable('branchtype', { transaction });

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
