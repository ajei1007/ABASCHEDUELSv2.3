const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const groupings = sequelize.define(
    'groupings',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

name: {
        type: DataTypes.TEXT,

      },

min: {
        type: DataTypes.INTEGER,

      },

max: {
        type: DataTypes.INTEGER,

      },

active: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

noTag: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

      importHash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
      required: {
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

  groupings.associate = (db) => {

    db.groupings.belongsToMany(db.roles, {
      as: 'roles1',
      constraints: false,
      through: 'groupingsRoles1Roles',
    });

    db.groupings.belongsToMany(db.roles, {
      as: 'roles2',
      constraints: false,
      through: 'groupingsRoles2Roles',
    });

    db.groupings.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.groupings.belongsTo(db.users, {
      as: 'updatedBy',
    });

    db.groupings.hasMany(db.subgroups, {
      as: 'subgroups',
      constraints: false,
      foreignKey: 'groupId',
    });
  };

  return groupings;
};

