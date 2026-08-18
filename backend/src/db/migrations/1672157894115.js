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
                      'events',
                      'M',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'events',
                      'T',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'events',
                      'W',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'events',
                      'R',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'events',
                      'F',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'events',
                      'S',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'events',
                      'U',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'availabilities',
                      'M',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'availabilities',
                      'T',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'availabilities',
                      'W',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'availabilities',
                      'R',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'availabilities',
                      'F',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'availabilities',
                      'S',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'availabilities',
                      'U',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      'locationId',
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
                      'data1',
                      'eff',
                      {
                          type: Sequelize.DataTypes.INTEGER,

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
                        'data1',
                        'eff',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        'locationId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'availabilities',
                        'U',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'availabilities',
                        'S',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'availabilities',
                        'F',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'availabilities',
                        'R',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'availabilities',
                        'W',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'availabilities',
                        'T',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'availabilities',
                        'M',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'events',
                        'U',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'events',
                        'S',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'events',
                        'F',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'events',
                        'R',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'events',
                        'W',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'events',
                        'T',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'events',
                        'M',
                        { transaction }
                    );

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
