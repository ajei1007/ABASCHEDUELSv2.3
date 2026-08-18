
const db = require('../models');
const FileDBApi = require('./file');const BranchesDBApi = require('./branches')
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class TimeconstraintsDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const timeconstraints = await db.timeconstraints.create(
      {
        id: data.id || undefined,

        min: data.min ?? null,
        max: data.max ?? null,
        unit: data.unit || null,
        frequency: data.frequency || null,
        start: data.start || null,
        end: data.end || null,
        offset: data.offset || null,
        remaining: data.remaining || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await timeconstraints.setRole1(data.role1 || null, {
      transaction,
    });

    await timeconstraints.setSubgroup(data.subgroup || null, {
      transaction,
    });

    await timeconstraints.setUser1(data.user1 || null, {
      transaction,
    });

    await timeconstraints.setUser2(data.user2 || null, {
      transaction,
    });

    return timeconstraints;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const timeconstraints = await db.timeconstraints.findByPk(id, {
      transaction,
    });

    await timeconstraints.update(
      {
        min: data.min ?? null,
        max: data.max ?? null,
        unit: data.unit || null,
        frequency: data.frequency || null,
        start: data.start || null,
        end: data.end || null,
        offset: data.offset || null,
        remaining: data.remaining || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await timeconstraints.setRole1(data.role1 || null, {
      transaction,
    });

    await timeconstraints.setSubgroup(data.subgroup || null, {
      transaction,
    });

    await timeconstraints.setUser1(data.user1 || null, {
      transaction,
    });

    await timeconstraints.setUser2(data.user2 || null, {
      transaction,
    });

    return timeconstraints;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const timeconstraints = await db.timeconstraints.findByPk(id, options);

    await timeconstraints.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await timeconstraints.destroy({
      transaction,
    });

    return timeconstraints;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const timeconstraints = await db.timeconstraints.findOne(
      { where },
      { transaction },
    );

    if (!timeconstraints) {
      return timeconstraints;
    }

    const output = timeconstraints.get({ plain: true });

    output.role1 = await timeconstraints.getRole1({
      transaction,
    });

    output.subgroup = await timeconstraints.getSubgroup({
      transaction,
    });

    output.user1 = await timeconstraints.getUser1({
      transaction,
    });

    output.user2 = await timeconstraints.getUser2({
      transaction,
    });

    return output;
  }

  static async findAll(filter, options) {
    if (filter.branches) {
      filter.branches = await BranchesDBApi.getBranchStructures({
        companyId: filter.companyId,
        branchIds: filter.branches
      });
    }
    var limit = filter.limit || 0;
    var offset = 0;
    const currentPage = +filter.page - 1;

    offset = currentPage * limit;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        model: db.roles,
        as: 'role1',
      },
      {
        model: db.subgroups,
        as: 'subgroup',
      },
      {
        model: db.users,
        as: 'user1',
        attributes: ['id', 'firstName'],
        include: [
          {
            attributes: ['id', 'name'],
            model: db.branches,
            as: 'branches',
          },
        ],
      },
      {
        model: db.users,
        as: 'user2',
        attributes: ['id', 'firstName'],
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }
      if (filter.branches) {
        where = {
          ...where,
          '$user1->branches.id$': {
            [Op.or]: filter.branches.split('|').map((item) => {
              return Utils.uuid(item);
            }),
          },
        };
      }

      if (filter.branches) {
        where = {
          ...where,
          '$user1->branches.id$': {
            [Op.or]: filter.branches.split('|').map((item) => {
              return Utils.uuid(item);
            }),
          },
        };
      }

      //CUSTOM FIND DATE RANGES OVERLAP - https://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
      if (filter.start && filter.end) {
        where = {
          ...where,
          [Op.and]: [
            {
              start: {
                //...where.startRecur,
                [Op.lt]: filter.end,
              },
              end: {
                //...where.startRecur,
                [Op.gt]: filter.start,
              },
            },
          ],
        };
      }

      if (filter.minRange) {
        const [start, end] = filter.minRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            min: {
              ...where.min,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            min: {
              ...where.min,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.maxRange) {
        const [start, end] = filter.maxRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            max: {
              ...where.max,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            max: {
              ...where.max,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.startRange) {
        const [start, end] = filter.startRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            start: {
              ...where.start,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            start: {
              ...where.start,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.endRange) {
        const [start, end] = filter.endRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            end: {
              ...where.end,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            end: {
              ...where.end,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.offsetRange) {
        const [start, end] = filter.offsetRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            offset: {
              ...where.offset,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            offset: {
              ...where.offset,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.remainingRange) {
        const [start, end] = filter.remainingRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            remaining: {
              ...where.remaining,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            remaining: {
              ...where.remaining,
              [Op.lte]: end,
            },
          };
        }
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

      if (filter.unit) {
        where = {
          ...where,
          unit: filter.unit,
        };
      }

      if (filter.frequency) {
        where = {
          ...where,
          frequency: filter.frequency,
        };
      }

      if (filter.role1) {
        var listItems = filter.role1.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          role1Id: { [Op.or]: listItems },
        };
      }

      if (filter.subgroup) {
        var listItems = filter.subgroup.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          subgroupId: { [Op.or]: listItems },
        };
      }

      if (filter.user1) {
        var listItems = filter.user1.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          user1Id: { [Op.or]: listItems },
        };
      }

      if (filter.user2) {
        var listItems = filter.user2.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          user2Id: { [Op.or]: listItems },
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

    let { rows, count } = await db.timeconstraints.findAndCountAll({
      where,
      include,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
    });

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
        as: 'role1',
      },
      {
        model: db.subgroups,
        as: 'subgroup',
      },
      {
        model: db.users,
        as: 'user1',
        attributes: ['id', 'firstName'],
        include: [
          {
            attributes: ['id', 'name'],
            model: db.branches,
            as: 'branches',
          },
        ],
      },
      {
        model: db.users,
        as: 'user2',
        attributes: ['id', 'firstName'],
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }
      if (filter.branches) {
        where = {
          ...where,
          '$user1->branches.id$': {
            [Op.or]: filter.branches.split('|').map((item) => {
              return Utils.uuid(item);
            }),
          },
        };
      }

      if (filter.branches) {
        where = {
          ...where,
          '$user1->branches.id$': {
            [Op.or]: filter.branches.split('|').map((item) => {
              return Utils.uuid(item);
            }),
          },
        };
      }

      //CUSTOM FIND DATE RANGES OVERLAP - https://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
      if (filter.start && filter.end) {
        where = {
          ...where,
          [Op.and]: [
            {
              start: {
                //...where.startRecur,
                [Op.lt]: filter.end,
              },
              end: {
                //...where.startRecur,
                [Op.gt]: filter.start,
              },
            },
          ],
        };
      }

      if (filter.minRange) {
        const [start, end] = filter.minRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            min: {
              ...where.min,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            min: {
              ...where.min,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.maxRange) {
        const [start, end] = filter.maxRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            max: {
              ...where.max,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            max: {
              ...where.max,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.startRange) {
        const [start, end] = filter.startRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            start: {
              ...where.start,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            start: {
              ...where.start,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.endRange) {
        const [start, end] = filter.endRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            end: {
              ...where.end,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            end: {
              ...where.end,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.offsetRange) {
        const [start, end] = filter.offsetRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            offset: {
              ...where.offset,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            offset: {
              ...where.offset,
              [Op.lte]: end,
            },
          };
        }
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

      if (filter.unit) {
        where = {
          ...where,
          unit: filter.unit,
        };
      }

      if (filter.frequency) {
        where = {
          ...where,
          frequency: filter.frequency,
        };
      }

      if (filter.role1) {
        var listItems = filter.role1.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          role1Id: { [Op.or]: listItems },
        };
      }

      if (filter.subgroup) {
        var listItems = filter.subgroup.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          subgroupId: { [Op.or]: listItems },
        };
      }

      if (filter.user1) {
        var listItems = filter.user1.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          user1Id: { [Op.or]: listItems },
        };
      }

      if (filter.user2) {
        var listItems = filter.user2.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          user2Id: { [Op.or]: listItems },
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

    // let { rows, count } = await db.timeconstraints.findAndCountAll(
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
    };
    db.timeconstraints._validateIncludedElements(opt);
    const query =
      "SELECT `timeconstraints`.`id`, `timeconstraints`.`min`, `timeconstraints`.`max`, `timeconstraints`.`unit`, `timeconstraints`.`frequency`, `timeconstraints`.`start`, `timeconstraints`.`end`, `timeconstraints`.`offset`, `timeconstraints`.`importHash`, `timeconstraints`.`createdAt`, `timeconstraints`.`updatedAt`, `timeconstraints`.`deletedAt`, `timeconstraints`.`role1Id`, `timeconstraints`.`subgroupId`, `timeconstraints`.`user1Id`, `timeconstraints`.`user2Id`, `timeconstraints`.`createdById`, `timeconstraints`.`updatedById`, `role1`.`id` AS `role1.id`, `role1`.`name` AS `role1.name`, `role1`.`dataAccess` AS `role1.dataAccess`, `role1`.`statistics` AS `role1.statistics`, `role1`.`constraints` AS `role1.constraints`, `role1`.`events` AS `role1.events`, `role1`.`subgroups` AS `role1.subgroups`, `role1`.`scheduler` AS `role1.scheduler`, `role1`.`availabilities` AS `role1.availabilities`, `role1`.`branches` AS `role1.branches`, `role1`.`cancellations` AS `role1.cancellations`, `role1`.`cancellationtypes` AS `role1.cancellationtypes`, `role1`.`capacityconstraints` AS `role1.capacityconstraints`, `role1`.`clock` AS `role1.clock`, `role1`.`distanceconstraints` AS `role1.distanceconstraints`, `role1`.`eventpair` AS `role1.eventpair`, `role1`.`groupings` AS `role1.groupings`, `role1`.`matches` AS `role1.matches`, `role1`.`nogapsconstraint` AS `role1.nogapsconstraint`, `role1`.`priorities` AS `role1.priorities`, `role1`.`relationships` AS `role1.relationships`, `role1`.`roles` AS `role1.roles`, `role1`.`settings` AS `role1.settings`, `role1`.`settingscompany` AS `role1.settingscompany`, `role1`.`statusevents` AS `role1.statusevents`, `role1`.`timeconstraints` AS `role1.timeconstraints`, `role1`.`timeoff` AS `role1.timeoff`, `role1`.`timeofftypes` AS `role1.timeofftypes`, `role1`.`users` AS `role1.users`, `role1`.`createEvent` AS `role1.createEvent`, `role1`.`editEvent` AS `role1.editEvent`, `role1`.`deleteEvent` AS `role1.deleteEvent`, `role1`.`createUser` AS `role1.createUser`, `role1`.`editUser` AS `role1.editUser`, `role1`.`deleteUser` AS `role1.deleteUser`, `role1`.`createCancelation` AS `role1.createCancelation`, `role1`.`deleteCancelation` AS `role1.deleteCancelation`, `role1`.`createAvailability` AS `role1.createAvailability`, `role1`.`editAvailability` AS `role1.editAvailability`, `role1`.`deleteAvailability` AS `role1.deleteAvailability`, `role1`.`viewReport` AS `role1.viewReport`, `role1`.`viewRole` AS `role1.viewRole`, `role1`.`createRole` AS `role1.createRole`, `role1`.`editRole` AS `role1.editRole`, `role1`.`deleteRole` AS `role1.deleteRole`, `role1`.`viewUser` AS `role1.viewUser`, `role1`.`viewAvailability` AS `role1.viewAvailability`, `role1`.`viewCancelation` AS `role1.viewCancelation`, `role1`.`createBranch` AS `role1.createBranch`, `role1`.`editBranch` AS `role1.editBranch`, `role1`.`deleteBranch` AS `role1.deleteBranch`, `role1`.`viewBranch` AS `role1.viewBranch`, `role1`.`createConstraint` AS `role1.createConstraint`, `role1`.`editConstraint` AS `role1.editConstraint`, `role1`.`deleteConstraint` AS `role1.deleteConstraint`, `role1`.`viewConstraint` AS `role1.viewConstraint`, `role1`.`createSubgroup` AS `role1.createSubgroup`, `role1`.`editSubgroup` AS `role1.editSubgroup`, `role1`.`deleteSubgroup` AS `role1.deleteSubgroup`, `role1`.`viewSubgroup` AS `role1.viewSubgroup`, `role1`.`editSubgroups` AS `role1.editSubgroups`, `role1`.`importHash` AS `role1.importHash`, `role1`.`createdAt` AS `role1.createdAt`, `role1`.`updatedAt` AS `role1.updatedAt`, `role1`.`deletedAt` AS `role1.deletedAt`, `role1`.`parentId` AS `role1.parentId`, `role1`.`dataAccessGroupId` AS `role1.dataAccessGroupId`, `role1`.`createdById` AS `role1.createdById`, `role1`.`updatedById` AS `role1.updatedById`, `subgroup`.`id` AS `subgroup.id`, `subgroup`.`name` AS `subgroup.name`, `subgroup`.`allbranches` AS `subgroup.allbranches`, `subgroup`.`importHash` AS `subgroup.importHash`, `subgroup`.`createdAt` AS `subgroup.createdAt`, `subgroup`.`updatedAt` AS `subgroup.updatedAt`, `subgroup`.`deletedAt` AS `subgroup.deletedAt`, `subgroup`.`groupId` AS `subgroup.groupId`, `subgroup`.`createdById` AS `subgroup.createdById`, `subgroup`.`updatedById` AS `subgroup.updatedById`, `user1`.`id` AS `user1.id`, `user1`.`firstName` AS `user1.firstName`, `user1->branches`.`id` AS `user1.branches.id`, `user1->branches`.`name` AS `user1.branches.name`, `user1->branches->usersBranchesBranches`.`createdAt` AS `user1.branches.usersBranchesBranches.createdAt`, `user1->branches->usersBranchesBranches`.`updatedAt` AS `user1.branches.usersBranchesBranches.updatedAt`, `user1->branches->usersBranchesBranches`.`userId` AS `user1.branches.usersBranchesBranches.userId`, `user1->branches->usersBranchesBranches`.`branchId` AS `user1.branches.usersBranchesBranches.branchId`, `user2`.`id` AS `user2.id`, `user2`.`firstName` AS `user2.firstName` FROM `timeconstraints` AS `timeconstraints` LEFT OUTER JOIN `roles` AS `role1` ON `timeconstraints`.`role1Id` = `role1`.`id` AND (`role1`.`deletedAt` IS NULL) LEFT OUTER JOIN `subgroups` AS `subgroup` ON `timeconstraints`.`subgroupId` = `subgroup`.`id` AND (`subgroup`.`deletedAt` IS NULL) LEFT OUTER JOIN `users` AS `user1` ON `timeconstraints`.`user1Id` = `user1`.`id` AND (`user1`.`deletedAt` IS NULL) LEFT OUTER JOIN ( `usersBranchesBranches` AS `user1->branches->usersBranchesBranches` INNER JOIN `branches` AS `user1->branches` ON `user1->branches`.`id` = `user1->branches->usersBranchesBranches`.`branchId`) ON `user1`.`id` = `user1->branches->usersBranchesBranches`.`userId` AND (`user1->branches`.`deletedAt` IS NULL) LEFT OUTER JOIN `users` AS `user2` ON `timeconstraints`.`user2Id` = `user2`.`id` AND (`user2`.`deletedAt` IS NULL) WHERE (`timeconstraints`.`deletedAt` IS NULL AND (((`timeconstraints`.`start` < '" +
      filter.start +
      "' AND `timeconstraints`.`end` > '" +
      filter.end +
      "')) AND (`user1->branches`.`id` = '" +
      filter.branches.split('|').map((item) => Utils.uuid(item)) +
      "'))) ORDER BY `timeconstraints`.`createdAt` DESC";
    const timeconstraints = await db.sequelize.query(query, opt);

    return { rows: timeconstraints, count: timeconstraints.length };
  }

  static async findAllAutocomplete(query, limit, filter) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike('timeconstraints', 'role1', query),
        ],
      };
    }

    const records = await db.timeconstraints.findAll({
      attributes: ['id', 'role1'],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['role1', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.role1,
    }));
  }
};

