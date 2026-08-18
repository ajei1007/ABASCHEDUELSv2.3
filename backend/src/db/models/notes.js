const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const notes = sequelize.define(
    'notes',
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

notes: {
        type: DataTypes.TEXT,

      },

checked: {
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

  notes.associate = (db) => {

    db.notes.belongsToMany(db.users, {
      as: 'users',
      constraints: false,
      through: 'notesUsersUsers',
    });

    db.notes.belongsTo(db.events, {
      as: 'event',
      constraints: false,
    });

    db.notes.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.notes.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return notes;
};

