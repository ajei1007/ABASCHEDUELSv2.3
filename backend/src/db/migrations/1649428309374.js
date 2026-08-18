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
                      'settings',
                      'sunday',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'settings',
                      'monday',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'settings',
                      'tuesday',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'settings',
                      'wednesday',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'settings',
                      'thursday',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'settings',
                      'friday',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'settings',
                      'saturday',
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
                        'settings',
                        'saturday',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'settings',
                        'friday',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'settings',
                        'thursday',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'settings',
                        'wednesday',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'settings',
                        'tuesday',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'settings',
                        'monday',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'settings',
                        'sunday',
                        { transaction }
                    );

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
