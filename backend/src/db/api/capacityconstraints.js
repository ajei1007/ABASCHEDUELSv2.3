const db = require('../models');
const FileDBApi = require('./file');
const BranchesDBApi = require('./branches');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class CapacityconstraintsDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const capacityconstraints = await db.capacityconstraints.create(
      {
        id: data.id || undefined,

        min1: data.min1 || null,
        max1: data.max1 || null,
        min2: data.min2 || null,
        max2: data.max2 || null,
        min3: data.min3 || null,
        max3: data.max3 || null,
        min4: data.min4 || null,
        max4: data.max4 || null,
        priority: data.priority || null,
        min5: data.min5 || null,
        max5: data.max5 || null,
        locationDisabled: data.locationDisabled || false,
        disabled: data.disabled || false,
        rooms: data.rooms || false,

        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await capacityconstraints.setUser1(data.user1 || null, {
      transaction,
    });

    await capacityconstraints.setUser2(data.user2 || null, {
      transaction,
    });

    await capacityconstraints.setRole1(data.role1 || null, {
      transaction,
    });

    await capacityconstraints.setRole2(data.role2 || null, {
      transaction,
    });

    await capacityconstraints.setRole3(data.role3 || null, {
      transaction,
    });

    await capacityconstraints.setRole4(data.role4 || null, {
      transaction,
    });

    await capacityconstraints.setSubgroup1(data.subgroup1 || null, {
      transaction,
    });

    await capacityconstraints.setSubgroup2(data.subgroup2 || null, {
      transaction,
    });

    await capacityconstraints.setSubgroup3(data.subgroup3 || null, {
      transaction,
    });

    await capacityconstraints.setSubgroup4(data.subgroup4 || null, {
      transaction,
    });

    await capacityconstraints.setRole5(data.role5 || null, {
      transaction,
    });

    await capacityconstraints.setSubgroup5(data.subgroup5 || null, {
      transaction,
    });

    return capacityconstraints;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const capacityconstraints = await db.capacityconstraints.findByPk(id, {
      transaction,
    });

    await capacityconstraints.update(
      {
        min1: data.min1 || null,
        max1: data.max1 || null,
        min2: data.min2 || null,
        max2: data.max2 || null,
        min3: data.min3 || null,
        max3: data.max3 || null,
        min4: data.min4 || null,
        max4: data.max4 || null,
        priority: data.priority || null,
        min5: data.min5 || null,
        max5: data.max5 || null,
        locationDisabled: data.locationDisabled || false,
        disabled: data.disabled || false,
        rooms: data.rooms || false,

        updatedById: currentUser.id,
      },
      { transaction },
    );

    await capacityconstraints.setUser1(data.user1 || null, {
      transaction,
    });

    await capacityconstraints.setUser2(data.user2 || null, {
      transaction,
    });

    await capacityconstraints.setRole1(data.role1 || null, {
      transaction,
    });

    await capacityconstraints.setRole2(data.role2 || null, {
      transaction,
    });

    await capacityconstraints.setRole3(data.role3 || null, {
      transaction,
    });

    await capacityconstraints.setRole4(data.role4 || null, {
      transaction,
    });

    await capacityconstraints.setSubgroup1(data.subgroup1 || null, {
      transaction,
    });

    await capacityconstraints.setSubgroup2(data.subgroup2 || null, {
      transaction,
    });

    await capacityconstraints.setSubgroup3(data.subgroup3 || null, {
      transaction,
    });

    await capacityconstraints.setSubgroup4(data.subgroup4 || null, {
      transaction,
    });

    await capacityconstraints.setRole5(data.role5 || null, {
      transaction,
    });

    await capacityconstraints.setSubgroup5(data.subgroup5 || null, {
      transaction,
    });

    return capacityconstraints;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const capacityconstraints = await db.capacityconstraints.findByPk(
      id,
      options,
    );

    await capacityconstraints.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await capacityconstraints.destroy({
      transaction,
    });

    return capacityconstraints;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const capacityconstraints = await db.capacityconstraints.findOne(
      { where },
      { transaction },
    );

    if (!capacityconstraints) {
      return capacityconstraints;
    }

    const output = capacityconstraints.get({ plain: true });

    output.user1 = await capacityconstraints.getUser1({
      transaction,
    });

    output.user2 = await capacityconstraints.getUser2({
      transaction,
    });

    output.role1 = await capacityconstraints.getRole1({
      transaction,
    });

    output.role2 = await capacityconstraints.getRole2({
      transaction,
    });

    output.role3 = await capacityconstraints.getRole3({
      transaction,
    });

    output.role4 = await capacityconstraints.getRole4({
      transaction,
    });

    output.subgroup1 = await capacityconstraints.getSubgroup1({
      transaction,
    });

    output.subgroup2 = await capacityconstraints.getSubgroup2({
      transaction,
    });

    output.subgroup3 = await capacityconstraints.getSubgroup3({
      transaction,
    });

    output.subgroup4 = await capacityconstraints.getSubgroup4({
      transaction,
    });

    output.role5 = await capacityconstraints.getRole5({
      transaction,
    });

    output.subgroup5 = await capacityconstraints.getSubgroup5({
      transaction,
    });

    return output;
  }

  static async findAll(filter, options) {
    if (filter.branches) {
      filter.branches = await BranchesDBApi.getBranchStructures({
        companyId: filter.companyId,
        branchIds: filter.branches,
      });
    }

    let limitOffset = Utils.getLimitOffset(filter.limit, filter.page);

    var orderBy = null;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        model: db.users,
        as: 'user1',
        attributes: ['id', 'firstName'],
      },
      {
        model: db.users,
        attributes: ['id', 'firstName'],
        as: 'user2',
      },
      {
        model: db.users,
        attributes: ['id', 'firstName'],
        as: 'createdBy',
        paranoid: false,
      },
      {
        model: db.roles,
        as: 'role1',
      },
      {
        model: db.roles,
        as: 'role2',
      },
      {
        model: db.roles,
        as: 'role3',
      },
      {
        model: db.roles,
        as: 'role4',
      },

      {
        model: db.subgroups,
        as: 'subgroup1',
      },

      {
        model: db.subgroups,
        as: 'subgroup2',
      },

      {
        model: db.subgroups,
        as: 'subgroup3',
      },

      {
        model: db.subgroups,
        as: 'subgroup4',
      },

      {
        model: db.roles,
        as: 'role5',
      },

      {
        model: db.subgroups,
        as: 'subgroup5',
      },
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

      if (filter.min1Range) {
        const [start, end] = filter.min1Range;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            min1: {
              ...where.min1,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            min1: {
              ...where.min1,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.max1Range) {
        const [start, end] = filter.max1Range;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            max1: {
              ...where.max1,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            max1: {
              ...where.max1,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.min2Range) {
        const [start, end] = filter.min2Range;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            min2: {
              ...where.min2,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            min2: {
              ...where.min2,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.max2Range) {
        const [start, end] = filter.max2Range;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            max2: {
              ...where.max2,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            max2: {
              ...where.max2,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.min3Range) {
        const [start, end] = filter.min3Range;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            min3: {
              ...where.min3,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            min3: {
              ...where.min3,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.max3Range) {
        const [start, end] = filter.max3Range;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            max3: {
              ...where.max3,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            max3: {
              ...where.max3,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.min4Range) {
        const [start, end] = filter.min4Range;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            min4: {
              ...where.min4,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            min4: {
              ...where.min4,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.max4Range) {
        const [start, end] = filter.max4Range;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            max4: {
              ...where.max4,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            max4: {
              ...where.max4,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.priorityRange) {
        const [start, end] = filter.priorityRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            priority: {
              ...where.priority,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            priority: {
              ...where.priority,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.min5Range) {
        const [start, end] = filter.min5Range;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            min5: {
              ...where.min5,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            min5: {
              ...where.min5,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.max5Range) {
        const [start, end] = filter.max5Range;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            max5: {
              ...where.max5,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            max5: {
              ...where.max5,
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

      if (filter.locationDisabled) {
        where = {
          ...where,
          locationDisabled: filter.locationDisabled,
        };
      }

      if (filter.disabled) {
        where = {
          ...where,
          disabled: filter.disabled,
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

      if (filter.role1) {
        var listItems = filter.role1.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          role1Id: { [Op.or]: listItems },
        };
      }

      if (filter.role2) {
        var listItems = filter.role2.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          role2Id: { [Op.or]: listItems },
        };
      }

      if (filter.role3) {
        var listItems = filter.role3.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          role3Id: { [Op.or]: listItems },
        };
      }

      if (filter.role4) {
        var listItems = filter.role4.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          role4Id: { [Op.or]: listItems },
        };
      }

      if (filter.subgroup1) {
        var listItems = filter.subgroup1.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          subgroup1Id: { [Op.or]: listItems },
        };
      }

      if (filter.subgroup2) {
        var listItems = filter.subgroup2.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          subgroup2Id: { [Op.or]: listItems },
        };
      }

      if (filter.subgroup3) {
        var listItems = filter.subgroup3.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          subgroup3Id: { [Op.or]: listItems },
        };
      }

      if (filter.subgroup4) {
        var listItems = filter.subgroup4.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          subgroup4Id: { [Op.or]: listItems },
        };
      }

      if (filter.role5) {
        var listItems = filter.role5.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          role5Id: { [Op.or]: listItems },
        };
      }

      if (filter.subgroup5) {
        var listItems = filter.subgroup5.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          subgroup5Id: { [Op.or]: listItems },
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

    let queryOptions = {
      where,
      include,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
    };

    if (limitOffset.lim >= 0 && limitOffset.off >= 0) {
      queryOptions.limit = limitOffset.lim;
      queryOptions.offset = limitOffset.off;
    }

    let { rows, count } = await db.capacityconstraints.findAndCountAll(
      queryOptions,
    );

    return { rows, count };
  }

  static async findAllFaster(filter, options) {
    var limit = filter.limit || 0;
    var offset = 0;
    const currentPage = +filter.page - 1;

    offset = currentPage * limit;

    var orderBy = null;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        model: db.users,
        as: 'user1',
        attributes: ['id', 'firstName'],
      },
      {
        model: db.users,
        attributes: ['id', 'firstName'],
        as: 'user2',
      },
      {
        model: db.users,
        attributes: ['id', 'firstName'],
        as: 'createdBy',
        paranoid: false,
      },
      {
        model: db.roles,
        as: 'role1',
      },
      {
        model: db.roles,
        as: 'role2',
      },
      {
        model: db.roles,
        as: 'role3',
      },
      {
        model: db.roles,
        as: 'role4',
      },
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

      if (filter.min1Range) {
        const [start, end] = filter.min1Range;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            min1: {
              ...where.min1,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            min1: {
              ...where.min1,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.max1Range) {
        const [start, end] = filter.max1Range;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            max1: {
              ...where.max1,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            max1: {
              ...where.max1,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.min2Range) {
        const [start, end] = filter.min2Range;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            min2: {
              ...where.min2,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            min2: {
              ...where.min2,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.max2Range) {
        const [start, end] = filter.max2Range;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            max2: {
              ...where.max2,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            max2: {
              ...where.max2,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.min3Range) {
        const [start, end] = filter.min3Range;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            min3: {
              ...where.min3,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            min3: {
              ...where.min3,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.max3Range) {
        const [start, end] = filter.max3Range;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            max3: {
              ...where.max3,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            max3: {
              ...where.max3,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.min4Range) {
        const [start, end] = filter.min4Range;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            min4: {
              ...where.min4,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            min4: {
              ...where.min4,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.max4Range) {
        const [start, end] = filter.max4Range;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            max4: {
              ...where.max4,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            max4: {
              ...where.max4,
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

      if (filter.role1) {
        var listItems = filter.role1.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          role1Id: { [Op.or]: listItems },
        };
      }

      if (filter.role2) {
        var listItems = filter.role2.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          role2Id: { [Op.or]: listItems },
        };
      }

      if (filter.role3) {
        var listItems = filter.role3.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          role3Id: { [Op.or]: listItems },
        };
      }

      if (filter.role4) {
        var listItems = filter.role4.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          role4Id: { [Op.or]: listItems },
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

    // let { rows, count } = await db.capacityconstraints.findAndCountAll(
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
    db.capacityconstraints._validateIncludedElements(opt);
    const query =
      "SELECT `capacityconstraints`.`id`, `capacityconstraints`.`min1`, `capacityconstraints`.`max1`, `capacityconstraints`.`min2`, `capacityconstraints`.`max2`, `capacityconstraints`.`min3`, `capacityconstraints`.`max3`, `capacityconstraints`.`min4`, `capacityconstraints`.`max4`, `capacityconstraints`.`importHash`, `capacityconstraints`.`createdAt`, `capacityconstraints`.`updatedAt`, `capacityconstraints`.`deletedAt`, `capacityconstraints`.`user1Id`, `capacityconstraints`.`user2Id`, `capacityconstraints`.`role1Id`, `capacityconstraints`.`role2Id`, `capacityconstraints`.`role3Id`, `capacityconstraints`.`role4Id`, `capacityconstraints`.`createdById`, `capacityconstraints`.`updatedById`, `user1`.`id` AS `user1.id`, `user1`.`firstName` AS `user1.firstName`, `user2`.`id` AS `user2.id`, `user2`.`firstName` AS `user2.firstName`, `createdBy`.`id` AS `createdBy.id`, `createdBy`.`firstName` AS `createdBy.firstName`, `role1`.`id` AS `role1.id`, `role1`.`name` AS `role1.name`, `role1`.`dataAccess` AS `role1.dataAccess`, `role1`.`statistics` AS `role1.statistics`, `role1`.`constraints` AS `role1.constraints`, `role1`.`events` AS `role1.events`, `role1`.`subgroups` AS `role1.subgroups`, `role1`.`scheduler` AS `role1.scheduler`, `role1`.`availabilities` AS `role1.availabilities`, `role1`.`branches` AS `role1.branches`, `role1`.`cancellations` AS `role1.cancellations`, `role1`.`cancellationtypes` AS `role1.cancellationtypes`, `role1`.`capacityconstraints` AS `role1.capacityconstraints`, `role1`.`clock` AS `role1.clock`, `role1`.`distanceconstraints` AS `role1.distanceconstraints`, `role1`.`eventpair` AS `role1.eventpair`, `role1`.`groupings` AS `role1.groupings`, `role1`.`matches` AS `role1.matches`, `role1`.`nogapsconstraint` AS `role1.nogapsconstraint`, `role1`.`priorities` AS `role1.priorities`, `role1`.`relationships` AS `role1.relationships`, `role1`.`roles` AS `role1.roles`, `role1`.`settings` AS `role1.settings`, `role1`.`settingscompany` AS `role1.settingscompany`, `role1`.`statusevents` AS `role1.statusevents`, `role1`.`timeconstraints` AS `role1.timeconstraints`, `role1`.`timeoff` AS `role1.timeoff`, `role1`.`timeofftypes` AS `role1.timeofftypes`, `role1`.`users` AS `role1.users`, `role1`.`createEvent` AS `role1.createEvent`, `role1`.`editEvent` AS `role1.editEvent`, `role1`.`deleteEvent` AS `role1.deleteEvent`, `role1`.`createUser` AS `role1.createUser`, `role1`.`editUser` AS `role1.editUser`, `role1`.`deleteUser` AS `role1.deleteUser`, `role1`.`createCancelation` AS `role1.createCancelation`, `role1`.`deleteCancelation` AS `role1.deleteCancelation`, `role1`.`createAvailability` AS `role1.createAvailability`, `role1`.`editAvailability` AS `role1.editAvailability`, `role1`.`deleteAvailability` AS `role1.deleteAvailability`, `role1`.`viewReport` AS `role1.viewReport`, `role1`.`viewRole` AS `role1.viewRole`, `role1`.`createRole` AS `role1.createRole`, `role1`.`editRole` AS `role1.editRole`, `role1`.`deleteRole` AS `role1.deleteRole`, `role1`.`viewUser` AS `role1.viewUser`, `role1`.`viewAvailability` AS `role1.viewAvailability`, `role1`.`viewCancelation` AS `role1.viewCancelation`, `role1`.`createBranch` AS `role1.createBranch`, `role1`.`editBranch` AS `role1.editBranch`, `role1`.`deleteBranch` AS `role1.deleteBranch`, `role1`.`viewBranch` AS `role1.viewBranch`, `role1`.`createConstraint` AS `role1.createConstraint`, `role1`.`editConstraint` AS `role1.editConstraint`, `role1`.`deleteConstraint` AS `role1.deleteConstraint`, `role1`.`viewConstraint` AS `role1.viewConstraint`, `role1`.`createSubgroup` AS `role1.createSubgroup`, `role1`.`editSubgroup` AS `role1.editSubgroup`, `role1`.`deleteSubgroup` AS `role1.deleteSubgroup`, `role1`.`viewSubgroup` AS `role1.viewSubgroup`, `role1`.`editSubgroups` AS `role1.editSubgroups`, `role1`.`importHash` AS `role1.importHash`, `role1`.`createdAt` AS `role1.createdAt`, `role1`.`updatedAt` AS `role1.updatedAt`, `role1`.`deletedAt` AS `role1.deletedAt`, `role1`.`parentId` AS `role1.parentId`, `role1`.`dataAccessGroupId` AS `role1.dataAccessGroupId`, `role1`.`createdById` AS `role1.createdById`, `role1`.`updatedById` AS `role1.updatedById`, `role2`.`id` AS `role2.id`, `role2`.`name` AS `role2.name`, `role2`.`dataAccess` AS `role2.dataAccess`, `role2`.`statistics` AS `role2.statistics`, `role2`.`constraints` AS `role2.constraints`, `role2`.`events` AS `role2.events`, `role2`.`subgroups` AS `role2.subgroups`, `role2`.`scheduler` AS `role2.scheduler`, `role2`.`availabilities` AS `role2.availabilities`, `role2`.`branches` AS `role2.branches`, `role2`.`cancellations` AS `role2.cancellations`, `role2`.`cancellationtypes` AS `role2.cancellationtypes`, `role2`.`capacityconstraints` AS `role2.capacityconstraints`, `role2`.`clock` AS `role2.clock`, `role2`.`distanceconstraints` AS `role2.distanceconstraints`, `role2`.`eventpair` AS `role2.eventpair`, `role2`.`groupings` AS `role2.groupings`, `role2`.`matches` AS `role2.matches`, `role2`.`nogapsconstraint` AS `role2.nogapsconstraint`, `role2`.`priorities` AS `role2.priorities`, `role2`.`relationships` AS `role2.relationships`, `role2`.`roles` AS `role2.roles`, `role2`.`settings` AS `role2.settings`, `role2`.`settingscompany` AS `role2.settingscompany`, `role2`.`statusevents` AS `role2.statusevents`, `role2`.`timeconstraints` AS `role2.timeconstraints`, `role2`.`timeoff` AS `role2.timeoff`, `role2`.`timeofftypes` AS `role2.timeofftypes`, `role2`.`users` AS `role2.users`, `role2`.`createEvent` AS `role2.createEvent`, `role2`.`editEvent` AS `role2.editEvent`, `role2`.`deleteEvent` AS `role2.deleteEvent`, `role2`.`createUser` AS `role2.createUser`, `role2`.`editUser` AS `role2.editUser`, `role2`.`deleteUser` AS `role2.deleteUser`, `role2`.`createCancelation` AS `role2.createCancelation`, `role2`.`deleteCancelation` AS `role2.deleteCancelation`, `role2`.`createAvailability` AS `role2.createAvailability`, `role2`.`editAvailability` AS `role2.editAvailability`, `role2`.`deleteAvailability` AS `role2.deleteAvailability`, `role2`.`viewReport` AS `role2.viewReport`, `role2`.`viewRole` AS `role2.viewRole`, `role2`.`createRole` AS `role2.createRole`, `role2`.`editRole` AS `role2.editRole`, `role2`.`deleteRole` AS `role2.deleteRole`, `role2`.`viewUser` AS `role2.viewUser`, `role2`.`viewAvailability` AS `role2.viewAvailability`, `role2`.`viewCancelation` AS `role2.viewCancelation`, `role2`.`createBranch` AS `role2.createBranch`, `role2`.`editBranch` AS `role2.editBranch`, `role2`.`deleteBranch` AS `role2.deleteBranch`, `role2`.`viewBranch` AS `role2.viewBranch`, `role2`.`createConstraint` AS `role2.createConstraint`, `role2`.`editConstraint` AS `role2.editConstraint`, `role2`.`deleteConstraint` AS `role2.deleteConstraint`, `role2`.`viewConstraint` AS `role2.viewConstraint`, `role2`.`createSubgroup` AS `role2.createSubgroup`, `role2`.`editSubgroup` AS `role2.editSubgroup`, `role2`.`deleteSubgroup` AS `role2.deleteSubgroup`, `role2`.`viewSubgroup` AS `role2.viewSubgroup`, `role2`.`editSubgroups` AS `role2.editSubgroups`, `role2`.`importHash` AS `role2.importHash`, `role2`.`createdAt` AS `role2.createdAt`, `role2`.`updatedAt` AS `role2.updatedAt`, `role2`.`deletedAt` AS `role2.deletedAt`, `role2`.`parentId` AS `role2.parentId`, `role2`.`dataAccessGroupId` AS `role2.dataAccessGroupId`, `role2`.`createdById` AS `role2.createdById`, `role2`.`updatedById` AS `role2.updatedById`, `role3`.`id` AS `role3.id`, `role3`.`name` AS `role3.name`, `role3`.`dataAccess` AS `role3.dataAccess`, `role3`.`statistics` AS `role3.statistics`, `role3`.`constraints` AS `role3.constraints`, `role3`.`events` AS `role3.events`, `role3`.`subgroups` AS `role3.subgroups`, `role3`.`scheduler` AS `role3.scheduler`, `role3`.`availabilities` AS `role3.availabilities`, `role3`.`branches` AS `role3.branches`, `role3`.`cancellations` AS `role3.cancellations`, `role3`.`cancellationtypes` AS `role3.cancellationtypes`, `role3`.`capacityconstraints` AS `role3.capacityconstraints`, `role3`.`clock` AS `role3.clock`, `role3`.`distanceconstraints` AS `role3.distanceconstraints`, `role3`.`eventpair` AS `role3.eventpair`, `role3`.`groupings` AS `role3.groupings`, `role3`.`matches` AS `role3.matches`, `role3`.`nogapsconstraint` AS `role3.nogapsconstraint`, `role3`.`priorities` AS `role3.priorities`, `role3`.`relationships` AS `role3.relationships`, `role3`.`roles` AS `role3.roles`, `role3`.`settings` AS `role3.settings`, `role3`.`settingscompany` AS `role3.settingscompany`, `role3`.`statusevents` AS `role3.statusevents`, `role3`.`timeconstraints` AS `role3.timeconstraints`, `role3`.`timeoff` AS `role3.timeoff`, `role3`.`timeofftypes` AS `role3.timeofftypes`, `role3`.`users` AS `role3.users`, `role3`.`createEvent` AS `role3.createEvent`, `role3`.`editEvent` AS `role3.editEvent`, `role3`.`deleteEvent` AS `role3.deleteEvent`, `role3`.`createUser` AS `role3.createUser`, `role3`.`editUser` AS `role3.editUser`, `role3`.`deleteUser` AS `role3.deleteUser`, `role3`.`createCancelation` AS `role3.createCancelation`, `role3`.`deleteCancelation` AS `role3.deleteCancelation`, `role3`.`createAvailability` AS `role3.createAvailability`, `role3`.`editAvailability` AS `role3.editAvailability`, `role3`.`deleteAvailability` AS `role3.deleteAvailability`, `role3`.`viewReport` AS `role3.viewReport`, `role3`.`viewRole` AS `role3.viewRole`, `role3`.`createRole` AS `role3.createRole`, `role3`.`editRole` AS `role3.editRole`, `role3`.`deleteRole` AS `role3.deleteRole`, `role3`.`viewUser` AS `role3.viewUser`, `role3`.`viewAvailability` AS `role3.viewAvailability`, `role3`.`viewCancelation` AS `role3.viewCancelation`, `role3`.`createBranch` AS `role3.createBranch`, `role3`.`editBranch` AS `role3.editBranch`, `role3`.`deleteBranch` AS `role3.deleteBranch`, `role3`.`viewBranch` AS `role3.viewBranch`, `role3`.`createConstraint` AS `role3.createConstraint`, `role3`.`editConstraint` AS `role3.editConstraint`, `role3`.`deleteConstraint` AS `role3.deleteConstraint`, `role3`.`viewConstraint` AS `role3.viewConstraint`, `role3`.`createSubgroup` AS `role3.createSubgroup`, `role3`.`editSubgroup` AS `role3.editSubgroup`, `role3`.`deleteSubgroup` AS `role3.deleteSubgroup`, `role3`.`viewSubgroup` AS `role3.viewSubgroup`, `role3`.`editSubgroups` AS `role3.editSubgroups`, `role3`.`importHash` AS `role3.importHash`, `role3`.`createdAt` AS `role3.createdAt`, `role3`.`updatedAt` AS `role3.updatedAt`, `role3`.`deletedAt` AS `role3.deletedAt`, `role3`.`parentId` AS `role3.parentId`, `role3`.`dataAccessGroupId` AS `role3.dataAccessGroupId`, `role3`.`createdById` AS `role3.createdById`, `role3`.`updatedById` AS `role3.updatedById`, `role4`.`id` AS `role4.id`, `role4`.`name` AS `role4.name`, `role4`.`dataAccess` AS `role4.dataAccess`, `role4`.`statistics` AS `role4.statistics`, `role4`.`constraints` AS `role4.constraints`, `role4`.`events` AS `role4.events`, `role4`.`subgroups` AS `role4.subgroups`, `role4`.`scheduler` AS `role4.scheduler`, `role4`.`availabilities` AS `role4.availabilities`, `role4`.`branches` AS `role4.branches`, `role4`.`cancellations` AS `role4.cancellations`, `role4`.`cancellationtypes` AS `role4.cancellationtypes`, `role4`.`capacityconstraints` AS `role4.capacityconstraints`, `role4`.`clock` AS `role4.clock`, `role4`.`distanceconstraints` AS `role4.distanceconstraints`, `role4`.`eventpair` AS `role4.eventpair`, `role4`.`groupings` AS `role4.groupings`, `role4`.`matches` AS `role4.matches`, `role4`.`nogapsconstraint` AS `role4.nogapsconstraint`, `role4`.`priorities` AS `role4.priorities`, `role4`.`relationships` AS `role4.relationships`, `role4`.`roles` AS `role4.roles`, `role4`.`settings` AS `role4.settings`, `role4`.`settingscompany` AS `role4.settingscompany`, `role4`.`statusevents` AS `role4.statusevents`, `role4`.`timeconstraints` AS `role4.timeconstraints`, `role4`.`timeoff` AS `role4.timeoff`, `role4`.`timeofftypes` AS `role4.timeofftypes`, `role4`.`users` AS `role4.users`, `role4`.`createEvent` AS `role4.createEvent`, `role4`.`editEvent` AS `role4.editEvent`, `role4`.`deleteEvent` AS `role4.deleteEvent`, `role4`.`createUser` AS `role4.createUser`, `role4`.`editUser` AS `role4.editUser`, `role4`.`deleteUser` AS `role4.deleteUser`, `role4`.`createCancelation` AS `role4.createCancelation`, `role4`.`deleteCancelation` AS `role4.deleteCancelation`, `role4`.`createAvailability` AS `role4.createAvailability`, `role4`.`editAvailability` AS `role4.editAvailability`, `role4`.`deleteAvailability` AS `role4.deleteAvailability`, `role4`.`viewReport` AS `role4.viewReport`, `role4`.`viewRole` AS `role4.viewRole`, `role4`.`createRole` AS `role4.createRole`, `role4`.`editRole` AS `role4.editRole`, `role4`.`deleteRole` AS `role4.deleteRole`, `role4`.`viewUser` AS `role4.viewUser`, `role4`.`viewAvailability` AS `role4.viewAvailability`, `role4`.`viewCancelation` AS `role4.viewCancelation`, `role4`.`createBranch` AS `role4.createBranch`, `role4`.`editBranch` AS `role4.editBranch`, `role4`.`deleteBranch` AS `role4.deleteBranch`, `role4`.`viewBranch` AS `role4.viewBranch`, `role4`.`createConstraint` AS `role4.createConstraint`, `role4`.`editConstraint` AS `role4.editConstraint`, `role4`.`deleteConstraint` AS `role4.deleteConstraint`, `role4`.`viewConstraint` AS `role4.viewConstraint`, `role4`.`createSubgroup` AS `role4.createSubgroup`, `role4`.`editSubgroup` AS `role4.editSubgroup`, `role4`.`deleteSubgroup` AS `role4.deleteSubgroup`, `role4`.`viewSubgroup` AS `role4.viewSubgroup`, `role4`.`editSubgroups` AS `role4.editSubgroups`, `role4`.`importHash` AS `role4.importHash`, `role4`.`createdAt` AS `role4.createdAt`, `role4`.`updatedAt` AS `role4.updatedAt`, `role4`.`deletedAt` AS `role4.deletedAt`, `role4`.`parentId` AS `role4.parentId`, `role4`.`dataAccessGroupId` AS `role4.dataAccessGroupId`, `role4`.`createdById` AS `role4.createdById`, `role4`.`updatedById` AS `role4.updatedById` FROM `capacityconstraints` AS `capacityconstraints` LEFT OUTER JOIN `users` AS `user1` ON `capacityconstraints`.`user1Id` = `user1`.`id` AND (`user1`.`deletedAt` IS NULL) LEFT OUTER JOIN `users` AS `user2` ON `capacityconstraints`.`user2Id` = `user2`.`id` AND (`user2`.`deletedAt` IS NULL) LEFT OUTER JOIN `users` AS `createdBy` ON `capacityconstraints`.`createdById` = `createdBy`.`id` AND (`createdBy`.`deletedAt` IS NULL) LEFT OUTER JOIN `roles` AS `role1` ON `capacityconstraints`.`role1Id` = `role1`.`id` AND (`role1`.`deletedAt` IS NULL) LEFT OUTER JOIN `roles` AS `role2` ON `capacityconstraints`.`role2Id` = `role2`.`id` AND (`role2`.`deletedAt` IS NULL) LEFT OUTER JOIN `roles` AS `role3` ON `capacityconstraints`.`role3Id` = `role3`.`id` AND (`role3`.`deletedAt` IS NULL) LEFT OUTER JOIN `roles` AS `role4` ON `capacityconstraints`.`role4Id` = `role4`.`id` AND (`role4`.`deletedAt` IS NULL) WHERE (`capacityconstraints`.`deletedAt` IS NULL AND `createdBy`.`companyId` = '" +
      filter.companyId +
      "') ORDER BY `capacityconstraints`.`createdAt` DESC";
    const capacityconstraints = await db.sequelize.query(query, opt);

    return { rows: capacityconstraints, count: capacityconstraints.length };
  }

  static async findAllAutocomplete(query, limit, filter) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike('capacityconstraints', 'user1', query),
        ],
      };
    }

    const records = await db.capacityconstraints.findAll({
      attributes: ['id', 'user1'],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['user1', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.user1,
    }));
  }
};
