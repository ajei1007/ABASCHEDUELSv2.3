const db = require('../models');
const FileDBApi = require('./file');
const BranchesDBApi = require('./branches');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class EventpairDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const eventpair = await db.eventpair.create(
      {
        id: data.id || undefined,

        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await eventpair.setActivity1(data.activity1 || null, {
      transaction,
    });

    await eventpair.setActivity2(data.activity2 || null, {
      transaction,
    });

    await eventpair.setRoles1(data.roles1 || [], {
      transaction,
    });

    await eventpair.setRoles2(data.roles2 || [], {
      transaction,
    });

    return eventpair;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const eventpair = await db.eventpair.findByPk(id, {
      transaction,
    });

    await eventpair.update(
      {
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await eventpair.setActivity1(data.activity1 || null, {
      transaction,
    });

    await eventpair.setActivity2(data.activity2 || null, {
      transaction,
    });

    await eventpair.setRoles1(data.roles1 || [], {
      transaction,
    });

    await eventpair.setRoles2(data.roles2 || [], {
      transaction,
    });

    return eventpair;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const eventpair = await db.eventpair.findByPk(id, options);

    await eventpair.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await eventpair.destroy({
      transaction,
    });

    return eventpair;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const eventpair = await db.eventpair.findOne({ where }, { transaction });

    if (!eventpair) {
      return eventpair;
    }

    const output = eventpair.get({ plain: true });

    output.roles1 = await eventpair.getRoles1({
      transaction,
    });

    output.activity1 = await eventpair.getActivity1({
      transaction,
    });

    output.activity2 = await eventpair.getActivity2({
      transaction,
    });

    output.roles2 = await eventpair.getRoles2({
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
        attributes: ['id', 'companyId'],
        model: db.users,
        as: 'createdBy',
      },

      {
        model: db.users,
        as: 'activity1',
      },

      {
        model: db.users,
        as: 'activity2',
      },

      {
        model: db.roles,
        as: 'roles1',
        through: filter.roles1
          ? {
              where: {
                [Op.or]: filter.roles1.split('|').map((item) => {
                  return { ['Id']: Utils.uuid(item) };
                }),
              },
            }
          : null,
        required: filter.roles1 ? true : null,
      },

      {
        model: db.roles,
        as: 'roles2',
        through: filter.roles2
          ? {
              where: {
                [Op.or]: filter.roles2.split('|').map((item) => {
                  return { ['Id']: Utils.uuid(item) };
                }),
              },
            }
          : null,
        required: filter.roles2 ? true : null,
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      // if (filter.companyId) {
      //   where = {
      //     ...where,
      //     ['$createdBy.companyId$']: Utils.uuid(filter.companyId),
      //   };
      // }

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

      if (filter.activity1) {
        var listItems = filter.activity1.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          activity1Id: { [Op.or]: listItems },
        };
      }

      if (filter.activity2) {
        var listItems = filter.activity2.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          activity2Id: { [Op.or]: listItems },
        };
      }

      if (filter.createdAtRange) {
        const [start, end] = filter.createdAtRange;
        
        if (!where.createdAt) {
          where.createdAt = {};
        }

        // Only add start date if it's valid
        if (start && start !== '' && !isNaN(new Date(start).getTime())) {
          where.createdAt[Op.gte] = new Date(start);
        }

        // Only add end date if it's valid
        if (end && end !== '' && !isNaN(new Date(end).getTime())) {
          where.createdAt[Op.lte] = new Date(end);
        }
      }
    }

    let { rows, count } = await db.eventpair.findAndCountAll({
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
          Utils.ilike('eventpair', 'roles1', query),
        ],
      };
    }

    const records = await db.eventpair.findAll({
      attributes: ['id', 'roles1'],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['roles1', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.roles1,
    }));
  }
};
