const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const usergroups = sequelize.define(
    'usergroups',
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

  usergroups.associate = (db) => {

    db.usergroups.belongsToMany(db.users, {
      as: 'users',
      constraints: false,
      through: 'usergroupsUsersUsers',
    });

    db.usergroups.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.usergroups.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return usergroups;
};

