const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  const subgroups = sequelize.define(
    'subgroups',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      name: {
        type: DataTypes.TEXT,
      },
      iconName: {
        type: DataTypes.TEXT,
      },

      allbranches: {
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
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    },
  );

  subgroups.associate = (db) => {
    db.subgroups.belongsToMany(db.users, {
      as: 'user',
      constraints: false,
      through: 'subgroupsUserUsers',
    });

    db.subgroups.belongsToMany(db.branches, {
      as: 'branches',
      constraints: false,
      through: 'subgroupsBranchesBranches',
    });

    db.subgroups.belongsToMany(db.subgroups, {
      as: 'subgroup',
      constraints: false,
      through: 'subgroupsSubgroupSubgroups',
    });

    db.subgroups.belongsToMany(db.subgroups, {
      as: 'subgroup3',
      constraints: false,
      through: 'subgroupsSubgroup3Subgroups',
    });

    db.subgroups.belongsTo(db.groupings, {
      as: 'group',
      constraints: false,
    });

    db.subgroups.belongsTo(db.branches, {
      as: 'branch',
      constraints: false,
    });

    db.subgroups.belongsTo(db.users, {
      as: 'relatedUser',
      constraints: false,
    });

    db.subgroups.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.subgroups.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return subgroups;
};
