const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const subgroupgroups = sequelize.define(
    'subgroupgroups',
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

  subgroupgroups.associate = (db) => {

    db.subgroupgroups.belongsToMany(db.subgroups, {
      as: 'subgroups',
      constraints: false,
      through: 'subgroupgroupsSubgroupsSubgroups',
    });

    db.subgroupgroups.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.subgroupgroups.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return subgroupgroups;
};

