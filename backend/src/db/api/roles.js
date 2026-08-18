const db = require('../models');
// const BranchesDBApi = require('./branches')
const Utils = require('../utils');
const RolesCacheApi = require('../../cache/roles');
const moment = require('moment');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class RolesDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const role = await db.roles.create(
      {
        id: data.id || undefined,
        name: data.name || null,
        dataAccess: data.dataAccess || null,
        statistics: data.statistics || null,
        constraints: data.constraints || null,
        events: data.events || null,
        openshift: data.openshift || false,
        subgroups: data.subgroups || null,
        scheduler: data.scheduler || null,
        availabilities: data.availabilities || null,
        branches: data.branches || null,
        cancellations: data.cancellations || null,
        cancellationtypes: data.cancellationtypes || null,
        capacityconstraints: data.capacityconstraints || null,
        clock: data.clock || null,
        distanceconstraints: data.distanceconstraints || null,
        eventpair: data.eventpair || null,
        groupings: data.groupings || null,
        matches: data.matches || null,
        nogapsconstraint: data.nogapsconstraint || null,
        priorities: data.priorities || null,
        relationships: data.relationships || null,
        roles: data.roles || null,
        settings: data.settings || null,
        settingscompany: data.settingscompany || null,
        statusevents: data.statusevents || null,
        timeconstraints: data.timeconstraints || null,
        timeoff: data.timeoff || null,
        timeofftypes: data.timeofftypes || null,
        users: data.users || null,
        createEvent: data.createEvent || false,
        editEvent: data.editEvent || false,
        deleteEvent: data.deleteEvent || false,
        createUser: data.createUser || false,
        editUser: data.editUser || false,
        deleteUser: data.deleteUser || false,
        createCancelation: data.createCancelation || false,
        deleteCancelation: data.deleteCancelation || false,
        createAvailability: data.createAvailability || false,
        editAvailability: data.editAvailability || false,
        deleteAvailability: data.deleteAvailability || false,
        viewReport: data.viewReport || false,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
        viewRole: data.viewRole || false,
        createRole: data.createRole || false,
        editRole: data.editRole || false,
        deleteRole: data.deleteRole || false,
        viewUser: data.viewUser || false,
        viewAvailability: data.viewAvailability || false,
        viewCancelation: data.viewCancelation || false,
        editSubgroups: data.editSubgroups || false,
        createBranch: data.createBranch || false,
        editBranch: data.editBranch || false,
        deleteBranch: data.deleteBranch || false,
        viewBranch: data.viewBranch || false,
        createConstraint: data.createConstraint || false,
        editConstraint: data.editConstraint || false,
        deleteConstraint: data.deleteConstraint || false,
        viewConstraint: data.viewConstraint || false,
        createSubgroup: data.createSubgroup || false,
        deleteSubgroup: data.deleteSubgroup || false,
        viewSubgroup: data.viewSubgroup || false,

        requestCancelation: data.requestCancelation || false,
        requestTimeoff: data.requestTimeoff || false,
        requestAvailability: data.requestAvailability || false,
        requestConfirmation: data.requestConfirmation || false,

        adminPushNotification: data.adminPushNotification || false,
        editStaffTrackerSettings: data.editStaffTrackerSettings || false,
        canEditEventSchedulerLocked: data.canEditEventSchedulerLocked || false,

        optimizerFeature: data.optimizerFeature || false,
        flaggingFeature: data.flaggingFeature || false,
        chatFeature: data.chatFeature || false,
        requestsFeature: data.requestsFeature || false,

        productivityInclude: data.productivityInclude || false,
        enableRequestNotifications: data.enableRequestNotifications || false,
        integrationFeature: data.integrationFeature || false,
        canLockScheduler: data.canLockScheduler || false,

        createActivity: data.createActivity || false,
        editActivity: data.editActivity || false,
        viewActivity: data.viewActivity || false,
        deleteActivity: data.deleteActivity || false,
        supportRequest: data.supportRequest || false,
        viewPayments: data.viewPayments || false,
        managePayments: data.managePayments || false,
        supervisor: data.supervisor || false,
        viewOnboardingChecklist: data.viewOnboardingChecklist || false,
        toggleOnboardingChecklist: data.toggleOnboardingChecklist || false,
        clockInOut: data.clockInOut || false,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
        standardRoles: data.standardRoles || 'unspecified',
        allowAlias: data.allowAlias || false,
      },
      { transaction },
    );

    RolesCacheApi.removeRoles();

    await this.setRelations(role, data, options);

    const output = role.get({ plain: true });

    output.parent = await role.getParent({
      transaction,
    });
    output.dataAccessGroup = await role.getDataAccessGroup({
      transaction,
    });
    output.dataAccessGroups = await role.getDataAccessGroups({
      transaction,
    });
    output.dataAccessGroupsReal = await role.getDataAccessGroupsReal({
      transaction,
    });
    output.branchType = await role.getBranchType({
      transaction,
    });

    const parsedRole = JSON.parse(JSON.stringify(output));

    return parsedRole;
  }

  static async createMany(rolesArray, options) {
    const transaction = (options && options.transaction) || undefined;

    rolesArray.forEach(role => {
      role.createdById = options.currentUser.id;
      role.updatedById = options.currentUser.id;
    });

    const roles = await db.roles.bulkCreate(rolesArray, { transaction });

    RolesCacheApi.removeRoles();

    const parsedRoles = [];

    for (let i = 0; i < roles.length; i++) {
      const role = roles[i];
      const roleData = rolesArray[i];

      await this.setRelations(role, roleData, options);

      const output = role.get({ plain: true });

      output.parent = await role.getParent({
        transaction,
      });

      output.dataAccessGroup = await role.getDataAccessGroup({
        transaction,
      });

      output.dataAccessGroups = await role.getDataAccessGroups({
        transaction,
      });

      output.dataAccessGroupsReal = await role.getDataAccessGroupsReal({
        transaction,
      });

      output.branchType = await role.getBranchType({
        transaction,
      });

      parsedRoles.push(JSON.parse(JSON.stringify(output)));
    }

    return parsedRoles;
  }

  static async setRelations(role, roleData, options) {
    const transaction = (options && options.transaction) || undefined;

    await role.setLocationstypes(roleData.locationstypes || null, {
      transaction,
    });

    await role.setParent(roleData.parent || null, {
      transaction,
    });

    await role.setDataAccessGroup(roleData.dataAccessGroup || null, {
      transaction,
    });
    
    await role.setBranchType(roleData.branchType || null, {
      transaction,
    });
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const roles = await db.roles.findByPk(id, {
      transaction,
    });

    await roles.update(
      {
        name: data.name || null,
        dataAccess: data.dataAccess || null,
        statistics: data.statistics || null,
        constraints: data.constraints || null,
        events: data.events || null,
        subgroups: data.subgroups || null,
        scheduler: data.scheduler || null,
        availabilities: data.availabilities || null,
        branches: data.branches || null,
        cancellations: data.cancellations || null,
        cancellationtypes: data.cancellationtypes || null,
        capacityconstraints: data.capacityconstraints || null,
        clock: data.clock || null,
        distanceconstraints: data.distanceconstraints || null,
        eventpair: data.eventpair || null,
        groupings: data.groupings || null,
        matches: data.matches || null,
        nogapsconstraint: data.nogapsconstraint || null,
        priorities: data.priorities || null,
        relationships: data.relationships || null,
        roles: data.roles || null,
        settings: data.settings || null,
        settingscompany: data.settingscompany || null,
        statusevents: data.statusevents || null,
        timeconstraints: data.timeconstraints || null,
        timeoff: data.timeoff || null,
        timeofftypes: data.timeofftypes || null,
        users: data.users || null,
        createEvent: data.createEvent || false,
        editEvent: data.editEvent || false,
        deleteEvent: data.deleteEvent || false,
        createUser: data.createUser || false,
        editUser: data.editUser || false,
        deleteUser: data.deleteUser || false,
        createCancelation: data.createCancelation || false,
        deleteCancelation: data.deleteCancelation || false,
        createAvailability: data.createAvailability || false,
        editAvailability: data.editAvailability || false,
        deleteAvailability: data.deleteAvailability || false,
        viewReport: data.viewReport || false,
        viewRole: data.viewRole || false,
        createRole: data.createRole || false,
        editRole: data.editRole || false,
        deleteRole: data.deleteRole || false,
        viewUser: data.viewUser || false,

        requestCancelation: data.requestCancelation || false,
        requestTimeoff: data.requestTimeoff || false,
        requestAvailability: data.requestAvailability || false,
        requestConfirmation: data.requestConfirmation || false,

        viewAvailability: data.viewAvailability || false,
        viewCancelation: data.viewCancelation || false,
        createBranch: data.createBranch || false,
        editBranch: data.editBranch || false,
        deleteBranch: data.deleteBranch || false,
        viewBranch: data.viewBranch || false,
        createConstraint: data.createConstraint || false,
        editConstraint: data.editConstraint || false,
        deleteConstraint: data.deleteConstraint || false,
        viewConstraint: data.viewConstraint || false,
        createSubgroup: data.createSubgroup || false,
        editSubgroup: data.editSubgroup || null,
        deleteSubgroup: data.deleteSubgroup || false,
        viewSubgroup: data.viewSubgroup || false,
        editSubgroups: data.editSubgroups || false,
        adminPushNotification: data.adminPushNotification || false,
        editStaffTrackerSettings: data.editStaffTrackerSettings || false,
        canEditEventSchedulerLocked: data.canEditEventSchedulerLocked || false,

        productivityInclude: data.productivityInclude || false,
        enableRequestNotifications: data.enableRequestNotifications || false,

        optimizerFeature: data.optimizerFeature || false,
        flaggingFeature: data.flaggingFeature || false,
        chatFeature: data.chatFeature || false,
        requestsFeature: data.requestsFeature || false,
        openshift: data.openshift || false,
        integrationFeature: data.integrationFeature || false,
        canLockScheduler: data.canLockScheduler || false,

        createActivity: data.createActivity || false,
        editActivity: data.editActivity || false,
        viewActivity: data.viewActivity || false,
        deleteActivity: data.deleteActivity || false,
        supportRequest: data.supportRequest || false,
        viewPayments: data.viewPayments || false,
        managePayments: data.managePayments || false,
        supervisor: data.supervisor || false,
        viewOnboardingChecklist: data.viewOnboardingChecklist || false,
        toggleOnboardingChecklist: data.toggleOnboardingChecklist || false,
        clockInOut: data.clockInOut || false,
        standardRoles: data.standardRoles || 'unspecified',
        updatedById: currentUser.id,
        allowAlias: data.allowAlias || false,
      },
      { transaction },
    );

    await RolesCacheApi.removeRoles();

    await roles.setLocationstypes(data.locationstypes || null, {
      transaction,
    });

    await roles.setParent(data.parent || null, {
      transaction,
    });
    await roles.setDataAccessGroup(data.dataAccessGroup || null, {
      transaction,
    });
    await roles.setBranchType(data.branchType || null, {
      transaction,
    });

    const output = roles.get({ plain: true });
    output.parent = await roles.getParent({
      transaction,
    });
    output.dataAccessGroup = await roles.getDataAccessGroup({
      transaction,
    });
    output.branchType = await roles.getBranchType({
      transaction,
    });

    const parsedRoles = JSON.parse(JSON.stringify(output));

    return parsedRoles;
  }

  static async updateForIntegration(id, data, options) {
    const currentUser = (options && options.currentUser);
    const transaction = (options && options.transaction) || undefined;

    const role = await db.roles.findByPk(id, {
      transaction,
    });
    const currentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS');

    await role.update(
      {
        name: data.name || null,
        updatedById: currentUser.id,
        updatedAt: currentDateTime,
      },
      { transaction },
    );

    return true;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const roles = await db.roles.findByPk(id, options);

    await roles.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await roles.destroy({
      transaction,
    });

    await RolesCacheApi.removeRoles();

    return roles;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;
    const attributes = (options && options.attributes) || undefined;
    let include = [];
    if (where.hasOwnProperty('companyId') && !where.companyId){
      return false;
    }

    if (where.companyId) {
      where = {
        ...where,
        ['$createdBy.companyId$']: Utils.uuid(where.companyId),
      };
      delete where.companyId;

      include = [
        ...include,
        {
          model: db.users,
          as: 'createdBy',
          paranoid: false,
        },
      ];
    }
    const roles = await db.roles.findOne({ where, attributes, include, transaction });

    if (!roles) {
      return roles;
    }
    const output = roles.get({ plain: true });
    output.parent = await roles.getParent({
      transaction,
    });
    output.dataAccessGroup = await roles.getDataAccessGroup({
      transaction,
    });
    output.branchType = await roles.getBranchType({
      transaction,
    });

    return JSON.parse(JSON.stringify(output));
  }

  static async findRelatedActiveUserNumber(id, options) {
    const transaction = (options && options.transaction) || undefined;

    const activeUserNumber = await db.sequelize.query(
      `SELECT COUNT(*) AS userCount 
         FROM usersRolesRoles urr 
   INNER JOIN users u ON urr.userId = u.id 
        WHERE urr.roleId = :roleId 
          AND u.deletedAt IS NULL`,
      {
        replacements: { roleId: id },
        type: db.sequelize.QueryTypes.SELECT,
      },
    );
    return activeUserNumber[0].userCount;
  }

  static async findAll(filter, options) {
    // if (filter.companyId) {
    //   const cachedCompanyRoles = await RolesCacheApi.getCompanyRoles(
    //     filter.companyId,
    //   );
    //   if (cachedCompanyRoles && cachedCompanyRoles.length) {
    //     return { rows: cachedCompanyRoles, count: cachedCompanyRoles.length };
    //   }
    // } else {
    //   const cachedRoles = await RolesCacheApi.findAll();
    //   if (cachedRoles && cachedRoles.length) {
    //     return { rows: cachedRoles, count: cachedRoles.length };
    //   }
    // }

    // if (filter.branches) {
    //   filter.branches = await BranchesDBApi.getBranchStructures({
    //     companyId: filter.companyId,
    //     branchIds: filter.branches
    //   });
    // }
    let limitOffset = Utils.getLimitOffset(filter.limit, filter.page);
    let limitOffsetGiven = false;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        attributes: ['id', 'name'],
        model: db.roles,
        as: 'parent',
      },

      {
        attributes: ['id', 'firstName'],
        model: db.users,
        as: 'createdBy',
        paranoid: false,
      },

      // {
      //   model: db.groupings,
      //   as: 'dataAccessGroup',
      // },

      {
        attributes: ['id', 'name'],
        model: db.branchtype,
        as: 'branchType',
      },

      // {
      //   model: db.roles,
      //   as: 'dataAccessGroups',
      //   through: filter.dataAccessGroups
      //     ? {
      //         where: {
      //           [Op.or]: filter.dataAccessGroups.split('|').map((item) => {
      //             return { ['Id']: Utils.uuid(item) };
      //           }),
      //         },
      //       }
      //     : null,
      //   required: filter.dataAccessGroups ? true : null,
      // },

      // {
      //   model: db.groupings,
      //   as: 'dataAccessGroupsReal',
      //   through: filter.dataAccessGroupsReal
      //     ? {
      //         where: {
      //           [Op.or]: filter.dataAccessGroupsReal.split('|').map((item) => {
      //             return { ['Id']: Utils.uuid(item) };
      //           }),
      //         },
      //       }
      //     : null,
      //   required: filter.dataAccessGroupsReal ? true : null,
      // },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.companyId) {
        where = {
          ...where,
          ['$createdBy.companyId$']: Utils.uuid(filter.companyId),
        };
      }

      if (filter.name) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('roles', 'name', filter.name),
        };
      }

      if (filter.editSubgroup) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('roles', 'editSubgroup', filter.editSubgroup),
        };
      }

      if (
        filter.active === true ||
        filter.active === 'true' ||
        filter.active === false ||
        filter.active === 'false'
      ) {
        where = {
          ...where,
          active: filter.active === true || filter.active === 'true',
        };
      }

      if (filter.dataAccess) {
        where = {
          ...where,
          dataAccess: filter.dataAccess,
        };
      }

      if (filter.statistics) {
        where = {
          ...where,
          statistics: filter.statistics,
        };
      }

      if (filter.constraints) {
        where = {
          ...where,
          constraints: filter.constraints,
        };
      }

      if (filter.events) {
        where = {
          ...where,
          events: filter.events,
        };
      }

      if (filter.subgroups) {
        where = {
          ...where,
          subgroups: filter.subgroups,
        };
      }

      if (filter.scheduler) {
        where = {
          ...where,
          scheduler: filter.scheduler,
        };
      }

      if (filter.availabilities) {
        where = {
          ...where,
          availabilities: filter.availabilities,
        };
      }

      // if (filter.branches) {
      //   where = {
      //     ...where,
      //     branches: filter.branches,
      //   };
      // }

      if (filter.cancellations) {
        where = {
          ...where,
          cancellations: filter.cancellations,
        };
      }

      if (filter.cancellationtypes) {
        where = {
          ...where,
          cancellationtypes: filter.cancellationtypes,
        };
      }

      if (filter.capacityconstraints) {
        where = {
          ...where,
          capacityconstraints: filter.capacityconstraints,
        };
      }

      if (filter.clock) {
        where = {
          ...where,
          clock: filter.clock,
        };
      }

      if (filter.distanceconstraints) {
        where = {
          ...where,
          distanceconstraints: filter.distanceconstraints,
        };
      }

      if (filter.eventpair) {
        where = {
          ...where,
          eventpair: filter.eventpair,
        };
      }

      // if (filter.groupings) {
      //   where = {
      //     ...where,
      //     groupings: filter.groupings,
      //   };
      // }

      if (filter.matches) {
        where = {
          ...where,
          matches: filter.matches,
        };
      }

      if (filter.nogapsconstraint) {
        where = {
          ...where,
          nogapsconstraint: filter.nogapsconstraint,
        };
      }

      if (filter.priorities) {
        where = {
          ...where,
          priorities: filter.priorities,
        };
      }

      if (filter.relationships) {
        where = {
          ...where,
          relationships: filter.relationships,
        };
      }

      if (filter.roles) {
        where = {
          ...where,
          roles: filter.roles,
        };
      }

      // if (filter.settings) {
      //   where = {
      //     ...where,
      //     settings: filter.settings,
      //   };
      // }

      if (filter.settingscompany) {
        where = {
          ...where,
          settingscompany: filter.settingscompany,
        };
      }

      if (filter.statusevents) {
        where = {
          ...where,
          statusevents: filter.statusevents,
        };
      }

      if (filter.timeconstraints) {
        where = {
          ...where,
          timeconstraints: filter.timeconstraints,
        };
      }

      if (filter.timeoff) {
        where = {
          ...where,
          timeoff: filter.timeoff,
        };
      }

      if (filter.timeofftypes) {
        where = {
          ...where,
          timeofftypes: filter.timeofftypes,
        };
      }

      // if (filter.users) {
      //   where = {
      //     ...where,
      //     users: filter.users,
      //   };
      // }

      if (filter.parent) {
        var listItems = filter.parent.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          parentId: { [Op.or]: listItems },
        };
      }

      if (filter.type) {
        var listItems = filter.type.split('|').map((item) => {
          return item;
        });

        where = {
          ...where,
          '$parent.name$': { [Op.or]: listItems },
        };
      }

      if (filter.type_not) {
        var listItems = filter.type_not.split('|').map((item) => {
          return Utils.uuid(item);
        });
      }

      if (filter.createEvent) {
        where = {
          ...where,
          createEvent: filter.createEvent,
        };
      }

      if (filter.editEvent) {
        where = {
          ...where,
          editEvent: filter.editEvent,
        };
      }

      if (filter.deleteEvent) {
        where = {
          ...where,
          deleteEvent: filter.deleteEvent,
        };
      }

      if (filter.createUser) {
        where = {
          ...where,
          createUser: filter.createUser,
        };
      }

      if (filter.editUser) {
        where = {
          ...where,
          editUser: filter.editUser,
        };
      }

      if (filter.deleteUser) {
        where = {
          ...where,
          deleteUser: filter.deleteUser,
        };
      }

      if (filter.createCancelation) {
        where = {
          ...where,
          createCancelation: filter.createCancelation,
        };
      }

      if (filter.deleteCancelation) {
        where = {
          ...where,
          deleteCancelation: filter.deleteCancelation,
        };
      }

      if (filter.createAvailability) {
        where = {
          ...where,
          createAvailability: filter.createAvailability,
        };
      }

      if (filter.editAvailability) {
        where = {
          ...where,
          editAvailability: filter.editAvailability,
        };
      }

      if (filter.deleteAvailability) {
        where = {
          ...where,
          deleteAvailability: filter.deleteAvailability,
        };
      }

      if (filter.viewReport) {
        where = {
          ...where,
          viewReport: filter.viewReport,
        };
      }

      if (filter.viewRole) {
        where = {
          ...where,
          viewRole: filter.viewRole,
        };
      }

      if (filter.createRole) {
        where = {
          ...where,
          createRole: filter.createRole,
        };
      }

      if (filter.editRole) {
        where = {
          ...where,
          editRole: filter.editRole,
        };
      }

      if (filter.deleteRole) {
        where = {
          ...where,
          deleteRole: filter.deleteRole,
        };
      }

      if (filter.viewUser) {
        where = {
          ...where,
          viewUser: filter.viewUser,
        };
      }

      if (filter.viewAvailability) {
        where = {
          ...where,
          viewAvailability: filter.viewAvailability,
        };
      }

      if (filter.viewCancelation) {
        where = {
          ...where,
          viewCancelation: filter.viewCancelation,
        };
      }

      if (filter.createBranch) {
        where = {
          ...where,
          createBranch: filter.createBranch,
        };
      }

      if (filter.editBranch) {
        where = {
          ...where,
          editBranch: filter.editBranch,
        };
      }

      if (filter.deleteBranch) {
        where = {
          ...where,
          deleteBranch: filter.deleteBranch,
        };
      }

      if (filter.viewBranch) {
        where = {
          ...where,
          viewBranch: filter.viewBranch,
        };
      }

      if (filter.createConstraint) {
        where = {
          ...where,
          createConstraint: filter.createConstraint,
        };
      }

      if (filter.editConstraint) {
        where = {
          ...where,
          editConstraint: filter.editConstraint,
        };
      }

      if (filter.deleteConstraint) {
        where = {
          ...where,
          deleteConstraint: filter.deleteConstraint,
        };
      }

      if (filter.viewConstraint) {
        where = {
          ...where,
          viewConstraint: filter.viewConstraint,
        };
      }

      if (filter.createSubgroup) {
        where = {
          ...where,
          createSubgroup: filter.createSubgroup,
        };
      }

      if (filter.deleteSubgroup) {
        where = {
          ...where,
          deleteSubgroup: filter.deleteSubgroup,
        };
      }

      if (filter.viewSubgroup) {
        where = {
          ...where,
          viewSubgroup: filter.viewSubgroup,
        };
      }

      if (filter.editSubgroups) {
        where = {
          ...where,
          editSubgroups: filter.editSubgroups,
        };
      }

      if (filter.adminPushNotification) {
        where = {
          ...where,
          adminPushNotification: filter.adminPushNotification,
        };
      }

      if (filter.parent) {
        var listItems = filter.parent.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          parentId: { [Op.or]: listItems },
        };
      }

      if (filter.dataAccessGroup) {
        var listItems = filter.dataAccessGroup.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          dataAccessGroupId: { [Op.or]: listItems },
        };
      }

      if (filter.branchType) {
        var listItems = filter.branchType.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          branchTypeId: { [Op.or]: listItems },
        };
      }

      if (filter.createdAtRange) {
        const [start, end] = filter.createdAtRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            ['createdAt']: {
              ...where.createdAt,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            ['createdAt']: {
              ...where.createdAt,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.chatFeature) {
        where = {
          ...where,
          chatFeature: filter.chatFeature,
        };
      }
    }

    // we look at the resource name's child roles. If some role doesnt have any child
    // the filter.resource will be empty string. In that case it will no enter this if clase
    // and then it will retrieve all roles
    if (filter.resource || filter.resource === '') {
      var listItems = filter.resource.split('|').map((item) => {
        return item;
      });

      where = {
        ...where,
        '$roles.name$': { [Op.or]: listItems },
      };
    }

    let queryOptions = {
      where,
      include: [
        {
          attributes: [],
          model: db.roles,
          as: 'parent',
        },
        {
          attributes: [],
          model: db.users,
          as: 'createdBy',
          paranoid: false,
        },
      ],
      attributes: ['id'],
      transaction,
    };

    if (limitOffset.lim >= 0 && limitOffset.off >= 0) {
      queryOptions.limit = limitOffset.lim;
      queryOptions.offset = limitOffset.off;
      limitOffsetGiven = true;
    }

    let result = await db.roles.findAndCountAll(queryOptions);
    const parsedRoleIds = result.rows;
    const roleIdArray = parsedRoleIds.map((role) => role.id);
    const numberOfRoles = result.count;

    let parsedRoles = [];
    let rows = await db.roles.findAll({
      where: !limitOffsetGiven
        ? where
        : {
            id: { [Op.or]: [roleIdArray] },
          },
      include,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
      benchmark: true,
    });
    parsedRoles = rows;

    return { rows: parsedRoles, count: numberOfRoles };
  }

  static async findAllAutocomplete(query, limit, filter) {
    let where = {};
    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike('roles', 'name', query),
        ],
      };
    }
    if (filter.type) {
      var listItems = filter.type.split('|').map((item) => {
        return item;
      });
      where = {
        ...where,
        '$parent.name$': { [Op.or]: listItems },
      };
    }

    const records = await db.roles.findAll({
      attributes: ['id', 'name'],
      include: [
        {
          model: db.users,
          as: 'createdBy',
          paranoid: false,
        },
        {
          model: db.roles,
          as: 'parent',
        },
      ],
      where: {
        ...where,
        ['$createdBy.companyId$']: Utils.uuid(filter.companyId),
      },

      limit: limit ? Number(limit) : undefined,
      orderBy: [['name', 'ASC']],
    });

    const parsedRows = JSON.parse(JSON.stringify(records));
    return parsedRows.map((record) => ({
      id: record.id,
      label: record.name,
    }));
  }

  static async hasAnyRoleWithFeatureEnabled(names, companyId, featureKey, options) {
    if (names.length === 0) {
      return false;
    }
    
    const transaction = options?.transaction;
  
    const roles = await db.roles.findAll({
      where: {
        name: { [Op.in]: names },
        ['$createdBy.companyId$']: Utils.uuid(companyId),
        [featureKey]: true, 
      },
      include: [
        {
          model: db.users,
          as: 'createdBy',
          paranoid: false,
        },
      ],
      attributes: ['id'],
      transaction,
    });
  
    return roles.length > 0;
  }  
};
