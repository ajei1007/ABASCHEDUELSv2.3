const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const { generateAlias } = require('../../utils/alias');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  const users = sequelize.define(
    'users',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      capacity: {
        type: DataTypes.INTEGER,
      },
      firstName: {
        type: DataTypes.TEXT,
        get() {
          const company = this.get('company');
          const roles = this.get('roles');
          const settings = company?.settingscompany;
          const useAlias = settings?.isAlias === true;
          const allowAlias = roles?.[0]?.allowAlias === true;

          /* 
            IF the company has alias enabled and the role has allowAlias enabled, then return the alias
          */
          if (useAlias && allowAlias) {
            const alias = this.getDataValue('alias');
            const aliasFormatType = settings?.aliasFormatType ?? null;
            const first = this.getDataValue('firstName') || '';
            const last = this.getDataValue('lastName') || '';
            return generateAlias(first, last, aliasFormatType, alias);
          }
          return this.getDataValue('firstName');
        },
      },
      lastName: {
        type: DataTypes.TEXT,
        get() {
          const company = this.get('company');
          const roles = this.get('roles');
          const settings = company?.settingscompany;
          const useAlias = settings?.isAlias === true;
          const allowAlias = roles?.[0]?.allowAlias === true;

          /* 
            IF the company has alias enabled and the role has allowAlias enabled, then return the empty string
            because we already have the alias in the firstName
          */
          if (useAlias && allowAlias) {
            const alias = this.getDataValue('alias');
            return ''
          }
          return this.getDataValue('lastName');
        },
      },
      phoneNumber: {
        type: DataTypes.TEXT,
      },
      email: {
        type: DataTypes.TEXT,
      },
      email1: {
        type: DataTypes.TEXT,
      },
      email2: {
        type: DataTypes.TEXT,
      },
      titleCustom: {
        type: DataTypes.TEXT,
      },
      codeCustom: {
        type: DataTypes.TEXT,
      },
      role: {
        type: DataTypes.ENUM,
        values: ['admin', 'user'],
      },
      disabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      needroom: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      needseat: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      clientReq: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      locReq: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      empNotReq: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      overlap: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      password: {
        type: DataTypes.TEXT,
      },
      emailVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      emailVerificationToken: {
        type: DataTypes.TEXT,
      },
      emailVerificationTokenExpiresAt: {
        type: DataTypes.DATE,
      },
      disabledAt: {
        type: DataTypes.DATE,
      },
      passwordResetToken: {
        type: DataTypes.TEXT,
      },
      passwordResetTokenExpiresAt: {
        type: DataTypes.DATE,
      },
      provider: {
        type: DataTypes.TEXT,
      },
      gender: {
        type: DataTypes.ENUM,
        values: ['M', 'F'],
      },
      alias: {
        type: DataTypes.TEXT,
      },
      customAddressId: {
        type: DataTypes.TEXT,
      },
      customPayorClientId: {
        type: DataTypes.TEXT,
      },
      otherPhones: {
        type: DataTypes.TEXT,
      },
      otherEmails: {
        type: DataTypes.TEXT,
      },
      address: {
        type: DataTypes.TEXT,
      },
      longitude: {
        type: DataTypes.DECIMAL(10, 7),
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 7),
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      minHours: {
        type: DataTypes.DECIMAL,
      },
      maxHours: {
        type: DataTypes.DECIMAL,
      },
      color: {
        type: DataTypes.TEXT,
      },
      // siblingUserId: {
      //   type: DataTypes.TEXT,
      // },
      borderColor: {
        type: DataTypes.TEXT,
      },
      birthday: {
        type: DataTypes.DATEONLY,
        get: function () {
          return this.getDataValue('birthday')
            ? moment.utc(this.getDataValue('birthday')).format('YYYY-MM-DD')
            : null;
        },
      },
      mobiletoken: {
        type: DataTypes.TEXT,
      },
      address2: {
        type: DataTypes.TEXT,
      },
      address2Default: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      billable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      notWorking: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      auth: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      allBranches: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      paid: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },
      idCustom: {
        type: DataTypes.TEXT,
      },
      idCustom2: {
        type: DataTypes.TEXT,
      },

      calendarhide: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      waitlisted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      priority: {
        type: DataTypes.INTEGER,
      },
      employeeratio: {
        type: DataTypes.INTEGER,
      },
      clientratio: {
        type: DataTypes.INTEGER,
      },
      hourlyrate: {
        type: DataTypes.DECIMAL,
      },
      salary: {
        type: DataTypes.DECIMAL,
      },
      hourlyrevenue: {
        type: DataTypes.DECIMAL,
      },
      supervision: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      productivityInclude: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      productivityExclude: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      importHash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
      siblingGroupId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: true,
      },
      supervisionRateInclude: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      notes: {
        type: DataTypes.TEXT,
      },
      defaultDuration: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      immutable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      internalAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    },
  );

  users.associate = (db) => {
    db.users.belongsToMany(db.users, {
      as: 'roomparent',
      constraints: false,
      foreignKey: 'roomId',
      through: 'usersRoomsUsers',
    });

    db.users.belongsToMany(db.users, {
      as: 'rooms',
      constraints: false,
      foreignKey: 'userId',
      through: 'usersRoomsUsers',
    });

    db.users.belongsToMany(db.funders, {
      as: 'funders',
      constraints: false,
      through: 'usersFundersFunders',
    });

    db.users.belongsToMany(db.subgroups, {
      as: 'subgroups',
      constraints: false,
      through: 'subgroupsUserUsers',
    });

    db.users.belongsToMany(db.roles, {
      as: 'roles',
      constraints: false,
      through: 'usersRolesRoles',
    });

    db.users.belongsToMany(db.branches, {
      as: 'branches',
      constraints: false,
      through: 'usersBranchesBranches',
    });

    db.users.belongsToMany(db.tags, {
      as: 'tags',
      constraints: false,
      through: 'usersTagsTags',
    });

    db.users.belongsToMany(db.users, {
      as: 'relationshipUsers',
      constraints: false,
      through: 'usersRelationshipUsersUsers',
    });

    db.users.belongsToMany(db.relationships, {
      as: 'relationships',
      constraints: false,
      through: 'usersRelationshipsRelationships',
    });

    db.users.belongsToMany(db.roles, {
      as: 'primarylocation',
      constraints: false,
      through: 'usersPrimarylocationRoles',
    });

    db.users.belongsToMany(db.users, {
      as: 'userdefaultlocation',
      constraints: false,
      through: 'usersUserdefaultlocationUsers',
    });

    db.users.belongsToMany(db.users, {
      as: 'userdefaultactivity',
      constraints: false,
      through: 'usersUserdefaultactivityUsers',
    });

    db.users.belongsToMany(db.mobiletokens, {
      as: 'mobiletokens',
      constraints: false,
      through: 'usersMobiletokensMobiletokens',
    });

    db.users.belongsToMany(db.roles, {
      as: 'credential',
      constraints: false,
      through: 'usersCredentialRoles',
    });

    db.users.belongsToMany(db.roles, {
      as: 'roster',
      constraints: false,
      through: 'usersRosterRoles',
    });

    db.users.belongsToMany(db.users, {
      as: 'credentialFunders',
      constraints: false,
      through: 'usersCredentialFundersUsers',
    });

    db.users.belongsToMany(db.totaltypes, {
      as: 'totals',
      constraints: false,
      through: 'usersTotalsTotaltypes',
    });

    db.users.belongsTo(db.users, {
      as: 'parent',
      constraints: false,
    });

    db.users.belongsTo(db.resources, {
      as: 'resource',
      constraints: false,
    });

    db.users.belongsTo(db.companies, {
      as: 'company',
      constraints: false,
    });

    db.users.belongsTo(db.locationstypes, {
      as: 'locationType',
      constraints: false,
    });

    db.users.belongsTo(db.siblingsUsers, {
      as: 'siblingUser',
      constraints: false,
    });

    db.users.belongsTo(db.relationships, {
      as: 'address1Relationship',
      constraints: false,
    });

    db.users.belongsTo(db.relationships, {
      as: 'address2Relationship',
      constraints: false,
    });

    db.users.hasMany(db.file, {
      as: 'avatar',
      foreignKey: 'belongsToId',
      constraints: false,
      scope: {
        belongsTo: db.users.getTableName(),
        belongsToColumn: 'avatar',
      },
    });

    db.users.hasMany(db.availabilities, {
      as: 'availabilities',
      constraints: false,
      foreignKey: 'userId',
    });

    db.users.hasMany(db.priorities, {
      as: 'priorities',
      constraints: false,
      foreignKey: 'user1Id',
    });

    db.users.hasMany(db.timeconstraints, {
      as: 'timeconstraints',
      constraints: false,
      foreignKey: 'user1Id',
    });

    db.users.hasOne(db.mattermostUsers, {
      as: 'mattermostUser',
      foreignKey: 'userId',
    });    

    db.users.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.users.belongsTo(db.users, {
      as: 'updatedBy',
    });

    db.users.hasMany(db.surveyData, { foreignKey: 'userId' });
  };

  users.beforeCreate((users, options) => {
    users = trimStringFields(users);

    if (
      users.provider !== providers.local &&
      Object.values(providers).indexOf(users.provider) > -1
    ) {
      users.emailVerified = true;

      if (!users.password) {
        const password = crypto.randomBytes(20).toString('hex');

        const hashedPassword = bcrypt.hashSync(
          password,
          config.bcrypt.saltRounds,
        );

        users.password = hashedPassword;
      }
    }
  });

  users.beforeUpdate((users, options) => {
    users = trimStringFields(users);
  });

  return users;
};

function trimStringFields(users) {
  users.email = users.email.trim();

  users.firstName = users.firstName ? users.firstName.trim() : null;

  users.lastName = users.lastName ? users.lastName.trim() : null;

  return users;
}

