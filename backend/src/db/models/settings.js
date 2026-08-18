module.exports = function (sequelize, DataTypes) {
  const settings = sequelize.define(
    'settings',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      sunday: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      monday: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      tuesday: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      wednesday: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      thursday: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      friday: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      saturday: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      weekends: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      blockScheduling: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      titleFormatYear: {
        type: DataTypes.ENUM,

        values: ['numeric', '2-digit'],
      },

      titleFormatMonth: {
        type: DataTypes.ENUM,

        values: ['long', 'short', 'narrow', 'numeric', '2-digit'],
      },

      titleFormatDay: {
        type: DataTypes.ENUM,

        values: ['long', 'short', 'narrow'],
      },

      scrollTime: {
        type: DataTypes.DATE,
      },

      initialView: {
        type: DataTypes.ENUM,

        values: [
          'Day TimeLine',

          'Week TimeLine',

          'Day TimeGrid',

          'Week TimeGrid',
        ],
      },

      timezone: {
        type: DataTypes.ENUM,
        values: ['America/Pangnirtung'],
      },

      dateformats: {
        type: DataTypes.ENUM,

        values: [
          'DD-MM-YYYY',

          'DD/MM/YYYY',

          'MM-DD-YYYY',

          'MM/DD/YYYY',

          'YYYY-MM-DD',

          'YYYY/MM/DD',
        ],
      },

      hour24: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      driveTime: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      blocks: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      orange: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      recurring: {
        type: DataTypes.ENUM,

        values: [
          'Replace Only This Event',

          'Replace Past Recurring Events',

          'Replace Future Recurring Events',

          'Replace All These Recurring Events',
        ],
      },

      noGaps: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      driveTimeQuantity: {
        type: DataTypes.INTEGER,
      },

      driveTimeUnit: {
        type: DataTypes.ENUM,

        values: ['Minutes', 'Hours'],
      },

      driveDistanceMax: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      driveDistanceMaxQuantity: {
        type: DataTypes.INTEGER,
      },

      driveDistanceMaxUnit: {
        type: DataTypes.ENUM,

        values: ['mi', 'km'],
      },

      timeconstraints: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      timeConstraintUpperBuffer: {
        type: DataTypes.INTEGER,
      },

      timeConstraintLowerBuffer: {
        type: DataTypes.INTEGER,
      },

      rolesFilterLabels: {
        type: DataTypes.TEXT,
      },

      statsFilterLabels: {
        type: DataTypes.TEXT,
      },

      teamSeparation: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      isolateCanceled: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },
      locationQuantity: {
        type: DataTypes.INTEGER,
      },
      subgroupsFilterLabels: {
        type: DataTypes.TEXT,
      },
      resourceFilterLabels: {
        type: DataTypes.TEXT,
      },
      hideCancelations: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      lavender: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      absoluteTotal: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      timeInterval: {
        type: DataTypes.INTEGER,
      },
      eventReminderNotifications: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      showMobileCancellations: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      backgroundColorRole: {
        type: DataTypes.TEXT,
      },
      borderColorRole: {
        type: DataTypes.TEXT,
      },
      businessStartTime: {
        type: DataTypes.DATE,
      },
      businessEndTime: {
        type: DataTypes.DATE,
      },
      overbooking: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      emptyAvailability: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      notAvailableBusy: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      differentBranch: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      importHash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    },
  );

  settings.associate = (db) => {
    db.settings.belongsToMany(db.roles, {
      as: 'rolesDefault',
      constraints: false,
      through: 'settingsRolesDefaultRoles',
    });

    db.settings.belongsToMany(db.totaltypes, {
      as: 'statsTotalLabels',
      constraints: false,
      through: 'settingsStatsTotalLabelsTotaltypes',
    });

    db.settings.belongsTo(db.users, {
      as: 'user',
      constraints: false,
    });

    db.settings.belongsTo(db.users, {
      as: 'defaultActivity',
      constraints: false,
    });

    db.settings.belongsTo(db.roles, {
      as: 'defaultLocation',
      constraints: false,
    });

    db.settings.belongsTo(db.users, {
      as: 'defaultLocation2',
      constraints: false,
    });

    db.settings.belongsTo(db.totaltypes, {
      as: 'totalCustom',
      constraints: false,
    });

    db.settings.belongsTo(db.branches, {
      as: 'branchDefault',
      constraints: false,
    });

    db.settings.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.settings.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return settings;
};
