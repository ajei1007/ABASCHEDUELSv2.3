module.exports = function (sequelize, DataTypes) {
    const rolesIntegrationData = sequelize.define(
      'rolesIntegrationData',
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
        idOther: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        dataInOtherSoftware: {
          type: DataTypes.JSON,
          allowNull: true,
        },
      },
      {
        timestamps: true,
        paranoid: true,
        freezeTableName: true,
      },
    );
  
    rolesIntegrationData.associate = (db) => {
      db.rolesIntegrationData.belongsTo(db.roles, {
        as: 'role',
        foreignKey: {
          allowNull: true, // This allows the foreign key to be nullable
        },
      });

      db.rolesIntegrationData.belongsTo(db.companies, {
        as: 'company',
      });
    };
  
    return rolesIntegrationData;
  };