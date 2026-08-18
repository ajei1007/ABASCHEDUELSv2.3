
const db = require('../models');
const FileDBApi = require('./file');const BranchesDBApi = require('./branches')
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class ExclusionsDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const exclusions = await db.exclusions.create(
      {
        id: data.id || undefined,

        datetime: data.datetime || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await exclusions.setEvent(data.event || null, {
      transaction,
    });

    return exclusions;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const exclusions = await db.exclusions.findByPk(id, {
      transaction,
    });

    await exclusions.update(
      {
        datetime: data.datetime || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await exclusions.setEvent(data.event || null, {
      transaction,
    });

    return exclusions;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const exclusions = await db.exclusions.findByPk(id, options);

    await exclusions.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await exclusions.destroy({
      transaction,
    });

    return exclusions;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const exclusions = await db.exclusions.findOne({ where }, { transaction });

    if (!exclusions) {
      return exclusions;
    }

    const output = exclusions.get({ plain: true });

    output.event = await exclusions.getEvent({
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

      if (filter.datetimeRange) {
        const [start, end] = filter.datetimeRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            datetime: {
              ...where.datetime,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            datetime: {
              ...where.datetime,
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

    let { rows, count } = await db.exclusions.findAndCountAll({
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

  static async findAllAutocomplete(query, limit, filter) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike('exclusions', 'event', query),
        ],
      };
    }

    const records = await db.exclusions.findAll({
      attributes: ['id', 'event'],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['event', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.event,
    }));
  }
};

