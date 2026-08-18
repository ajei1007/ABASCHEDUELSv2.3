const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const data1 = sequelize.define(
    'data1',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

s1: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s2: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s3: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s4: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s5: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s6: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s7: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s8: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s9: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s11: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s12: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s13: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s14: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s15: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s16: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s17: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s18: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s19: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s20: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s21: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s22: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s23: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s24: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s25: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s26: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s27: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s28: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s29: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s30: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s31: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s32: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s33: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s34: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s35: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s36: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s37: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s38: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s39: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s40: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s41: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s42: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s43: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s44: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s45: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s46: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s47: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s48: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

s10: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

slots: {
        type: DataTypes.TEXT,

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

total: {
        type: DataTypes.INTEGER,

      },

eff: {
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

  data1.associate = (db) => {

    db.data1.belongsTo(db.users, {
      as: 'person',
      constraints: false,
    });

    db.data1.belongsTo(db.users, {
      as: 'activity',
      constraints: false,
    });

    db.data1.belongsTo(db.users, {
      as: 'location',
      constraints: false,
    });

    db.data1.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.data1.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return data1;
};

