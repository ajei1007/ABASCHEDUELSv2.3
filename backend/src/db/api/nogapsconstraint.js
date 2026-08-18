
const db = require('../models');
const FileDBApi = require('./file');const BranchesDBApi = require('./branches')
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class NogapsconstraintDBApi {

  static async create(data, options) {
  const currentUser = (options && options.currentUser) || { id: null };
  const transaction = (options && options.transaction) || undefined;

  const nogapsconstraint = await db.nogapsconstraint.create(
  {
  id: data.id || undefined,

    disabled: data.disabled
    ||
    false

,

  importHash: data.importHash || null,
  createdById: currentUser.id,
  updatedById: currentUser.id,
  },
  { transaction },
  );

    await nogapsconstraint.setRoles(data.roles || [], {
    transaction,
    });

  return nogapsconstraint;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || {id: null};
    const transaction = (options && options.transaction) || undefined;

    const nogapsconstraint = await db.nogapsconstraint.findByPk(id, {
      transaction,
    });

    await nogapsconstraint.update(
      {

        disabled: data.disabled
        ||
        false

,

        updatedById: currentUser.id,
      },
      {transaction},
    );

    await nogapsconstraint.setRoles(data.roles || [], {
      transaction,
    });

    return nogapsconstraint;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || {id: null};
    const transaction = (options && options.transaction) || undefined;

    const nogapsconstraint = await db.nogapsconstraint.findByPk(id, options);

    await nogapsconstraint.update({
      deletedBy: currentUser.id
    }, {
      transaction,
    });

    await nogapsconstraint.destroy({
      transaction
    });

    return nogapsconstraint;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const nogapsconstraint = await db.nogapsconstraint.findOne(
      { where },
      { transaction },
    );

    if (!nogapsconstraint) {
      return nogapsconstraint;
    }

    const output = nogapsconstraint.get({plain: true});

    output.roles = await nogapsconstraint.getRoles({
      transaction
    });

    return output;
  }

  static async findAll(filter, options) {
    // if(filter.branches){
    //   filter.branches = await BranchesDBApi.getBranchStructures({
    //     companyId: filter.companyId,
    //     branchIds: filter.branches
    //   });
    // }
    var limit = filter.limit || 0;
    var offset = 0;
    const currentPage = +filter.page - 1;

    offset = currentPage * limit;

    var orderBy = null;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        model: db.roles,
        as: 'roles',
        through: filter.roles ? { where: {
          [Op.or]: filter.roles.split('|').map(item => {
            return { ['Id']: Utils.uuid(item) }
          })
        }} : null,
        required: filter.roles ? true : null,
      },

    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
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
          active:
            filter.active === true ||
            filter.active === 'true',
        };
      }

      if (filter.disabled) {
        where = {
          ...where,
          disabled: filter.disabled,
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
    }

    let { rows, count } = await db.nogapsconstraint.findAndCountAll(
      {
        where,
        include,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
        order: (filter.field && filter.sort)
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
        transaction,
      },
    );

    return { rows, count };
  }

  static async findAllFaster(filter, options) {
    var limit = filter.limit || 0;
    var offset = 0;
    const currentPage = +filter.page - 1;

    offset = currentPage * limit;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        model: db.roles,
        as: 'roles',
        through: filter.roles ? { where: {
          [Op.or]: filter.roles.split('|').map(item => {
            return { ['Id']: Utils.uuid(item) }
          })
        }} : null,
        required: filter.roles ? true : null,
      },

    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
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
          active:
            filter.active === true ||
            filter.active === 'true',
        };
      }

      if (filter.disabled) {
        where = {
          ...where,
          disabled: filter.disabled,
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
    }

    // let { rows, count } = await db.nogapsconstraint.findAndCountAll(
    //   {
    //     where,
    //     include,
    //     limit: limit ? Number(limit) : undefined,
    //     offset: offset ? Number(offset) : undefined,
    //     order: (filter.field && filter.sort)
    //       ? [[filter.field, filter.sort]]
    //       : [['createdAt', 'desc']],
    //     transaction,
    //   },
    // );

    const opt = {
      type: db.sequelize.QueryTypes.SELECT,
      hasJoin: true,
      include,
    }
    db.nogapsconstraint._validateIncludedElements(opt);
    const query = "SELECT `nogapsconstraint`.`id`, `nogapsconstraint`.`disabled`, `nogapsconstraint`.`importHash`, `nogapsconstraint`.`createdAt`, `nogapsconstraint`.`updatedAt`, `nogapsconstraint`.`deletedAt`, `nogapsconstraint`.`createdById`, `nogapsconstraint`.`updatedById`, `roles`.`id` AS `roles.id`, `roles`.`name` AS `roles.name`, `roles`.`dataAccess` AS `roles.dataAccess`, `roles`.`statistics` AS `roles.statistics`, `roles`.`constraints` AS `roles.constraints`, `roles`.`events` AS `roles.events`, `roles`.`subgroups` AS `roles.subgroups`, `roles`.`scheduler` AS `roles.scheduler`, `roles`.`availabilities` AS `roles.availabilities`, `roles`.`branches` AS `roles.branches`, `roles`.`cancellations` AS `roles.cancellations`, `roles`.`cancellationtypes` AS `roles.cancellationtypes`, `roles`.`capacityconstraints` AS `roles.capacityconstraints`, `roles`.`clock` AS `roles.clock`, `roles`.`distanceconstraints` AS `roles.distanceconstraints`, `roles`.`eventpair` AS `roles.eventpair`, `roles`.`groupings` AS `roles.groupings`, `roles`.`matches` AS `roles.matches`, `roles`.`nogapsconstraint` AS `roles.nogapsconstraint`, `roles`.`priorities` AS `roles.priorities`, `roles`.`relationships` AS `roles.relationships`, `roles`.`roles` AS `roles.roles`, `roles`.`settings` AS `roles.settings`, `roles`.`settingscompany` AS `roles.settingscompany`, `roles`.`statusevents` AS `roles.statusevents`, `roles`.`timeconstraints` AS `roles.timeconstraints`, `roles`.`timeoff` AS `roles.timeoff`, `roles`.`timeofftypes` AS `roles.timeofftypes`, `roles`.`users` AS `roles.users`, `roles`.`createEvent` AS `roles.createEvent`, `roles`.`editEvent` AS `roles.editEvent`, `roles`.`deleteEvent` AS `roles.deleteEvent`, `roles`.`createUser` AS `roles.createUser`, `roles`.`editUser` AS `roles.editUser`, `roles`.`deleteUser` AS `roles.deleteUser`, `roles`.`createCancelation` AS `roles.createCancelation`, `roles`.`deleteCancelation` AS `roles.deleteCancelation`, `roles`.`createAvailability` AS `roles.createAvailability`, `roles`.`editAvailability` AS `roles.editAvailability`, `roles`.`deleteAvailability` AS `roles.deleteAvailability`, `roles`.`viewReport` AS `roles.viewReport`, `roles`.`viewRole` AS `roles.viewRole`, `roles`.`createRole` AS `roles.createRole`, `roles`.`editRole` AS `roles.editRole`, `roles`.`deleteRole` AS `roles.deleteRole`, `roles`.`viewUser` AS `roles.viewUser`, `roles`.`viewAvailability` AS `roles.viewAvailability`, `roles`.`viewCancelation` AS `roles.viewCancelation`, `roles`.`createBranch` AS `roles.createBranch`, `roles`.`editBranch` AS `roles.editBranch`, `roles`.`deleteBranch` AS `roles.deleteBranch`, `roles`.`viewBranch` AS `roles.viewBranch`, `roles`.`createConstraint` AS `roles.createConstraint`, `roles`.`editConstraint` AS `roles.editConstraint`, `roles`.`deleteConstraint` AS `roles.deleteConstraint`, `roles`.`viewConstraint` AS `roles.viewConstraint`, `roles`.`createSubgroup` AS `roles.createSubgroup`, `roles`.`editSubgroup` AS `roles.editSubgroup`, `roles`.`deleteSubgroup` AS `roles.deleteSubgroup`, `roles`.`viewSubgroup` AS `roles.viewSubgroup`, `roles`.`editSubgroups` AS `roles.editSubgroups`, `roles`.`importHash` AS `roles.importHash`, `roles`.`createdAt` AS `roles.createdAt`, `roles`.`updatedAt` AS `roles.updatedAt`, `roles`.`deletedAt` AS `roles.deletedAt`, `roles`.`parentId` AS `roles.parentId`, `roles`.`dataAccessGroupId` AS `roles.dataAccessGroupId`, `roles`.`createdById` AS `roles.createdById`, `roles`.`updatedById` AS `roles.updatedById`, `roles->nogapsconstraintRolesRoles`.`createdAt` AS `roles.nogapsconstraintRolesRoles.createdAt`, `roles->nogapsconstraintRolesRoles`.`updatedAt` AS `roles.nogapsconstraintRolesRoles.updatedAt`, `roles->nogapsconstraintRolesRoles`.`nogapsconstraintId` AS `roles.nogapsconstraintRolesRoles.nogapsconstraintId`, `roles->nogapsconstraintRolesRoles`.`roleId` AS `roles.nogapsconstraintRolesRoles.roleId` FROM `nogapsconstraint` AS `nogapsconstraint` LEFT OUTER JOIN ( `nogapsconstraintRolesRoles` AS `roles->nogapsconstraintRolesRoles` INNER JOIN `roles` AS `roles` ON `roles`.`id` = `roles->nogapsconstraintRolesRoles`.`roleId`) ON `nogapsconstraint`.`id` = `roles->nogapsconstraintRolesRoles`.`nogapsconstraintId` AND (`roles`.`deletedAt` IS NULL) WHERE `nogapsconstraint`.`deletedAt` IS NULL ORDER BY `nogapsconstraint`.`createdAt` DESC";
    const nogapsconstraint = await db.sequelize.query(query, opt);

    return { rows: nogapsconstraint, count: nogapsconstraint.length };
  }

  static async findAllAutocomplete(query, limit) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike(
            'nogapsconstraint',
            'id',
            query,
          ),
        ],
      };
    }

    const records = await db.nogapsconstraint.findAll({
      attributes: [ 'id', 'id' ],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['id', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.id,
    }));
  }

};

