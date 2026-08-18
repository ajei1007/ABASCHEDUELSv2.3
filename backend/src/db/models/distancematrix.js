const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  const distancematrix = sequelize.define(
    'distancematrix',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      address1: {
        type: DataTypes.TEXT,
      },

      address2: {
        type: DataTypes.TEXT,
      },

      distance: {
        type: DataTypes.INTEGER,
      },

      duration: {
        type: DataTypes.INTEGER,
      },
      duration_early: {
        type: DataTypes.INTEGER,
      },
      duration_late: {
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

  distancematrix.associate = (db) => {
    db.distancematrix.belongsTo(db.placematrix, {
      as: 'addy1',
      constraints: false,
    });

    db.distancematrix.belongsTo(db.placematrix, {
      as: 'addy2',
      constraints: false,
    });

    db.distancematrix.belongsTo(db.users, {
      as: 'user1',
      constraints: false,
    });

    db.distancematrix.belongsTo(db.users, {
      as: 'user2',
      constraints: false,
    });

    db.distancematrix.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.distancematrix.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return distancematrix;
};
