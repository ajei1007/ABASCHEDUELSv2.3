
const db = require('../models');
const FileDBApi = require('./file');const BranchesDBApi = require('./branches')
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class TimeoffDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const timeoff = await db.timeoff.create(
      {
        id: data.id || undefined,

        reason: data.reason || null,
        notes: data.notes || null,
        approved: data.approved || false,

        duration: data.duration || null,
        datetimestart: data.datetimestart || null,
        paid: data.paid || null,
        datetimeend: data.datetimeend || null,
        status: data.status || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await timeoff.setUser(data.user || null, {
      transaction,
    });

    await timeoff.setReasontype(data.reasontype || null, {
      transaction,
    });

    return timeoff;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const timeoff = await db.timeoff.findByPk(id, {
      transaction,
    });

    await timeoff.update(
      {
        reason: data.reason || null,
        notes: data.notes || null,
        approved: data.approved || false,

        duration: data.duration || null,
        datetimestart: data.datetimestart || null,
        paid: data.paid || null,
        datetimeend: data.datetimeend || null,
        status: data.status || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await timeoff.setUser(data.user || null, {
      transaction,
    });

    await timeoff.setReasontype(data.reasontype || null, {
      transaction,
    });

    return timeoff;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const timeoff = await db.timeoff.findByPk(id, options);

    await timeoff.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await timeoff.destroy({
      transaction,
    });

    return timeoff;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const timeoff = await db.timeoff.findOne({ where }, { transaction });

    if (!timeoff) {
      return timeoff;
    }

    const output = timeoff.get({ plain: true });

    output.user = await timeoff.getUser({
      transaction,
    });

    output.reasontype = await timeoff.getReasontype({
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
        model: db.timeofftypes,
        as: 'reasontype',
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
          [Op.and]: Utils.ilike('timeoff', 'notes', filter.notes),
        };
      }

      if (filter.durationRange) {
        const [start, end] = filter.durationRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            duration: {
              ...where.duration,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            duration: {
              ...where.duration,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.datetimestartRange) {
        const [start, end] = filter.datetimestartRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            datetimestart: {
              ...where.datetimestart,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            datetimestart: {
              ...where.datetimestart,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.datetimeendRange) {
        const [start, end] = filter.datetimeendRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            datetimeend: {
              ...where.datetimeend,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            datetimeend: {
              ...where.datetimeend,
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

      if (filter.reason) {
        where = {
          ...where,
          reason: filter.reason,
        };
      }

      if (filter.approved) {
        where = {
          ...where,
          approved: filter.approved,
        };
      }

      if (filter.paid) {
        where = {
          ...where,
          paid: filter.paid,
        };
      }

      if (filter.status) {
        where = {
          ...where,
          status: filter.status,
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

      if (filter.reasontype) {
        var listItems = filter.reasontype.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          reasontypeId: { [Op.or]: listItems },
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

    let { rows, count } = await db.timeoff.findAndCountAll({
      where,
      include,
      //limit: limit ? Number(limit) : undefined,
      //offset: offset ? Number(offset) : undefined,
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
          Utils.ilike('timeoff', 'id', query),
        ],
      };
    }

    const records = await db.timeoff.findAll({
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

