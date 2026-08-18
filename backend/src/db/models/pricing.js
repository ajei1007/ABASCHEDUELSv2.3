const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const pricing = sequelize.define(
    'pricing',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

incoming: {
        type: DataTypes.DECIMAL,

      },

outgoing: {
        type: DataTypes.DECIMAL,

      },

unit: {
        type: DataTypes.ENUM,

        values: [

"hourly",

"yearly"

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

  pricing.associate = (db) => {

    db.pricing.belongsTo(db.users, {
      as: 'user1',
      constraints: false,
    });

    db.pricing.belongsTo(db.users, {
      as: 'user2',
      constraints: false,
    });

    db.pricing.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.pricing.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return pricing;
};

