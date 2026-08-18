
const db = require('../models');
const FileDBApi = require('./file');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class PricingDBApi {

  static async create(data, options) {
  const currentUser = (options && options.currentUser) || { id: null };
  const transaction = (options && options.transaction) || undefined;

  const pricing = await db.pricing.create(
  {
  id: data.id || undefined,

    incoming: data.incoming
    ||
    null
,

    outgoing: data.outgoing
    ||
    null
,

    unit: data.unit
    ||
    null
,

  importHash: data.importHash || null,
  createdById: currentUser.id,
  updatedById: currentUser.id,
  },
  { transaction },
  );

    await pricing.setUser1(data.user1 || null, {
    transaction,
    });

    await pricing.setUser2(data.user2 || null, {
    transaction,
    });

  return pricing;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || {id: null};
    const transaction = (options && options.transaction) || undefined;

    const pricing = await db.pricing.findByPk(id, {
      transaction,
    });

    await pricing.update(
      {

        incoming: data.incoming
        ||
        null
,

        outgoing: data.outgoing
        ||
        null
,

        unit: data.unit
        ||
        null
,

        updatedById: currentUser.id,
      },
      {transaction},
    );

    await pricing.setUser1(data.user1 || null, {
      transaction,
    });

    await pricing.setUser2(data.user2 || null, {
      transaction,
    });

    return pricing;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || {id: null};
    const transaction = (options && options.transaction) || undefined;

    const pricing = await db.pricing.findByPk(id, options);

    await pricing.update({
      deletedBy: currentUser.id
    }, {
      transaction,
    });

    await pricing.destroy({
      transaction
    });

    return pricing;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const pricing = await db.pricing.findOne(
      { where },
      { transaction },
    );

    if (!pricing) {
      return pricing;
    }

    const output = pricing.get({plain: true});

    output.user1 = await pricing.getUser1({
      transaction
    });

    output.user2 = await pricing.getUser2({
      transaction
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
        as: 'user1',
      },

      {
        model: db.users,
        as: 'user2',
      },

    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.incomingRange) {
        const [start, end] = filter.incomingRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            incoming: {
              ...where.incoming,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            incoming: {
              ...where.incoming,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.outgoingRange) {
        const [start, end] = filter.outgoingRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            outgoing: {
              ...where.outgoing,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            outgoing: {
              ...where.outgoing,
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
          active:
            filter.active === true ||
            filter.active === 'true',
        };
      }

      if (filter.unit) {
        where = {
          ...where,
          unit: filter.unit,
        };
      }

      if (filter.user1) {
        var listItems = filter.user1.split('|').map(item => {
          return  Utils.uuid(item)
        });

        where = {
          ...where,
          user1Id: {[Op.or]: listItems}
        };
      }

      if (filter.user2) {
        var listItems = filter.user2.split('|').map(item => {
          return  Utils.uuid(item)
        });

        where = {
          ...where,
          user2Id: {[Op.or]: listItems}
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

    let { rows, count } = await db.pricing.findAndCountAll(
      {
        where,
        include,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
        order: (filter.field && filter.sort)
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
        transaction,
      },
    );

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
          Utils.ilike(
            'pricing',
            'id',
            query,
          ),
        ],
      };
    }

    const records = await db.pricing.findAll({
      attributes: [ 'id', 'id' ],
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

