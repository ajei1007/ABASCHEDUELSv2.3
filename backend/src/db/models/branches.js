const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  const branches = sequelize.define(
    'branches',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      name: {
        type: DataTypes.TEXT,
      },
      timezone: {
        type: DataTypes.TEXT,
      },

      replyToEmail: {
        type: DataTypes.TEXT,
      },
      
      schedulerLocked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      drivetime: {
        type: DataTypes.INTEGER,
      },

      importHash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },

      inactive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    },
  );

  branches.associate = (db) => {
    db.branches.belongsTo(db.branchtype, {
      as: 'branchType',
      constraints: false,
    });

    db.branches.belongsTo(db.branches, {
      as: 'parent',
      constraints: false,
    });

    db.branches.belongsTo(db.users, {
      as: 'user',
      constraints: false,
    });

    db.branches.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.branches.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return branches;
};
