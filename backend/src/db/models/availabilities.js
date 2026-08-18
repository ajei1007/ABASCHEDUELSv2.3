const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');
const getWeekDaysFromBooleanMap = require('../../utils/getWeekDaysFromBooleanMap');

module.exports = function (sequelize, DataTypes) {
  const availabilities = sequelize.define(
    'availabilities',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      startTime: {
        type: DataTypes.DATE,
      },

      endTime: {
        type: DataTypes.DATE,
      },

      available: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },
      oncall: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },
      timezone: {
        type: DataTypes.TEXT,
      },

      startRange: {
        type: DataTypes.DATEONLY,

        get: function () {
          return this.getDataValue('startRange')
            ? moment.utc(this.getDataValue('startRange')).format('YYYY-MM-DD')
            : null;
        },
      },

      endRange: {
        type: DataTypes.DATEONLY,

        get: function () {
          return this.getDataValue('endRange')
            ? moment.utc(this.getDataValue('endRange')).format('YYYY-MM-DD')
            : null;
        },
      },

      frequency: {
        type: DataTypes.ENUM,
        values: ['Weekly', 'Monthly', 'Yearly', 'Daily'],
      },

      interval: {
        type: DataTypes.INTEGER,
      },

      bysetpos: {
        type: DataTypes.ENUM,
        values: ['-1', '1', '2', '3', '4'],
      },

      disabled: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      M: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      T: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      W: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      R: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      F: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      S: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      U: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      // Adding virtual column days to make back comptatible with previous interface
      // No performance issues here, since we are transforming only values from the same record
      days: {
        type: DataTypes.VIRTUAL,
        get() {
          return getWeekDaysFromBooleanMap(this);
        },
      },

      status: {
        type: DataTypes.ENUM,

        values: ['Pending', 'Approved', 'Declined'],
      },

      timeoff: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      paid: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      statusType: {
        type: DataTypes.ENUM,

        values: ['Add', 'Delete', 'Edit'],
      },

      reason: {
        type: DataTypes.ENUM,

        values: ['Vacation', 'Holiday', 'Sick', 'Personal', 'Other'],
      },

      notes: {
        type: DataTypes.TEXT,
      },

      requestedAt: {
        type: DataTypes.DATE,
      },

      decidedAt: {
        type: DataTypes.DATE,
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

  availabilities.associate = (db) => {
    db.availabilities.belongsToMany(db.roles, {
      as: 'roleLocation',
      constraints: false,
      through: 'availabilitiesRoleLocationRoles',
    });

    db.availabilities.belongsToMany(db.users, {
      as: 'location2',
      constraints: false,
      through: 'availabilitiesLocation2Users',
    });

    db.availabilities.belongsTo(db.users, {
      as: 'user',
      constraints: false,
    });

    db.availabilities.belongsTo(db.branches, {
      as: 'branch',
      constraints: false,
    });

    db.availabilities.belongsTo(db.locationstypes, {
      as: 'location',
      constraints: false,
    });

    db.availabilities.belongsTo(db.availabilities, {
      as: 'oldAvailability',
      constraints: false,
    });

    db.availabilities.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.availabilities.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return availabilities;
};
