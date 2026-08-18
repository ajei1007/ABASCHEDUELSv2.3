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
                      'roles',
                      'createBranch',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'editBranch',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'deleteBranch',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'viewBranch',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'createConstraint',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'editConstraint',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'deleteConstraint',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'viewConstraint',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'createSubgroup',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'editSubgroup',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'deleteSubgroup',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'viewSubgroup',
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
                        'roles',
                        'viewSubgroup',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'deleteSubgroup',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'editSubgroup',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'createSubgroup',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'viewConstraint',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'deleteConstraint',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'editConstraint',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'createConstraint',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'viewBranch',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'deleteBranch',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'editBranch',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'createBranch',
                        { transaction }
                    );

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
