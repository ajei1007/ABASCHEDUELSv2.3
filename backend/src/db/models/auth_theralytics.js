module.exports = function (sequelize, DataTypes) {
  const authIntegrations = sequelize.define(
    'authIntegrations',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      credentials: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      integratingSoftware: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: ""
      },
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    },
  );

  authIntegrations.associate = (db) => {
    db.authIntegrations.belongsTo(db.users, {
      as: 'user',
      constraints: false,
    });

    db.authIntegrations.belongsTo(db.companies, {
      as: 'company',
      constraints: false,
    });
    db.authIntegrations.belongsTo(db.users, {
      as: 'createdBy',
    });
    db.authIntegrations.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return authIntegrations;
};