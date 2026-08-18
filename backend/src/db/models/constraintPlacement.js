
module.exports = function (sequelize, DataTypes) {
  const constraintPlacement = sequelize.define(
    'constraintPlacement',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
      },
      branchId: {
        type: DataTypes.UUID,
      },
      constraintId: {
        type: DataTypes.UUID,
      },
      rank: {
        type: DataTypes.INTEGER,
      },
      importance: {
        type: DataTypes.ENUM,
        values: ['high', 'low', 'mandatory', 'disabled'],
      },
      flagging: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      solutionGenerator: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      optimizer: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    },
  );

  constraintPlacement.associate = (db) => {
    db.constraintPlacement.belongsTo(db.users, {
      as: 'user',
    });
    db.constraintPlacement.belongsTo(db.newconstraintgenerator, {
      as: 'constraint',
    });
    db.constraintPlacement.belongsTo(db.branches, {
      as: 'branch',
    });
  };

  return constraintPlacement;
};
