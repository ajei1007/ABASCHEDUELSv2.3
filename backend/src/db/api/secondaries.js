
const db = require('../models');
const FileDBApi = require('./file');const BranchesDBApi = require('./branches')
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class SecondariesDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const secondaries = await db.secondaries.create(
      {
        id: data.id || undefined,

        optional: data.optional || false,

        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await secondaries.setPrimary(data.primary || null, {
      transaction,
    });

    await secondaries.setSecondary(data.secondary || null, {
      transaction,
    });

    return secondaries;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const secondaries = await db.secondaries.findByPk(id, {
      transaction,
    });

    await secondaries.update(
      {
        optional: data.optional || false,

        updatedById: currentUser.id,
      },
      { transaction },
    );

    await secondaries.setPrimary(data.primary || null, {
      transaction,
    });

    await secondaries.setSecondary(data.secondary || null, {
      transaction,
    });

    return secondaries;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const secondaries = await db.secondaries.findByPk(id, options);

    await secondaries.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await secondaries.destroy({
      transaction,
    });

    return secondaries;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const secondaries = await db.secondaries.findOne(
      { where },
      { transaction },
    );

    if (!secondaries) {
      return secondaries;
    }

    const output = secondaries.get({ plain: true });

    output.primary = await secondaries.getPrimary({
      transaction,
    });

    output.secondary = await secondaries.getSecondary({
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
        as: 'primary',
      },

      {
        model: db.users,
        as: 'secondary',
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
          active: filter.active === true || filter.active === 'true',
        };
      }

      if (filter.optional) {
        where = {
          ...where,
          optional: filter.optional,
        };
      }

      if (filter.primary) {
        var listItems = filter.primary.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          primaryId: { [Op.or]: listItems },
        };
      }

      if (filter.secondary) {
        var listItems = filter.secondary.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          secondaryId: { [Op.or]: listItems },
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

    let { rows, count } = await db.secondaries.findAndCountAll({
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
          Utils.ilike('secondaries', 'primary', query),
        ],
      };
    }

    const records = await db.secondaries.findAll({
      attributes: ['id', 'primary'],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['primary', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.primary,
    }));
  }
};

