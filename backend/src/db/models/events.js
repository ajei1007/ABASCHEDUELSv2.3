const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  const events = sequelize.define(
    'events',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      start: {
        type: DataTypes.DATE,
      },

      end: {
        type: DataTypes.DATE,
      },
      startActual: {
        type: DataTypes.DATE,
      },
      endActual: {
        type: DataTypes.DATE,
      },
      startDatetime: {
        type: DataTypes.DATE,
      },
      endDatetime: {
        type: DataTypes.DATE,
      },
      userIds: {
        type: DataTypes.JSON,
      },
      integratedAt: {
        type: DataTypes.DATE,
      },

      address: {
        type: DataTypes.TEXT,
      },
      eventIdCustom: {
        type: DataTypes.TEXT,
      },

      longitude: {
        type: DataTypes.DECIMAL(10, 7),
      },

      latitude: {
        type: DataTypes.DECIMAL(10, 7),
      },

      startRecur: {
        type: DataTypes.DATEONLY,

        get: function () {
          return this.getDataValue('startRecur')
            ? moment.utc(this.getDataValue('startRecur')).format('YYYY-MM-DD')
            : null;
        },
      },

      endRecur: {
        type: DataTypes.DATEONLY,

        get: function () {
          return this.getDataValue('endRecur')
            ? moment.utc(this.getDataValue('endRecur')).format('YYYY-MM-DD')
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

      distance: {
        type: DataTypes.INTEGER,
      },
      driveDuration: {
        type: DataTypes.INTEGER,
      },

      background: {
        type: DataTypes.TEXT,
      },

      border: {
        type: DataTypes.TEXT,
      },

      notes: {
        type: DataTypes.TEXT,
      },
      secondary: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      allDay: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },
      converted: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      visible: {
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

      bysetpos: {
        type: DataTypes.ENUM,
        values: ['-1', '1', '2', '3', '4'],
      },

      sandboxMode: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      importHash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },

      isCancelled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      supervisionId: {
        type: DataTypes.UUID,
      },
      timezone: {
        type: DataTypes.TEXT,
      },
      eventGroupId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    },
  );

  events.associate = (db) => {
    db.events.belongsToMany(db.users, {
      as: 'users',
      constraints: false,
      through: 'eventsUsersUsers',
    });

    // db.events.belongsToMany(db.users, {
    //   as: 'users2',
    //   constraints: false,
    //   through: 'eventsUsersUsers',
    // });

    // db.events.belongsToMany(db.users, {
    //   as: 'users3',
    //   constraints: false,
    //   through: 'eventsUsersUsers',
    // });

    db.events.belongsToMany(db.cancellations, {
      as: 'cancellations',
      constraints: false,
      through: 'eventsCancellationsCancellations',
    });

    db.events.belongsToMany(db.exclusions, {
      as: 'exclusions',
      constraints: false,
      through: 'eventsExclusionsExclusions',
    });

    db.events.belongsToMany(db.users, {
      as: 'usersVirtual',
      constraints: false,
      through: 'eventsUsersVirtualUsers',
    });

    db.events.belongsTo(db.events, {
      as: 'eventConnect',
      constraints: false,
    });

    db.events.hasOne(db.statusevents, {
      as: 'status',
      constraints: false,
      foreignKey: 'eventId',
    });

    db.events.belongsTo(db.users, {
      as: 'activity0',
      constraints: false,
    });

    db.events.belongsTo(db.users, {
      as: 'location0',
      constraints: false,
    });

    db.events.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.events.belongsTo(db.users, {
      as: 'updatedBy',
    });

    db.events.belongsTo(db.users, {
      as: 'cancelledByUser',
      constraints: false,
    });

    db.events.belongsTo(db.cancellationtypes, {
      as: 'cancellationReason',
      constraints: false,
    });
    db.events.belongsTo(db.events, {
      as: 'supervision',
      constraints: false,
    });
    db.events.hasMany(db.eventsIntegrationData, {
      as: 'integrationData',
      foreignKey: 'eventId',
      constraints: false,
    });
  };

  return events;
};
