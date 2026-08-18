const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const drivetimelocation = sequelize.define(
    'drivetimelocation',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

time: {
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

  drivetimelocation.associate = (db) => {

    db.drivetimelocation.belongsTo(db.users, {
      as: 'location1',
      constraints: false,
    });

    db.drivetimelocation.belongsTo(db.users, {
      as: 'location2',
      constraints: false,
    });

    db.drivetimelocation.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.drivetimelocation.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return drivetimelocation;
};

