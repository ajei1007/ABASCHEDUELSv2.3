const db = require('../models');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class RolegroupsDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const rolegroups = await db.rolegroups.create(
      {
        id: data.id || undefined,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await rolegroups.setRoles(data.roles || [], {
      transaction,
    });

    return rolegroups;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const rolegroups = await db.rolegroups.findByPk(id, {
      transaction,
    });

    await rolegroups.update(
      {
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await rolegroups.setRoles(data.roles || [], {
      transaction,
    });

    return rolegroups;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const rolegroups = await db.rolegroups.findByPk(id, options);

    await rolegroups.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await rolegroups.destroy({
      transaction,
    });

    return rolegroups;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const rolegroups = await db.rolegroups.findOne({ where }, { transaction });

    if (!rolegroups) {
      return rolegroups;
    }

    const output = rolegroups.get({ plain: true });

    output.roles = await rolegroups.getRoles({
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
        model: db.roles,
        as: 'roles',
        through: filter.roles
          ? {
              where: {
                [Op.or]: filter.roles.split('|').map((item) => {
                  return { ['Id']: Utils.uuid(item) };
                }),
              },
            }
          : null,
        required: filter.roles ? true : null,
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

    let { rows, count } = await db.rolegroups.findAndCountAll({
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
          Utils.ilike('rolegroups', 'id', query),
        ],
      };
    }

    const records = await db.rolegroups.findAll({
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
      // delete all childs of rolegroups
      await db.sequelize.query(
        `DELETE FROM rolegroupsRolesRoles WHERE rolegroupId IN (${filter.Ids.map(
          (id) => `'${id}'`,
        ).join(',')})`,
        { type: db.sequelize.QueryTypes.DELETE },
      );

      // delete all rolegroups
      await db.rolegroups.destroy({
        where,
        force: true,
        transaction,
      });
  
    }

    return true
  }
};
