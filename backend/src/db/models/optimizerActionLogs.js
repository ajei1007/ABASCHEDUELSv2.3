module.exports = function (sequelize, DataTypes) {
  const optimizerActionLogs = sequelize.define(
    'optimizerActionLogs',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      startTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      endTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM,
        values: ['success', 'failed'],
        allowNull: true,
      },
      requestPayload: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      responsePayload: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      triggerBy: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    },
  );

  optimizerActionLogs.associate = function (db) {
    db.optimizerActionLogs.belongsTo(db.users, {
      as: 'triggerByUser',
      foreignKey: 'triggerBy',
      constraints: false,
    });
  };

  return optimizerActionLogs;
};
