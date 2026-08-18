const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const rolegroups = sequelize.define(
    'rolegroups',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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

  rolegroups.associate = (db) => {

    db.rolegroups.belongsToMany(db.roles, {
      as: 'roles',
      constraints: false,
      through: 'rolegroupsRolesRoles',
    });

    db.rolegroups.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.rolegroups.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return rolegroups;
};

