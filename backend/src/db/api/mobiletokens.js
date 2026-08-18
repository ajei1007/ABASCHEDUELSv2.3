const db = require('../models');
const BranchesDBApi = require('./branches');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class MobiletokensDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const mobiletokens = await db.mobiletokens.create(
      {
        id: data.id || undefined,

        token: data.token || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await mobiletokens.setUsers(data.users || [], {
      transaction,
    });

    return mobiletokens;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const mobiletokens = await db.mobiletokens.findByPk(id, {
      transaction,
    });

    await mobiletokens.update(
      {
        token: data.token || null,
        updatedById: currentUser.id,
        createdById: currentUser.id,
      },
      { transaction },
    );

    await mobiletokens.setUsers(data.users || [], {
      transaction,
    });

    return mobiletokens;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const mobiletokens = await db.mobiletokens.findByPk(id, options);

    await mobiletokens.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await mobiletokens.destroy({
      transaction,
    });

    return mobiletokens;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const mobiletokens = await db.mobiletokens.findOne(
      { where },
      { transaction },
    );

    if (!mobiletokens) {
      return mobiletokens;
    }

    const output = mobiletokens.get({ plain: true });

    output.users = await mobiletokens.getUsers({
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
        as: 'createdBy',
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.token) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('mobiletokens', 'token', filter.token),
        };
      }

      if (filter.users) {
        where = {
          ...where,
          createdById: { [Op.or]: filter.users.split('|') },
        };
      }

      if (filter.username) {
        where = {
          ...where,
          [Op.or]: [
            Utils.ilike('createdBy', 'firstName', filter.username),
            Utils.ilike('createdBy', 'lastName', filter.username)
          ],
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

    let { rows, count } = await db.mobiletokens.findAndCountAll({
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


    // make the response same as before
    for (let i = 0; i < rows.length; i++) {
      rows[i].dataValues.users = new Array()
      rows[i].dataValues.users.push(rows[i].dataValues.createdBy)
    }

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
          Utils.ilike('mobiletokens', 'id', query),
        ],
      };
    }

    const records = await db.mobiletokens.findAll({
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
