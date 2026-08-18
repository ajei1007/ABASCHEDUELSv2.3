const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const clock = sequelize.define(
    'clock',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

clockIn: {
        type: DataTypes.DATE,

      },

clockOut: {
        type: DataTypes.DATE,

      },

notes: {
        type: DataTypes.TEXT,

      },

on: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

totalTime: {
        type: DataTypes.INTEGER,

      },

long: {
        type: DataTypes.DECIMAL,

      },

lat: {
        type: DataTypes.DECIMAL,

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

  clock.associate = (db) => {

    db.clock.belongsTo(db.users, {
      as: 'user',
      constraints: false,
    });

    db.clock.belongsTo(db.events, {
      as: 'event',
      constraints: false,
    });

    db.clock.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.clock.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return clock;
};

