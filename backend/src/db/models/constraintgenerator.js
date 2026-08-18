const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const constraintgenerator = sequelize.define(
    'constraintgenerator',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

constraintType: {
        type: DataTypes.TEXT,

      },

description: {
        type: DataTypes.TEXT,

      },

alias: {
        type: DataTypes.TEXT,

      },

antecedentType: {
        type: DataTypes.TEXT,

      },

antecedentTypeUsers: {
        type: DataTypes.TEXT,

      },

antecedentTypeRoles: {
        type: DataTypes.TEXT,

      },

antecedentTypeSubgroups: {
        type: DataTypes.TEXT,

      },

antecedentTypeDaySelection: {
        type: DataTypes.TEXT,

      },

consequenceType: {
        type: DataTypes.TEXT,

      },

consequenceTypeUsers: {
        type: DataTypes.TEXT,

      },

consequenceTypeRoles: {
        type: DataTypes.TEXT,

      },

consequenceTypeSubgroups: {
        type: DataTypes.TEXT,

      },

consequenceTypeDaySelection: {
        type: DataTypes.TEXT,

      },

min: {
        type: DataTypes.INTEGER,

      },

max: {
        type: DataTypes.INTEGER,

      },

frequency: {
        type: DataTypes.TEXT,

      },

start: {
        type: DataTypes.DATEONLY,

        get: function() {
          return this.getDataValue('start')
            ? moment
                .utc(this.getDataValue('start'))
                .format('YYYY-MM-DD')
            : null;
        },

      },

end: {
        type: DataTypes.DATEONLY,

        get: function() {
          return this.getDataValue('end')
            ? moment
                .utc(this.getDataValue('end'))
                .format('YYYY-MM-DD')
            : null;
        },

      },

disabled: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

consequenceTypeEachOrAll: {
        type: DataTypes.TEXT,

      },

antecedentTypeEachOrAll: {
        type: DataTypes.TEXT,

      },

noLimit: {
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

  constraintgenerator.associate = (db) => {

    db.constraintgenerator.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.constraintgenerator.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return constraintgenerator;
};

