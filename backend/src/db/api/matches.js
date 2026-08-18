
const db = require('../models');
const FileDBApi = require('./file');const BranchesDBApi = require('./branches')
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class MatchesDBApi {

  static async create(data, options) {
  const currentUser = (options && options.currentUser) || { id: null };
  const transaction = (options && options.transaction) || undefined;

  const matches = await db.matches.create(
  {
  id: data.id || undefined,

    compatible: data.compatible
    ||
    false

,

  importHash: data.importHash || null,
  createdById: currentUser.id,
  updatedById: currentUser.id,
  },
  { transaction },
  );

    await matches.setUser1(data.user1 || null, {
    transaction,
    });

    await matches.setUser2(data.user2 || null, {
    transaction,
    });

  return matches;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || {id: null};
    const transaction = (options && options.transaction) || undefined;

    const matches = await db.matches.findByPk(id, {
      transaction,
    });

    await matches.update(
      {

        compatible: data.compatible
        ||
        false

,

        updatedById: currentUser.id,
      },
      {transaction},
    );

    await matches.setUser1(data.user1 || null, {
      transaction,
    });

    await matches.setUser2(data.user2 || null, {
      transaction,
    });

    return matches;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || {id: null};
    const transaction = (options && options.transaction) || undefined;

    const matches = await db.matches.findByPk(id, options);

    await matches.update({
      deletedBy: currentUser.id
    }, {
      transaction,
    });

    await matches.destroy({
      transaction
    });

    return matches;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const matches = await db.matches.findOne(
      { where },
      { transaction },
    );

    if (!matches) {
      return matches;
    }

    const output = matches.get({plain: true});

    output.user1 = await matches.getUser1({
      transaction
    });

    output.user2 = await matches.getUser2({
      transaction
    });

    return output;
  }

  static async findAll(filter, options) {
    // if(filter.branches){
    //   filter.branches = await BranchesDBApi.getBranchStructures({
    //     companyId: filter.companyId,
    //     branchIds: filter.branches
    //   });
    // }
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
        attributes: ['id', 'firstName'],
        as: 'user1',
      },
      {
        model: db.users,
        attributes: ['id', 'firstName'],
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

      if (filter.compatible) {
        where = {
          ...where,
          compatible: filter.compatible,
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

    let { rows, count } = await db.matches.findAndCountAll(
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

    return { rows, count };
  }

  static async findAllAutocomplete(query, limit,filter) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike(
            'matches',
            'user1',
            query,
          ),
        ],
      };
    }

    const records = await db.matches.findAll({
      attributes: [ 'id', 'user1' ],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['user1', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.user1,
    }));
  }

};

