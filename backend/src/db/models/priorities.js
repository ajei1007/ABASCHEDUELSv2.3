const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const priorities = sequelize.define(
    'priorities',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

rank: {
        type: DataTypes.INTEGER,

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

  priorities.associate = (db) => {

    db.priorities.belongsTo(db.users, {
      as: 'user1',
      constraints: false,
    });

    db.priorities.belongsTo(db.users, {
      as: 'user2',
      constraints: false,
    });

    db.priorities.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.priorities.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return priorities;
};

