
const db = require('../models');
const FileDBApi = require('./file');const BranchesDBApi = require('./branches')
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class ClockDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const clock = await db.clock.create(
      {
        id: data.id || undefined,

        clockIn: data.clockIn || null,
        clockOut: data.clockOut || null,
        notes: data.notes || null,
        on: data.on || false,

        totalTime: data.totalTime || null,
        long: data.long || null,
        lat: data.lat || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await clock.setUser(data.user || null, {
      transaction,
    });

    await clock.setEvent(data.event || null, {
      transaction,
    });

    return clock;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const clock = await db.clock.findByPk(id, {
      transaction,
    });

    await clock.update(
      {
        clockIn: data.clockIn || null,
        clockOut: data.clockOut || null,
        notes: data.notes || null,
        on: data.on || false,

        totalTime: data.totalTime || null,
        long: data.long || null,
        lat: data.lat || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await clock.setUser(data.user || null, {
      transaction,
    });

    await clock.setEvent(data.event || null, {
      transaction,
    });

    return clock;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const clock = await db.clock.findByPk(id, options);

    await clock.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await clock.destroy({
      transaction,
    });

    return clock;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const clock = await db.clock.findOne({ where }, { transaction });

    if (!clock) {
      return clock;
    }

    const output = clock.get({ plain: true });

    output.user = await clock.getUser({
      transaction,
    });

    output.event = await clock.getEvent({
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
        model: db.users,
        as: 'user',
      },

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

      if (filter.notes) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('clock', 'notes', filter.notes),
        };
      }

      if (filter.clockInRange) {
        const [start, end] = filter.clockInRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            clockIn: {
              ...where.clockIn,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            clockIn: {
              ...where.clockIn,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.clockOutRange) {
        const [start, end] = filter.clockOutRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            clockOut: {
              ...where.clockOut,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            clockOut: {
              ...where.clockOut,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.totalTimeRange) {
        const [start, end] = filter.totalTimeRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            totalTime: {
              ...where.totalTime,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            totalTime: {
              ...where.totalTime,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.longRange) {
        const [start, end] = filter.longRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            long: {
              ...where.long,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            long: {
              ...where.long,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.latRange) {
        const [start, end] = filter.latRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            lat: {
              ...where.lat,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            lat: {
              ...where.lat,
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

      if (filter.on) {
        const isOn = filter.on === 'true';
        where = {
          ...where,
          on: isOn,
        };
      }

      if (filter.user) {
        var listItems = filter.user.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          userId: { [Op.or]: listItems },
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

    let { rows, count } = await db.clock.findAndCountAll({
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
          Utils.ilike('clock', 'user', query),
        ],
      };
    }

    const records = await db.clock.findAll({
      attributes: ['id', 'user'],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['user', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.user,
    }));
  }
};

