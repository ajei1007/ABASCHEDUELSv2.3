const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const timeoff = sequelize.define(
    'timeoff',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

reason: {
        type: DataTypes.ENUM,

        values: [

"Vacation",

"Holiday",

"Sick",

"Personal"

        ],

      },

notes: {
        type: DataTypes.TEXT,

      },

approved: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

duration: {
        type: DataTypes.INTEGER,

      },

datetimestart: {
        type: DataTypes.DATE,

      },

paid: {
        type: DataTypes.ENUM,

        values: [

"Paid",

"Unpaid"

        ],

      },

datetimeend: {
        type: DataTypes.DATE,

      },

status: {
        type: DataTypes.ENUM,

        values: [

"Pending",

"Approved",

"Declined"

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

  timeoff.associate = (db) => {

    db.timeoff.belongsTo(db.users, {
      as: 'user',
      constraints: false,
    });

    db.timeoff.belongsTo(db.timeofftypes, {
      as: 'reasontype',
      constraints: false,
    });

    db.timeoff.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.timeoff.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return timeoff;
};

