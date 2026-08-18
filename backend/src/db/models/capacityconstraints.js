const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const capacityconstraints = sequelize.define(
    'capacityconstraints',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

min1: {
        type: DataTypes.INTEGER,

      },

max1: {
        type: DataTypes.INTEGER,

      },

min2: {
        type: DataTypes.INTEGER,

      },

max2: {
        type: DataTypes.INTEGER,

      },

min3: {
        type: DataTypes.INTEGER,

      },

max3: {
        type: DataTypes.INTEGER,

      },

min4: {
        type: DataTypes.INTEGER,

      },

max4: {
        type: DataTypes.INTEGER,

      },

priority: {
        type: DataTypes.INTEGER,

      },

min5: {
        type: DataTypes.INTEGER,

      },

max5: {
        type: DataTypes.INTEGER,

      },

locationDisabled: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

disabled: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,

      },

      rooms: {
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

  capacityconstraints.associate = (db) => {

    db.capacityconstraints.belongsTo(db.users, {
      as: 'user1',
      constraints: false,
    });

    db.capacityconstraints.belongsTo(db.users, {
      as: 'user2',
      constraints: false,
    });

    db.capacityconstraints.belongsTo(db.roles, {
      as: 'role1',
      constraints: false,
    });

    db.capacityconstraints.belongsTo(db.roles, {
      as: 'role2',
      constraints: false,
    });

    db.capacityconstraints.belongsTo(db.roles, {
      as: 'role3',
      constraints: false,
    });

    db.capacityconstraints.belongsTo(db.roles, {
      as: 'role4',
      constraints: false,
    });

    db.capacityconstraints.belongsTo(db.subgroups, {
      as: 'subgroup1',
      constraints: false,
    });

    db.capacityconstraints.belongsTo(db.subgroups, {
      as: 'subgroup2',
      constraints: false,
    });

    db.capacityconstraints.belongsTo(db.subgroups, {
      as: 'subgroup3',
      constraints: false,
    });

    db.capacityconstraints.belongsTo(db.subgroups, {
      as: 'subgroup4',
      constraints: false,
    });

    db.capacityconstraints.belongsTo(db.roles, {
      as: 'role5',
      constraints: false,
    });

    db.capacityconstraints.belongsTo(db.subgroups, {
      as: 'subgroup5',
      constraints: false,
    });

    db.capacityconstraints.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.capacityconstraints.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return capacityconstraints;
};

