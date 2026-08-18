const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const nogapsconstraint = sequelize.define(
    'nogapsconstraint',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

disabled: {
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

  nogapsconstraint.associate = (db) => {

    db.nogapsconstraint.belongsToMany(db.roles, {
      as: 'roles',
      constraints: false,
      through: 'nogapsconstraintRolesRoles',
    });

    db.nogapsconstraint.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.nogapsconstraint.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return nogapsconstraint;
};

