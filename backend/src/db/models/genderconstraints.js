const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const genderconstraints = sequelize.define(
    'genderconstraints',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

gender1: {
        type: DataTypes.ENUM,

        values: [

"M",

"F"

        ],

      },

gender2: {
        type: DataTypes.ENUM,

        values: [

"M",

"F"

        ],

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

  genderconstraints.associate = (db) => {

    db.genderconstraints.belongsTo(db.roles, {
      as: 'role1',
      constraints: false,
    });

    db.genderconstraints.belongsTo(db.users, {
      as: 'user',
      constraints: false,
    });

    db.genderconstraints.belongsTo(db.roles, {
      as: 'role2',
      constraints: false,
    });

    db.genderconstraints.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.genderconstraints.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return genderconstraints;
};

