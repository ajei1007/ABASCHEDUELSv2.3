module.exports = function (sequelize, DataTypes) {
  const integrationImportSyncAudit = sequelize.define(
    'integrationImportSyncAudit',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      action: {
        type: DataTypes.ENUM,
        defaultValue: 'unspecified',
        values: ['import', 'sync', 'unspecified'],
      },
      resourceType: {
        type: DataTypes.ENUM,
        defaultValue: 'unspecified',
        values: ['employee', 'client', 'funder', 'activity', 'location', 'unspecified'],
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

  integrationImportSyncAudit.associate = (db) => {
    db.integrationImportSyncAudit.belongsTo(db.companies, {
      as: 'company',
      constraints: false,
    });
  };

  return integrationImportSyncAudit;
};