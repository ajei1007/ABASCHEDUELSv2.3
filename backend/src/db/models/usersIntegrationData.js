module.exports = function (sequelize, DataTypes) {
  const usersIntegrationData = sequelize.define(
    'usersIntegrationData',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      integratingSoftware: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      tableName: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      otherTableName: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      idOther: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      dataInOtherSoftware: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      resourceType: {
        type: DataTypes.ENUM,
        defaultValue: 'unspecified',
        values: ['employee', 'client', 'funder', 'activity', 'location', 'unspecified'],
      },
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    },
  );

  usersIntegrationData.associate = (db) => {
    db.usersIntegrationData.belongsTo(db.users, {
      as: 'user',
      constraints: false,
      foreignKey: {
        allowNull: true, // This allows the foreign key to be nullable
      },
    });

    db.usersIntegrationData.belongsTo(db.companies, {
      as: 'company',
      constraints: false,
    });
  };

  return usersIntegrationData;
};