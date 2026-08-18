const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const mobiletokens = sequelize.define(
    'mobiletokens',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

token: {
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

  mobiletokens.associate = (db) => {

    db.mobiletokens.belongsToMany(db.users, {
      as: 'users',
      constraints: false,
      through: 'usersMobiletokensMobiletokens',
    });

    db.mobiletokens.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.mobiletokens.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return mobiletokens;
};

