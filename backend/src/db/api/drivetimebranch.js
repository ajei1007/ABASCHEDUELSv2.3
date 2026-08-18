const db = require('../models');
const FileDBApi = require('./file');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class DrivetimebranchDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const drivetimebranch = await db.drivetimebranch.create(
      {
        id: data.id || undefined,

        time: data.time || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await drivetimebranch.setBranch1(data.branch1 || null, {
      transaction,
    });

    await drivetimebranch.setBranch2(data.branch2 || null, {
      transaction,
    });

    return drivetimebranch;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const drivetimebranch = await db.drivetimebranch.findByPk(id, {
      transaction,
    });

    await drivetimebranch.update(
      {
        time: data.time || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await drivetimebranch.setBranch1(data.branch1 || null, {
      transaction,
    });

    await drivetimebranch.setBranch2(data.branch2 || null, {
      transaction,
    });

    return drivetimebranch;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const drivetimebranch = await db.drivetimebranch.findByPk(id, options);

    await drivetimebranch.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await drivetimebranch.destroy({
      transaction,
    });

    return drivetimebranch;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const drivetimebranch = await db.drivetimebranch.findOne(
      { where },
      { transaction },
    );

    if (!drivetimebranch) {
      return drivetimebranch;
    }

    const output = drivetimebranch.get({ plain: true });

    output.branch1 = await drivetimebranch.getBranch1({
      transaction,
    });

    output.branch2 = await drivetimebranch.getBranch2({
      transaction,
    });

    return output;
  }

  static async findAll(filter, options) {
    let limitOffset = Utils.getLimitOffset(filter.limit, filter.page);

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        model: db.branches,
        as: 'branch1',
      },

      {
        model: db.branches,
        as: 'branch2',
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.timeRange) {
        const [start, end] = filter.timeRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            time: {
              ...where.time,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            time: {
              ...where.time,
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

      if (filter.branch1) {
        var listItems = filter.branch1.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          branch1Id: { [Op.or]: listItems },
        };
      }

      if (filter.branch2) {
        var listItems = filter.branch2.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          branch2Id: { [Op.or]: listItems },
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

    let { rows, count } = await db.drivetimebranch.findAndCountAll(queryOptions);

    return { rows, count };
  }

  static async findAllAutocomplete(query, limit) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike('drivetimebranch', 'id', query),
        ],
      };
    }

    const records = await db.drivetimebranch.findAll({
      attributes: ['id', 'id'],
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
