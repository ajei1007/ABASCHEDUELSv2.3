const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const matches = sequelize.define(
    'matches',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

compatible: {
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

  matches.associate = (db) => {

    db.matches.belongsTo(db.users, {
      as: 'user1',
      constraints: false,
    });

    db.matches.belongsTo(db.users, {
      as: 'user2',
      constraints: false,
    });

    db.matches.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.matches.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return matches;
};

