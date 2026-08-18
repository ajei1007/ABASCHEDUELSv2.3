const db = require('../models');
const FileDBApi = require('./file');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class BranchgroupsDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const branchgroups = await db.branchgroups.create(
      {
        id: data.id || undefined,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await branchgroups.setBranches(data.branches || [], {
      transaction,
    });

    return branchgroups;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const branchgroups = await db.branchgroups.findByPk(id, {
      transaction,
    });

    await branchgroups.update(
      {
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await branchgroups.setBranches(data.branches || [], {
      transaction,
    });

    return branchgroups;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const branchgroups = await db.branchgroups.findByPk(id, options);

    await branchgroups.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await branchgroups.destroy({
      transaction,
    });

    return branchgroups;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const branchgroups = await db.branchgroups.findOne(
      { where },
      { transaction },
    );

    if (!branchgroups) {
      return branchgroups;
    }

    const output = branchgroups.get({ plain: true });

    output.branches = await branchgroups.getBranches({
      transaction,
    });

    return output;
  }

  static async findAll(filter, options) {
    var limit = filter.limit || 0;
    var offset = 0;
    const currentPage = +filter.page;

    offset = currentPage * limit;

    var orderBy = null;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        model: db.branches,
        as: 'branches',
        through: filter.branches
          ? {
              where: {
                [Op.or]: filter.branches.split('|').map((item) => {
                  return { ['Id']: Utils.uuid(item) };
                }),
              },
            }
          : null,
        required: filter.branches ? true : null,
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

    let { rows, count } = await db.branchgroups.findAndCountAll({
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
          Utils.ilike('branchgroups', 'id', query),
        ],
      };
    }

    const records = await db.branchgroups.findAll({
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

  static async deleteBulkWithChilds(filter, options) {
   
    const transaction = (options && options.transaction) || undefined;
    let where = {
      id: { [Op.in]: filter.Ids },
    };

    if (filter.Ids.length > 0) {
      // delete all childs of branchgroups
      await db.sequelize.query(
        `DELETE FROM branchgroupsBranchesBranches WHERE branchgroupId IN (${filter.Ids.map(
          (id) => `'${id}'`,
        ).join(',')})`,
        { type: db.sequelize.QueryTypes.DELETE },
      );

      // delete all branchgroups
      await db.branchgroups.destroy({
        where,
        force: true,
        transaction,
      });
  
  
    }

    return true
  }

};
