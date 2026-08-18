const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  const statusevents = sequelize.define(
    'statusevents',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      startdatetime: {
        type: DataTypes.DATE,
      },

      status: {
        type: DataTypes.ENUM,
        values: [
          'Confirmed',
          'Pending Confirmation',
          'Pending Cancelation',
          'Canceled',
        ],
      },

      note: {
        type: DataTypes.TEXT,
      },

      noteadmin: {
        type: DataTypes.TEXT,
      },

      late: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      latetime: {
        type: DataTypes.INTEGER,
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

  statusevents.associate = (db) => {
    db.statusevents.belongsTo(db.events, {
      as: 'event',
      constraints: false,
    });

    db.statusevents.belongsTo(db.users, {
      as: 'user',
      constraints: false,
    });

    db.statusevents.belongsTo(db.cancellationtypes, {
      as: 'reason',
      constraints: false,
    });

    db.statusevents.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.statusevents.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return statusevents;
};
