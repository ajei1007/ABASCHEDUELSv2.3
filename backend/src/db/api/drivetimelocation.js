
const db = require('../models');
const FileDBApi = require('./file');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class DrivetimelocationDBApi {

  static async create(data, options) {
  const currentUser = (options && options.currentUser) || { id: null };
  const transaction = (options && options.transaction) || undefined;

  const drivetimelocation = await db.drivetimelocation.create(
  {
  id: data.id || undefined,

    time: data.time
    ||
    null
,

  importHash: data.importHash || null,
  createdById: currentUser.id,
  updatedById: currentUser.id,
  },
  { transaction },
  );

    await drivetimelocation.setLocation1(data.location1 || null, {
    transaction,
    });

    await drivetimelocation.setLocation2(data.location2 || null, {
    transaction,
    });

  return drivetimelocation;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || {id: null};
    const transaction = (options && options.transaction) || undefined;

    const drivetimelocation = await db.drivetimelocation.findByPk(id, {
      transaction,
    });

    await drivetimelocation.update(
      {

        time: data.time
        ||
        null
,

        updatedById: currentUser.id,
      },
      {transaction},
    );

    await drivetimelocation.setLocation1(data.location1 || null, {
      transaction,
    });

    await drivetimelocation.setLocation2(data.location2 || null, {
      transaction,
    });

    return drivetimelocation;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || {id: null};
    const transaction = (options && options.transaction) || undefined;

    const drivetimelocation = await db.drivetimelocation.findByPk(id, options);

    await drivetimelocation.update({
      deletedBy: currentUser.id
    }, {
      transaction,
    });

    await drivetimelocation.destroy({
      transaction
    });

    return drivetimelocation;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const drivetimelocation = await db.drivetimelocation.findOne(
      { where },
      { transaction },
    );

    if (!drivetimelocation) {
      return drivetimelocation;
    }

    const output = drivetimelocation.get({plain: true});

    output.location1 = await drivetimelocation.getLocation1({
      transaction
    });

    output.location2 = await drivetimelocation.getLocation2({
      transaction
    });

    return output;
  }

  static async findAll(filter, options) {
    let limitOffset = Utils.getLimitOffset(filter.limit, filter.page);
    const transaction = (options && options.transaction) || undefined;

    let where = {};
    let include = [

      {
        model: db.users,
        as: 'location1',
      },

      {
        model: db.users,
        as: 'location2',
      },

    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.timeRange) {
        const [start, end] = filter.timeRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            time: {
              ...where.time,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            time: {
              ...where.time,
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

      if (filter.location1) {
        var listItems = filter.location1.split('|').map(item => {
          return  Utils.uuid(item)
        });

        where = {
          ...where,
          location1Id: {[Op.or]: listItems}
        };
      }

      if (filter.location2) {
        var listItems = filter.location2.split('|').map(item => {
          return  Utils.uuid(item)
        });

        where = {
          ...where,
          location2Id: {[Op.or]: listItems}
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

    let queryOptions = {
      where,
      include,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
    };
    if (limitOffset.lim >= 0 && limitOffset.off >= 0) {
      queryOptions.limit = limitOffset.lim;
      queryOptions.offset = limitOffset.off;
    }

    let { rows, count } = await db.drivetimelocation.findAndCountAll(queryOptions);

    return { rows, count };
  }

  static async findAllAutocomplete(query, limit) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike(
            'drivetimelocation',
            'id',
            query,
          ),
        ],
      };
    }

    const records = await db.drivetimelocation.findAll({
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

