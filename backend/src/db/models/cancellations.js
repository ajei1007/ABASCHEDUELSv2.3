const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  const cancellations = sequelize.define(
    'cancellations',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      date: {
        type: DataTypes.DATEONLY,

        get: function () {
          return this.getDataValue('date')
            ? moment.utc(this.getDataValue('date')).format('YYYY-MM-DD')
            : null;
        },
      },

      rescheduled: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      partialRescheduled: {
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

  cancellations.associate = (db) => {
    db.cancellations.belongsTo(db.events, {
      as: 'event',
      constraints: false,
    });

    db.cancellations.belongsTo(db.cancellationtypes, {
      as: 'reason',
      constraints: false,
    });

    db.cancellations.belongsTo(db.users, {
      as: 'user',
      constraints: false,
    });

    db.cancellations.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.cancellations.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return cancellations;
};
