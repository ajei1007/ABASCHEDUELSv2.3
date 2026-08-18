const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const rescheduled = sequelize.define(
    'rescheduled',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

startDatetime: {
        type: DataTypes.DATE,

      },

rescheduled: {
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

  rescheduled.associate = (db) => {

    db.rescheduled.belongsTo(db.events, {
      as: 'event',
      constraints: false,
    });

    db.rescheduled.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.rescheduled.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return rescheduled;
};

