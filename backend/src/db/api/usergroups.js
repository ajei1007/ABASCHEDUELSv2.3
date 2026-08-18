const db = require('../models');
const FileDBApi = require('./file');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class UsergroupsDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const usergroups = await db.usergroups.create(
      {
        id: data.id || undefined,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await usergroups.setUsers(data.users || [], {
      transaction,
    });

    return usergroups;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const usergroups = await db.usergroups.findByPk(id, {
      transaction,
    });

    await usergroups.update(
      {
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await usergroups.setUsers(data.users || [], {
      transaction,
    });

    return usergroups;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const usergroups = await db.usergroups.findByPk(id, options);

    await usergroups.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await usergroups.destroy({
      transaction,
    });

    return usergroups;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const usergroups = await db.usergroups.findOne({ where }, { transaction });

    if (!usergroups) {
      return usergroups;
    }

    const output = usergroups.get({ plain: true });

    output.users = await usergroups.getUsers({
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
        model: db.users,
        as: 'users',
        through: filter.users
          ? {
              where: {
                [Op.or]: filter.users.split('|').map((item) => {
                  return { ['Id']: Utils.uuid(item) };
                }),
              },
            }
          : null,
        required: filter.users ? true : null,
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

    let { rows, count } = await db.usergroups.findAndCountAll({
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
          Utils.ilike('usergroups', 'id', query),
        ],
      };
    }

    const records = await db.usergroups.findAll({
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
      // delete all childs of usergroups
      await db.sequelize.query(
        `DELETE FROM usergroupsUsersUsers WHERE usergroupId IN (${filter.Ids.map(
          (id) => `'${id}'`,
        ).join(',')})`,
        { type: db.sequelize.QueryTypes.DELETE },
      );

      // delete all usergrops
      await db.usergroups.destroy({
        where,
        force: true,
        transaction,
      });
    }
    return true;
  }
};
