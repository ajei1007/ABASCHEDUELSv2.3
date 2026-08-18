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
                      'users',
                      'address2',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'address1RelationshipId',
                      {
                          type: Sequelize.DataTypes.UUID,

                            references: {
                                model: 'relationships',
                                key: 'id',
                            },

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'address2RelationshipId',
                      {
                          type: Sequelize.DataTypes.UUID,

                            references: {
                                model: 'relationships',
                                key: 'id',
                            },

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'users',
                      'address2Default',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'events',
                      'visible',
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
                        'events',
                        'visible',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'address2Default',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'address2RelationshipId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'address1RelationshipId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'users',
                        'address2',
                        { transaction }
                    );

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
