const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  const roles = sequelize.define(
    'roles',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      name: {
        type: DataTypes.TEXT,
      },

      dataAccess: {
        type: DataTypes.ENUM,

        values: ['All', 'Branch', 'User'],
      },

      statistics: {
        type: DataTypes.ENUM,

        values: ['E', 'V', 'NA'],
      },

      constraints: {
        type: DataTypes.ENUM,

        values: ['V', 'E', 'NA'],
      },

      events: {
        type: DataTypes.ENUM,

        values: ['E', 'V', 'NA'],
      },

      subgroups: {
        type: DataTypes.ENUM,

        values: ['E', 'V', 'NA'],
      },

      scheduler: {
        type: DataTypes.ENUM,

        values: ['E', 'V', 'NA'],
      },

      availabilities: {
        type: DataTypes.ENUM,

        values: ['E', 'V', 'NA'],
      },

      branches: {
        type: DataTypes.ENUM,

        values: ['E', 'V', 'NA'],
      },

      cancellations: {
        type: DataTypes.ENUM,

        values: ['E', 'V', 'NA'],
      },

      cancellationtypes: {
        type: DataTypes.ENUM,

        values: ['E', 'V', 'NA'],
      },

      capacityconstraints: {
        type: DataTypes.ENUM,

        values: ['E', 'V', 'NA'],
      },

      clock: {
        type: DataTypes.ENUM,

        values: ['E', 'V', 'NA'],
      },

      distanceconstraints: {
        type: DataTypes.ENUM,

        values: ['E', 'V', 'NA'],
      },

      eventpair: {
        type: DataTypes.ENUM,

        values: ['E', 'V', 'NA'],
      },

      groupings: {
        type: DataTypes.ENUM,

        values: ['E', 'V', 'NA'],
      },

      matches: {
        type: DataTypes.ENUM,

        values: ['E', 'V', 'NA'],
      },

      nogapsconstraint: {
        type: DataTypes.ENUM,

        values: ['E', 'V', 'NA'],
      },

      priorities: {
        type: DataTypes.ENUM,

        values: ['E', 'V', 'NA'],
      },

      relationships: {
        type: DataTypes.ENUM,

        values: ['E', 'V', 'NA'],
      },

      roles: {
        type: DataTypes.ENUM,

        values: ['E', 'V', 'NA'],
      },

      settings: {
        type: DataTypes.ENUM,

        values: ['E', 'V', 'NA'],
      },

      settingscompany: {
        type: DataTypes.ENUM,

        values: ['E', 'V', 'NA'],
      },

      statusevents: {
        type: DataTypes.ENUM,

        values: ['E', 'V', 'NA'],
      },

      timeconstraints: {
        type: DataTypes.ENUM,

        values: ['E', 'V', 'NA'],
      },

      timeoff: {
        type: DataTypes.ENUM,

        values: ['E', 'V', 'NA'],
      },

      timeofftypes: {
        type: DataTypes.ENUM,

        values: ['E', 'V', 'NA'],
      },

      users: {
        type: DataTypes.ENUM,

        values: ['E', 'V', 'NA'],
      },

      createEvent: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      openshift: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      editEvent: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      deleteEvent: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      createUser: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      editUser: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      deleteUser: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      createCancelation: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      deleteCancelation: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      createAvailability: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      editAvailability: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      deleteAvailability: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      viewReport: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      viewRole: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      createRole: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      editRole: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      deleteRole: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      viewUser: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      viewAvailability: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      viewCancelation: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      createBranch: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      editBranch: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      deleteBranch: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      viewBranch: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      createConstraint: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      editConstraint: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      deleteConstraint: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      viewConstraint: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      createSubgroup: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      editSubgroup: {
        type: DataTypes.TEXT,
      },

      deleteSubgroup: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      viewSubgroup: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      editSubgroups: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      viewOnboardingChecklist: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      toggleOnboardingChecklist: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      
      adminPushNotification: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      editStaffTrackerSettings: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      requestCancelation: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      requestTimeoff: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      requestAvailability: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      requestConfirmation: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      importHash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
      canEditEventSchedulerLocked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      optimizerFeature: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      flaggingFeature: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      requestsFeature: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      chatFeature: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      productivityInclude: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      enableRequestNotifications: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      integrationFeature: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      canLockScheduler: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createActivity: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      editActivity: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      viewActivity: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      deleteActivity: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      supportRequest: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      viewPayments: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      managePayments: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      supervisor: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      clockInOut: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      standardRoles: {
        type: DataTypes.ENUM('superAdmin', 'admin', 'clinician', 'technician', 'patient', 'unspecified'),
        allowNull: false,
        defaultValue: 'unspecified',
      },
      allowAlias: {
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

  roles.associate = (db) => {
    db.roles.belongsToMany(db.roles, {
      as: 'dataAccessGroups',
      constraints: false,
      through: 'rolesDataAccessGroupsRoles',
    });

    db.roles.belongsToMany(db.groupings, {
      as: 'dataAccessGroupsReal',
      constraints: false,
      through: 'rolesDataAccessGroupsRealGroupings',
    });

    db.roles.belongsTo(db.roles, {
      as: 'parent',
      constraints: false,
    });

    db.roles.belongsTo(db.locationstypes, {
      as: 'locationstypes',
      constraints: false,
    });

    db.roles.belongsTo(db.groupings, {
      as: 'dataAccessGroup',
      constraints: false,
    });

    db.roles.belongsTo(db.branchtype, {
      as: 'branchType',
      constraints: false,
    });

    db.roles.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.roles.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return roles;
};
