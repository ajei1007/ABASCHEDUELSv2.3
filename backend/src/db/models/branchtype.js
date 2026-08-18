const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  const branchtype = sequelize.define(
    'branchtype',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      name: {
        type: DataTypes.TEXT,
      },

      bol: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      physical: {
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

  branchtype.associate = (db) => {
    db.branchtype.belongsTo(db.branchtype, {
      as: 'parent',
      constraints: false,
    });

    db.branchtype.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.branchtype.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return branchtype;
};
