const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const scheduler = sequelize.define(
    'scheduler',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

field: {
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

  scheduler.associate = (db) => {

    db.scheduler.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.scheduler.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return scheduler;
};

