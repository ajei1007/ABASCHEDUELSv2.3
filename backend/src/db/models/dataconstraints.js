const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const dataconstraints = sequelize.define(
    'dataconstraints',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

name: {
        type: DataTypes.TEXT,

      },

active: {
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

  dataconstraints.associate = (db) => {

    db.dataconstraints.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.dataconstraints.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return dataconstraints;
};

