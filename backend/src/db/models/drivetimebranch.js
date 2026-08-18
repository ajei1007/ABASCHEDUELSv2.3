const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const drivetimebranch = sequelize.define(
    'drivetimebranch',
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

  drivetimebranch.associate = (db) => {

    db.drivetimebranch.belongsTo(db.branches, {
      as: 'branch1',
      constraints: false,
    });

    db.drivetimebranch.belongsTo(db.branches, {
      as: 'branch2',
      constraints: false,
    });

    db.drivetimebranch.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.drivetimebranch.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return drivetimebranch;
};

