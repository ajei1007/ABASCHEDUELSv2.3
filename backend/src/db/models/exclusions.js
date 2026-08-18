const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const exclusions = sequelize.define(
    'exclusions',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

datetime: {
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

  exclusions.associate = (db) => {

    db.exclusions.belongsTo(db.events, {
      as: 'event',
      constraints: false,
    });

    db.exclusions.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.exclusions.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return exclusions;
};

