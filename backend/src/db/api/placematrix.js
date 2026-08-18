
const db = require('../models');
const FileDBApi = require('./file');const BranchesDBApi = require('./branches')
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class PlacematrixDBApi {

  static async create(data, options) {
  const currentUser = (options && options.currentUser) || { id: null };
  const transaction = (options && options.transaction) || undefined;

  const placematrix = await db.placematrix.create(
  {
  id: data.id || undefined,

    address: data.address
    ||
    null
,

    long: data.long
    ||
    null
,

    lat: data.lat
    ||
    null
,

  importHash: data.importHash || null,
  createdById: currentUser.id,
  updatedById: currentUser.id,
  },
  { transaction },
  );

  return placematrix;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || {id: null};
    const transaction = (options && options.transaction) || undefined;

    const placematrix = await db.placematrix.findByPk(id, {
      transaction,
    });

    await placematrix.update(
      {

        address: data.address
        ||
        null
,

        long: data.long
        ||
        null
,

        lat: data.lat
        ||
        null
,

        updatedById: currentUser.id,
      },
      {transaction},
    );

    return placematrix;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || {id: null};
    const transaction = (options && options.transaction) || undefined;

    const placematrix = await db.placematrix.findByPk(id, options);

    await placematrix.update({
      deletedBy: currentUser.id
    }, {
      transaction,
    });

    await placematrix.destroy({
      transaction
    });

    return placematrix;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const placematrix = await db.placematrix.findOne(
      { where },
      { transaction },
    );

    if (!placematrix) {
      return placematrix;
    }

    const output = placematrix.get({plain: true});

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

    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.address) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'placematrix',
            'address',
            filter.address,
          ),
        };
      }

      if (filter.longRange) {
        const [start, end] = filter.longRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            long: {
              ...where.long,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            long: {
              ...where.long,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.latRange) {
        const [start, end] = filter.latRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            lat: {
              ...where.lat,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            lat: {
              ...where.lat,
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

    let { rows, count } = await db.placematrix.findAndCountAll(
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

  static async findAllAutocomplete(query, limit,filter) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike(
            'placematrix',
            'address',
            query,
          ),
        ],
      };
    }

    const records = await db.placematrix.findAll({
      attributes: [ 'id', 'address' ],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['address', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.address,
    }));
  }

};

