const db = require('../models');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class SubgroupgroupsDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const subgroupgroups = await db.subgroupgroups.create(
      {
        id: data.id || undefined,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await subgroupgroups.setSubgroups(data.subgroups || [], {
      transaction,
    });

    return subgroupgroups;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const subgroupgroups = await db.subgroupgroups.findByPk(id, {
      transaction,
    });

    await subgroupgroups.update(
      {
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await subgroupgroups.setSubgroups(data.subgroups || [], {
      transaction,
    });

    return subgroupgroups;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const subgroupgroups = await db.subgroupgroups.findByPk(id, options);

    await subgroupgroups.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await subgroupgroups.destroy({
      transaction,
    });

    return subgroupgroups;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const subgroupgroups = await db.subgroupgroups.findOne(
      { where },
      { transaction },
    );

    if (!subgroupgroups) {
      return subgroupgroups;
    }

    const output = subgroupgroups.get({ plain: true });

    output.subgroups = await subgroupgroups.getSubgroups({
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
        model: db.subgroups,
        as: 'subgroups',
        through: filter.subgroups
          ? {
              where: {
                [Op.or]: filter.subgroups.split('|').map((item) => {
                  return { ['Id']: Utils.uuid(item) };
                }),
              },
            }
          : null,
        required: filter.subgroups ? true : null,
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

    let { rows, count } = await db.subgroupgroups.findAndCountAll({
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
          Utils.ilike('subgroupgroups', 'id', query),
        ],
      };
    }

    const records = await db.subgroupgroups.findAll({
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
      // delete all childs of subgroupgroups
      await db.sequelize.query(
        `DELETE FROM subgroupgroupsSubgroupsSubgroups WHERE subgroupgroupId IN (${filter.Ids.map(
          (id) => `'${id}'`,
        ).join(',')})`,
        { type: db.sequelize.QueryTypes.DELETE },
      );

      // delete all subgroupgroups
      await db.subgroupgroups.destroy({
        where,
        force: true,
        transaction,
      });
  
    }

    return true
  }

};
