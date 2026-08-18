
const db = require('../models');
const FileDBApi = require('./file');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class PushnotificationsDBApi {

  static async create(data, options) {
  const currentUser = (options && options.currentUser) || { id: null };
  const transaction = (options && options.transaction) || undefined;

  const pushnotifications = await db.pushnotifications.create(
  {
  id: data.id || undefined,

    date: data.date
    ||
    null
,

    message: data.message
    ||
    null
,

    checked: data.checked
    ||
    false

,

    notificationType: data.notificationType || 'Default',

  importHash: data.importHash || null,
  createdById: currentUser.id,
  updatedById: currentUser.id,
  },
  { transaction },
  );

    await pushnotifications.setEvent(data.event || null, {
    transaction,
    });

    await pushnotifications.setUsers(data.users || [], {
    transaction,
    });

  return pushnotifications;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const pushnotifications = await db.pushnotifications.findByPk(id, {
      transaction,
    });

    await pushnotifications.update(
      {
        date: data.date
          ||
          null
        ,
        message: data.message
          ||
          null
        ,
        checked: data.checked
          ||
          false
        ,
        updatedById: currentUser.id,

        notificationType: data.notificationType || 'Default',
      },
      { transaction },
    );

    await pushnotifications.setEvent(data.event || null, {
      transaction,
    });

    await pushnotifications.setUsers(data.users || [], {
      transaction,
    });

    return pushnotifications;
  }

  static async checkBulk(ids, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    await db.pushnotifications.update(
      { 
        checked: true,
        updatedById: currentUser.id
      },
      {
        where: {
          id: {
            [Op.in]: ids
          }
        },
        transaction,
      }
    );
  
    return true
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || {id: null};
    const transaction = (options && options.transaction) || undefined;

    const pushnotifications = await db.pushnotifications.findByPk(id, options);

    await pushnotifications.update({
      deletedBy: currentUser.id
    }, {
      transaction,
    });

    await pushnotifications.destroy({
      transaction
    });

    return pushnotifications;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const pushnotifications = await db.pushnotifications.findOne(
      { where },
      { transaction },
    );

    if (!pushnotifications) {
      return pushnotifications;
    }

    const output = pushnotifications.get({plain: true});

    output.event = await pushnotifications.getEvent({
      transaction
    });

    output.users = await pushnotifications.getUsers({
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
        model: db.events,
        as: 'event',
        attributes: ['id', 'startRecur', 'endRecur', 'start', 'end'],
      },
      {
        attributes: ['id', 'firstName', 'lastName'],
        model: db.users,
        as: 'createdBy',
      },
      {
        model: db.users,
        as: 'users',
        attributes: ['id', 'firstName', 'lastName'],
        through: filter.users ? { where: {
          [Op.or]: filter.users.split('|').map(item => {
            return { ['userId']: Utils.uuid(item) }
          })
        }} : null,
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

      if (filter.message) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'pushnotifications',
            'message',
            filter.message,
          ),
        };
      }

      if (filter.dateRange) {
        const [start, end] = filter.dateRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            date: {
              ...where.date,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            date: {
              ...where.date,
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

      if (filter.checked) {
        where = {
          ...where,
          checked: filter.checked,
        };
      }

      if (filter.event) {
        var listItems = filter.event.split('|').map(item => {
          return  Utils.uuid(item)
        });

        where = {
          ...where,
          eventId: {[Op.or]: listItems}
        };
      }

      if (filter.createdAtRange) {
        const [start, end] = filter.createdAtRange;

        if (start !== undefined && start !== null && start !== '') {
          const _decodedStart = decodeURIComponent(start);
          const __decodedStart = decodeURIComponent(_decodedStart);
          where = {
            ...where,
            ['createdAt']: {
              ...where.createdAt,
              [Op.gte]: __decodedStart,
            },
          };
        }
        if (end !== undefined && end !== null && end !== '') {
          const _decodedEnd = decodeURIComponent(end);
          const __decodedEnd = decodeURIComponent(_decodedEnd);
          where = {
            ...where,
            ['createdAt']: {
              ...where.createdAt,
              [Op.lte]: __decodedEnd,
            },
          };
        }
      }
    }
    // If no pagination parameters, use findAll (no count needed)
    if (!limit) {
      let rows = await db.pushnotifications.findAll(
        {
          where,
          include,
          order: (filter.field && filter.sort)
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
          transaction,
        },
      );

      rows.forEach((row) => {
        row.setDataValue('sender', row.get('createdBy'));
        delete row.dataValues.createdBy
      });
      return { rows, count: rows.length };
    }

    // If pagination is provided, use findAndCountAll
    let { rows, count } = await db.pushnotifications.findAndCountAll(
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
    rows.forEach((row) => {
      row.setDataValue('sender', row.get('createdBy'));
      delete row.dataValues.createdBy
    });

    return { rows, count };
  }

  static async findAllAutocomplete(query, limit) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike(
            'pushnotifications',
            'id',
            query,
          ),
        ],
      };
    }

    const records = await db.pushnotifications.findAll({
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

