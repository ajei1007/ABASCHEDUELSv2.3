const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const funders = sequelize.define(
    'funders',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

name: {
        type: DataTypes.TEXT,

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

  funders.associate = (db) => {

    db.funders.belongsTo(db.funderstype, {
      as: 'type',
      constraints: false,
    });

    db.funders.belongsTo(db.codetype, {
      as: 'codeType',
      constraints: false,
    });

    db.funders.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.funders.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return funders;
};

