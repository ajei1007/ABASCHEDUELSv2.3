module.exports = function (sequelize, DataTypes) {
  const settingscompany = sequelize.define(
    'settingscompany',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      cancellationdeadline: {
        type: DataTypes.INTEGER,
      },
      timeoffdeadline: {
        type: DataTypes.INTEGER,
      },
      companyId: {
        type: DataTypes.STRING,
      },
      staffTrackerBranchTypeId: {
        type: DataTypes.STRING,
      },
      importHash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
      schedulerLocked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      integrationEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      chatEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      integrations: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      customLabels: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      isAlias: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      aliasFormatType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    },
  );

  settingscompany.associate = (db) => {
    db.settingscompany.belongsTo(db.users, {
      as: 'createdBy',
    });
    db.settingscompany.belongsTo(db.users, {
      as: 'updatedBy',
    });
    db.settingscompany.belongsTo(db.companies, {
      as: 'company',
      constraints: false,
    });
    db.settingscompany.belongsToMany(db.branches, {
      as: 'staffTrackerBranches',
      constraints: false,
      through: 'settingsStaffTrackerBranches',
    });
    db.settingscompany.belongsToMany(db.users, {
      as: 'staffTrackerActivities',
      constraints: false,
      through: 'settingsStaffTrackerActivities',
    });
    db.settingscompany.belongsToMany(db.roles, {
      as: 'staffTrackerRoles',
      constraints: false,
      through: 'settingsStaffTrackerRoles',
    });
    db.settingscompany.belongsTo(db.branchtype, {
      as: 'staffTrackerBranchType',
      constraints: false,
    });
  };

  return settingscompany;
};
