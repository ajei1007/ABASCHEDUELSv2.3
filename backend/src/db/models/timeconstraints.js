const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  const timeconstraints = sequelize.define(
    'timeconstraints',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      min: {
        type: DataTypes.DECIMAL,
      },
      max: {
        type: DataTypes.DECIMAL,
      },
      unit: {
        type: DataTypes.ENUM,
        values: ['Hours', 'Minutes', 'Seconds', 'Units'],
      },
      frequency: {
        type: DataTypes.ENUM,
        values: [
          'Per Session',
          'Total',
          'Daily',
          'Weekly',
          'Monthly',
          'Annually',
        ],
      },

      start: {
        type: DataTypes.DATEONLY,

        get: function () {
          return this.getDataValue('start')
            ? moment.utc(this.getDataValue('start')).format('YYYY-MM-DD')
            : null;
        },
      },

      end: {
        type: DataTypes.DATEONLY,

        get: function () {
          return this.getDataValue('end')
            ? moment.utc(this.getDataValue('end')).format('YYYY-MM-DD')
            : null;
        },
      },

      offset: {
        type: DataTypes.DECIMAL,
      },

remaining: {
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

  timeconstraints.associate = (db) => {
    db.timeconstraints.belongsTo(db.roles, {
      as: 'role1',
      constraints: false,
    });

    db.timeconstraints.belongsTo(db.subgroups, {
      as: 'subgroup',
      constraints: false,
    });

    db.timeconstraints.belongsTo(db.users, {
      as: 'user1',
      constraints: false,
    });

    db.timeconstraints.belongsTo(db.users, {
      as: 'user2',
      constraints: false,
    });

    db.timeconstraints.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.timeconstraints.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return timeconstraints;
};
