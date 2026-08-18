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
                      'createEvent',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'editEvent',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'deleteEvent',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'createUser',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'editUser',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'deleteUser',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'createCancelation',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'deleteCancelation',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'createAvailability',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'editAvailability',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'deleteAvailability',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'viewReport',
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
                        'viewReport',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'deleteAvailability',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'editAvailability',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'createAvailability',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'deleteCancelation',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'createCancelation',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'deleteUser',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'editUser',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'createUser',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'deleteEvent',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'editEvent',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'createEvent',
                        { transaction }
                    );

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
