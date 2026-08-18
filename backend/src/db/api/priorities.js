const db = require('../models');
const BranchesDBApi = require('./branches');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class PrioritiesDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const priorities = await db.priorities.create(
      {
        id: data.id || undefined,

        rank: data.rank || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await priorities.setUser1(data.user1 || null, {
      transaction,
    });

    await priorities.setUser2(data.user2 || null, {
      transaction,
    });

    return priorities;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const priorities = await db.priorities.findByPk(id, {
      transaction,
    });

    await priorities.update(
      {
        rank: data.rank || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await priorities.setUser1(data.user1 || null, {
      transaction,
    });

    await priorities.setUser2(data.user2 || null, {
      transaction,
    });

    return priorities;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const priorities = await db.priorities.findByPk(id, options);

    await priorities.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await priorities.destroy({
      transaction,
    });

    return priorities;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const priorities = await db.priorities.findOne({ where }, { transaction });

    if (!priorities) {
      return priorities;
    }

    const output = priorities.get({ plain: true });

    output.user1 = await priorities.getUser1({
      transaction,
    });

    output.user2 = await priorities.getUser2({
      transaction,
    });

    return output;
  }

  static async findAll(filter, options) {
    // if (filter.branches) {
    //   filter.branches = await BranchesDBApi.getBranchStructures({
    //     companyId: filter.companyId,
    //     branchIds: filter.branches
    //   });
    // }
    let limitOffset = Utils.getLimitOffset(filter.limit, filter.page)

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

      if (filter.rankRange) {
        const [start, end] = filter.rankRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            rank: {
              ...where.rank,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            rank: {
              ...where.rank,
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

    let queryOptions ={
      where,
      include,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
    }

    if (limitOffset.lim >=0 && limitOffset.off >=0){
      queryOptions.limit = limitOffset.lim;
      queryOptions.offset = limitOffset.off;
    }

    let { rows, count } = await db.priorities.findAndCountAll(queryOptions);

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
        model: db.users,
        as: 'user1',
        attributes: ['id', 'firstName'],
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

      if (filter.rankRange) {
        const [start, end] = filter.rankRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            rank: {
              ...where.rank,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            rank: {
              ...where.rank,
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

    // let { rows, count } = await db.priorities.findAndCountAll(
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
    db.priorities._validateIncludedElements(opt);
    const query =
      'SELECT `priorities`.`id`, `priorities`.`rank`, `priorities`.`importHash`, `priorities`.`createdAt`, `priorities`.`updatedAt`, `priorities`.`deletedAt`, `priorities`.`user1Id`, `priorities`.`user2Id`, `priorities`.`createdById`, `priorities`.`updatedById`, `user1`.`id` AS `user1.id`, `user1`.`firstName` AS `user1.firstName`, `user2`.`id` AS `user2.id`, `user2`.`firstName` AS `user2.firstName` FROM `priorities` AS `priorities` LEFT OUTER JOIN `users` AS `user1` ON `priorities`.`user1Id` = `user1`.`id` AND (`user1`.`deletedAt` IS NULL) LEFT OUTER JOIN `users` AS `user2` ON `priorities`.`user2Id` = `user2`.`id` AND (`user2`.`deletedAt` IS NULL) WHERE `priorities`.`deletedAt` IS NULL ORDER BY `priorities`.`createdAt` DESC';
    const priorities = await db.sequelize.query(query, opt);

    return { rows: priorities, count: priorities.length };
  }

  static async findAllAutocomplete(query, limit, filter) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike('priorities', 'user1', query),
        ],
      };
    }

    const records = await db.priorities.findAll({
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
