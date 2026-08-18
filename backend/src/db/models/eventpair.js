const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const eventpair = sequelize.define(
    'eventpair',
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

  eventpair.associate = (db) => {

    db.eventpair.belongsToMany(db.roles, {
      as: 'roles1',
      constraints: false,
      through: 'eventpairRoles1Roles',
    });

    db.eventpair.belongsToMany(db.roles, {
      as: 'roles2',
      constraints: false,
      through: 'eventpairRoles2Roles',
    });

    db.eventpair.belongsTo(db.users, {
      as: 'activity1',
      constraints: false,
    });

    db.eventpair.belongsTo(db.users, {
      as: 'activity2',
      constraints: false,
    });

    db.eventpair.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.eventpair.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return eventpair;
};

