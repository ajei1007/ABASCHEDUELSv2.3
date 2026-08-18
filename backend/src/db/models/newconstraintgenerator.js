const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  const newconstraintgenerator = sequelize.define(
    'newconstraintgenerator',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      constraintType: {
        type: DataTypes.ENUM,
        values: [
          'matching',
          'unmatching',
          'usertouser',
          'usertosession',
          'time',
          'grouping',
          'drive',
          'gaps',
          'distance',
          'backToBack',
          'breakQuantity',
          'priority',
          'authorization',
          'sessionlength',
        ],
      },
      description: {
        type: DataTypes.TEXT,
      },
      antecedentType: {
        type: DataTypes.ENUM,
        values: ['specific', 'type'],
      },
      consequenceType: {
        type: DataTypes.ENUM,
        values: ['specific', 'type'],
      },
      antecedentTypeDaySelection: {
        type: DataTypes.ENUM,
        values: ['alldays', 'notalldays'],
      },
      consequenceTypeDaySelection: {
        type: DataTypes.ENUM,
        values: ['alldays', 'notalldays'],
      },
      min: {
        type: DataTypes.INTEGER,
      },
      max: {
        type: DataTypes.INTEGER,
      },
      frequency: {
        type: DataTypes.ENUM,
        values: ['day', 'week', 'session', 'month', 'year', 'custom'],
      },
      units: {
        type: DataTypes.ENUM,
        values: [
          'seconds',
          'minutes',
          'hours',
          'days',
          'weeks',
          'months',
          'years',
          'unit',
        ],
      },
      alias: {
        type: DataTypes.TEXT,
      },
      consequenceTypeEachOrAll: {
        type: DataTypes.ENUM,
        values: ['each', 'all'],
      },
      antecedentTypeEachOrAll: {
        type: DataTypes.ENUM,
        values: ['each', 'all'],
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
      disabled: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },
      rollover: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },
      fromHome: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },
      noLimit: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      weight: {
        type: DataTypes.INTEGER,
      },
      soft: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      all: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      importHash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
      offset: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      }
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    },
  );

  newconstraintgenerator.associate = (db) => {
    db.newconstraintgenerator.belongsToMany(db.usergroups, {
      as: 'antecedentTypeUsers',
      constraints: false,
      through: 'newconstraintgeneratorAntecedentTypeUsersUsergroups',
    });

    db.newconstraintgenerator.belongsToMany(db.usergroups, {
      as: 'consequenceTypeUsers',
      constraints: false,
      through: 'newconstraintgeneratorConsequenceTypeUsersUsergroups',
    });

    db.newconstraintgenerator.belongsToMany(db.rolegroups, {
      as: 'antecedentTypeRoles',
      constraints: false,
      through: 'newconstraintgeneratorAntecedentTypeRolesRolegroups',
    });

    db.newconstraintgenerator.belongsToMany(db.rolegroups, {
      as: 'consequenceTypeRoles',
      constraints: false,
      through: 'newconstraintgeneratorConsequenceTypeRolesRolegroups',
    });

    db.newconstraintgenerator.belongsToMany(db.subgroupgroups, {
      as: 'antecedentTypeSubgroups',
      constraints: false,
      through: 'newconstraintgeneratorAntecedentTypeSubgroupsSubgroupgroups',
    });

    db.newconstraintgenerator.belongsToMany(db.subgroupgroups, {
      as: 'consequenceTypeSubgroups',
      constraints: false,
      through: 'newconstraintgeneratorConsequenceTypeSubgroupsSubgroupgroups',
    });

    db.newconstraintgenerator.belongsToMany(db.branchgroups, {
      as: 'antecedentTypeBranches',
      constraints: false,
      through: 'newconstraintgeneratorAntecedentTypeBranchesBranchgroups',
    });

    db.newconstraintgenerator.belongsToMany(db.branchgroups, {
      as: 'consequenceTypeBranches',
      constraints: false,
      through: 'newconstraintgeneratorConsequenceTypeBranchesBranchgroups',
    });

    db.newconstraintgenerator.belongsToMany(db.branches, {
      as: 'branches',
      constraints: false,
      through: 'newconstraintgeneratorBranches',
    });

    db.newconstraintgenerator.belongsTo(db.roles, {
      as: 'antecedentRole',
      constraints: false,
    });

    db.newconstraintgenerator.belongsTo(db.subgroups, {
      as: 'antecedentSubgroup',
      constraints: false,
    });

    db.newconstraintgenerator.belongsTo(db.users, {
      as: 'antecedentUser',
      constraints: false,
    });

    db.newconstraintgenerator.belongsTo(db.users, {
      as: 'antecedentLocation',
      constraints: false,
    });

    db.newconstraintgenerator.belongsTo(db.users, {
      as: 'antecedentTypeActivity',
      constraints: false,
    });

    db.newconstraintgenerator.belongsTo(db.roles, {
      as: 'consequenceRole',
      constraints: false,
    });

    db.newconstraintgenerator.belongsTo(db.subgroups, {
      as: 'consequenceSubgroup',
      constraints: false,
    });

    db.newconstraintgenerator.belongsTo(db.users, {
      as: 'consequenceUser',
      constraints: false,
    });

    db.newconstraintgenerator.belongsTo(db.users, {
      as: 'consequenceLocation',
      constraints: false,
    });

    db.newconstraintgenerator.belongsTo(db.users, {
      as: 'consequenceTypeActivity',
      constraints: false,
    });

    db.newconstraintgenerator.belongsTo(db.groupings, {
      as: 'grouping',
      constraints: false,
    });

    db.newconstraintgenerator.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.newconstraintgenerator.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return newconstraintgenerator;
};
