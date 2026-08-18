const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const placematrix = sequelize.define(
    'placematrix',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

address: {
        type: DataTypes.TEXT,

      },

long: {
        type: DataTypes.DECIMAL,

      },

lat: {
        type: DataTypes.DECIMAL,

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

  placematrix.associate = (db) => {

    db.placematrix.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.placematrix.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return placematrix;
};

