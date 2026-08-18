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

                    await queryInterface.removeColumn(
                        'roles',
                        'availability',
                        { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'availabilities',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['E','V','NA'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'branches',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['E','V','NA'],

                      },
                      { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'cancelations',
                        { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'cancellations',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['E','V','NA'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'cancellationtypes',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['E','V','NA'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'capacityconstraints',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['E','V','NA'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'clock',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['E','V','NA'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'distanceconstraints',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['E','V','NA'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'eventpair',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['E','V','NA'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'groupings',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['E','V','NA'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'matches',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['E','V','NA'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'nogapsconstraint',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['E','V','NA'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'priorities',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['E','V','NA'],

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
                        'priorities',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'nogapsconstraint',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'matches',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'groupings',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'eventpair',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'distanceconstraints',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'clock',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'capacityconstraints',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'cancellationtypes',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'cancellations',
                        { transaction }
                    );

                    await queryInterface.addColumn(
                      'roles',
                      'cancelations',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['E','V','NA'],

                      },
                      { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'branches',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'roles',
                        'availabilities',
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

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
