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

                    await queryInterface.createTable('data1', {
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
                      'data1',
                      'personId',
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
                      'activityId',
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
                      's1',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's2',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's3',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's4',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's5',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's6',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's7',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's8',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's9',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's11',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's12',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's13',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's14',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's15',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's16',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's17',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's18',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's19',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's20',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's21',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's22',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's23',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's24',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's25',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's26',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's27',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's28',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's29',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's30',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's31',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's32',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's33',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's34',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's35',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's36',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's37',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's38',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's39',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's40',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's41',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's42',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's43',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's44',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's45',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's46',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's47',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's48',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      's10',
                      {
                          type: Sequelize.DataTypes.BOOLEAN,

                            defaultValue: false,
                            allowNull: false,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      'slots',
                      {
                          type: Sequelize.DataTypes.TEXT,

                      },
                      { transaction }
                    );

                    await queryInterface.addColumn(
                      'data1',
                      'date',
                      {
                          type: Sequelize.DataTypes.DATEONLY,

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
                        'date',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        'slots',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's10',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's48',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's47',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's46',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's45',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's44',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's43',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's42',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's41',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's40',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's39',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's38',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's37',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's36',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's35',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's34',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's33',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's32',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's31',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's30',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's29',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's28',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's27',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's26',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's25',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's24',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's23',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's22',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's21',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's20',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's19',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's18',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's17',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's16',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's15',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's14',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's13',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's12',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's11',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's9',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's8',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's7',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's6',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's5',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's4',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's3',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's2',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        's1',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        'activityId',
                        { transaction }
                    );

                    await queryInterface.removeColumn(
                        'data1',
                        'personId',
                        { transaction }
                    );

                    await queryInterface.dropTable('data1', { transaction });

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
