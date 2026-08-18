
const db = require('../models');
const FileDBApi = require('./file');const BranchesDBApi = require('./branches')
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class FundersDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const funders = await db.funders.create(
      {
        id: data.id || undefined,

        name: data.name || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await funders.setType(data.type || null, {
      transaction,
    });

    await funders.setCodeType(data.codeType || null, {
      transaction,
    });

    return funders;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const funders = await db.funders.findByPk(id, {
      transaction,
    });

    await funders.update(
      {
        name: data.name || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await funders.setType(data.type || null, {
      transaction,
    });

    await funders.setCodeType(data.codeType || null, {
      transaction,
    });

    return funders;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const funders = await db.funders.findByPk(id, options);

    await funders.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await funders.destroy({
      transaction,
    });

    return funders;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const funders = await db.funders.findOne({ where }, { transaction });

    if (!funders) {
      return funders;
    }

    const output = funders.get({ plain: true });

    output.type = await funders.getType({
      transaction,
    });

    output.codeType = await funders.getCodeType({
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
        model: db.funderstype,
        as: 'type',
      },

      {
        model: db.codetype,
        as: 'codeType',
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.name) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('funders', 'name', filter.name),
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

      if (filter.type) {
        var listItems = filter.type.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          typeId: { [Op.or]: listItems },
        };
      }

      if (filter.codeType) {
        var listItems = filter.codeType.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          codeTypeId: { [Op.or]: listItems },
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

    let { rows, count } = await db.funders.findAndCountAll({
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
          Utils.ilike('funders', 'name', query),
        ],
      };
    }

    const records = await db.funders.findAll({
      attributes: ['id', 'name'],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['name', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.name,
    }));
  }
};

