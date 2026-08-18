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

                    await queryInterface.createTable('constraintgenerator', {
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
                      'constraintgenerator',
                      'constraintType',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'constraintgenerator',
                      'description',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'constraintgenerator',
                      'alias',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'constraintgenerator',
                      'antecedentType',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'constraintgenerator',
                      'antecedentTypeUsers',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'constraintgenerator',
                      'antecedentTypeRoles',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'constraintgenerator',
                      'antecedentTypeSubgroups',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'constraintgenerator',
                      'antecedentTypeDaySelection',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'constraintgenerator',
                      'antecedentTypeWeekDays',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'constraintgenerator',
                      'consequenceType',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'constraintgenerator',
                      'consequenceTypeUsers',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'constraintgenerator',
                      'consequenceTypeRoles',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'constraintgenerator',
                      'consequenceTypeSubgroups',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'constraintgenerator',
                      'consequenceTypeDaySelection',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'constraintgenerator',
                      'consequenceTypeWeekDays',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'constraintgenerator',
                      'min',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'constraintgenerator',
                      'max',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'constraintgenerator',
                      'frequency',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'constraintgenerator',
                      'start',
                      {
                          type: Sequelize.DataTypes.DATEONLY,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'constraintgenerator',
                      'end',
                      {
                          type: Sequelize.DataTypes.DATEONLY,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'constraintgenerator',
                      'disabled',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'constraintgenerator',
                      'consequenceTypeEachOrAll',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'constraintgenerator',
                      'antecedentTypeEachOrAll',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'groupings',
                      'noTag',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'constraintgenerator',
                      'noLimit',
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
                        'constraintgenerator',
                        'noLimit',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'groupings',
                        'noTag',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'constraintgenerator',
                        'antecedentTypeEachOrAll',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'constraintgenerator',
                        'consequenceTypeEachOrAll',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'constraintgenerator',
                        'disabled',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'constraintgenerator',
                        'end',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'constraintgenerator',
                        'start',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'constraintgenerator',
                        'frequency',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'constraintgenerator',
                        'max',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'constraintgenerator',
                        'min',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'constraintgenerator',
                        'consequenceTypeWeekDays',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'constraintgenerator',
                        'consequenceTypeDaySelection',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'constraintgenerator',
                        'consequenceTypeSubgroups',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'constraintgenerator',
                        'consequenceTypeRoles',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'constraintgenerator',
                        'consequenceTypeUsers',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'constraintgenerator',
                        'consequenceType',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'constraintgenerator',
                        'antecedentTypeWeekDays',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'constraintgenerator',
                        'antecedentTypeDaySelection',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'constraintgenerator',
                        'antecedentTypeSubgroups',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'constraintgenerator',
                        'antecedentTypeRoles',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'constraintgenerator',
                        'antecedentTypeUsers',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'constraintgenerator',
                        'antecedentType',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'constraintgenerator',
                        'alias',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'constraintgenerator',
                        'description',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'constraintgenerator',
                        'constraintType',
                        { transaction }
                    );

                    await queryInterface.dropTable('constraintgenerator', { transaction });

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
