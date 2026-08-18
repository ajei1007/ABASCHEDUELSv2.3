const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const pushnotifications = sequelize.define(
    'pushnotifications',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

date: {
        type: DataTypes.DATEONLY,

        get: function() {
          return this.getDataValue('date')
            ? moment
                .utc(this.getDataValue('date'))
                .format('YYYY-MM-DD')
            : null;
        },

      },

message: {
        type: DataTypes.TEXT,

      },

checked: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

      
      notificationType: {
        type: DataTypes.ENUM('Danger', 'Warning', 'Success', 'Info', 'Default'),
        allowNull: false,
        defaultValue: 'Default',
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

  pushnotifications.associate = (db) => {

    db.pushnotifications.belongsToMany(db.users, {
      as: 'users',
      constraints: false,
      through: 'pushnotificationsUsersUsers',
    });

    db.pushnotifications.belongsTo(db.events, {
      as: 'event',
      constraints: false,
    });

    db.pushnotifications.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.pushnotifications.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return pushnotifications;
};

