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

                    await queryInterface.createTable('newconstraintgenerator', {
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
                      'newconstraintgenerator',
                      'constraintType',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['matching','unmatching','usertouser','usertosession','time','grouping','drive','distance'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'newconstraintgenerator',
                      'description',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'newconstraintgenerator',
                      'antecedentType',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['specific','type'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'newconstraintgenerator',
                      'consequenceType',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['specific','type'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'newconstraintgenerator',
                      'antecedentTypeDaySelection',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['alldays','notalldays'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'newconstraintgenerator',
                      'consequenceTypeDaySelection',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['alldays','notalldays'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'newconstraintgenerator',
                      'min',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'newconstraintgenerator',
                      'max',
                      {
                          type: Sequelize.DataTypes.INTEGER,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'newconstraintgenerator',
                      'frequency',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['day','week','session','month','year','custom'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'newconstraintgenerator',
                      'units',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['seconds','minutes','hours','days','weeks','months','years','unit'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'newconstraintgenerator',
                      'alias',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'newconstraintgenerator',
                      'consequenceTypeEachOrAll',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['each','all'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'newconstraintgenerator',
                      'antecedentTypeEachOrAll',
                      {
                          type: Sequelize.DataTypes.ENUM,

                            values: ['each','all'],

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'newconstraintgenerator',
                      'start',
                      {
                          type: Sequelize.DataTypes.DATEONLY,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'newconstraintgenerator',
                      'end',
                      {
                          type: Sequelize.DataTypes.DATEONLY,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'newconstraintgenerator',
                      'disabled',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'newconstraintgenerator',
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
                        'newconstraintgenerator',
                        'noLimit',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'newconstraintgenerator',
                        'disabled',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'newconstraintgenerator',
                        'end',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'newconstraintgenerator',
                        'start',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'newconstraintgenerator',
                        'antecedentTypeEachOrAll',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'newconstraintgenerator',
                        'consequenceTypeEachOrAll',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'newconstraintgenerator',
                        'alias',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'newconstraintgenerator',
                        'units',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'newconstraintgenerator',
                        'frequency',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'newconstraintgenerator',
                        'max',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'newconstraintgenerator',
                        'min',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'newconstraintgenerator',
                        'consequenceTypeDaySelection',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'newconstraintgenerator',
                        'antecedentTypeDaySelection',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'newconstraintgenerator',
                        'consequenceType',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'newconstraintgenerator',
                        'antecedentType',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'newconstraintgenerator',
                        'description',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'newconstraintgenerator',
                        'constraintType',
                        { transaction }
                    );

                    await queryInterface.dropTable('newconstraintgenerator', { transaction });

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
