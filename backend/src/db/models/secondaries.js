const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const secondaries = sequelize.define(
    'secondaries',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

optional: {
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

  secondaries.associate = (db) => {

    db.secondaries.belongsTo(db.users, {
      as: 'primary',
      constraints: false,
    });

    db.secondaries.belongsTo(db.users, {
      as: 'secondary',
      constraints: false,
    });

    db.secondaries.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.secondaries.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return secondaries;
};

