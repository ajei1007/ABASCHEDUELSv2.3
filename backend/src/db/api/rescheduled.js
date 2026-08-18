
const db = require('../models');
const FileDBApi = require('./file');const BranchesDBApi = require('./branches')
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class RescheduledDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const rescheduled = await db.rescheduled.create(
      {
        id: data.id || undefined,

        startDatetime: data.startDatetime || null,
        rescheduled: data.rescheduled || false,

        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await rescheduled.setEvent(data.event || null, {
      transaction,
    });

    return rescheduled;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const rescheduled = await db.rescheduled.findByPk(id, {
      transaction,
    });

    await rescheduled.update(
      {
        startDatetime: data.startDatetime || null,
        rescheduled: data.rescheduled || false,

        updatedById: currentUser.id,
      },
      { transaction },
    );

    await rescheduled.setEvent(data.event || null, {
      transaction,
    });

    return rescheduled;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const rescheduled = await db.rescheduled.findByPk(id, options);

    await rescheduled.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await rescheduled.destroy({
      transaction,
    });

    return rescheduled;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const rescheduled = await db.rescheduled.findOne(
      { where },
      { transaction },
    );

    if (!rescheduled) {
      return rescheduled;
    }

    const output = rescheduled.get({ plain: true });

    output.event = await rescheduled.getEvent({
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

    var orderBy = null;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        model: db.events,
        as: 'event',
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.startDatetimeRange) {
        const [start, end] = filter.startDatetimeRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            startDatetime: {
              ...where.startDatetime,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            startDatetime: {
              ...where.startDatetime,
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

      if (filter.rescheduled) {
        where = {
          ...where,
          rescheduled: filter.rescheduled,
        };
      }

      if (filter.event) {
        var listItems = filter.event.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          eventId: { [Op.or]: listItems },
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

    let { rows, count } = await db.rescheduled.findAndCountAll({
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

    //    rows = await this._fillWithRelationsAndFilesForRows(
    //      rows,
    //      options,
    //    );

    return { rows, count };
  }

  static async findAllAutocomplete(query, limit) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike('rescheduled', 'id', query),
        ],
      };
    }

    const records = await db.rescheduled.findAll({
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

