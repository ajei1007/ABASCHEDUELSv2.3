
const db = require('../models');
const FileDBApi = require('./file');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class NotesDBApi {

  static async create(data, options) {
  const currentUser = (options && options.currentUser) || { id: null };
  const transaction = (options && options.transaction) || undefined;

  const notes = await db.notes.create(
  {
  id: data.id || undefined,

    date: data.date
    ||
    null
,

    notes: data.notes
    ||
    null
,

    checked: data.checked
    ||
    false

,

  importHash: data.importHash || null,
  createdById: currentUser.id,
  updatedById: currentUser.id,
  },
  { transaction },
  );

    await notes.setEvent(data.event || null, {
    transaction,
    });

    await notes.setUsers(data.users || [], {
    transaction,
    });

  return notes;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || {id: null};
    const transaction = (options && options.transaction) || undefined;

    const notes = await db.notes.findByPk(id, {
      transaction,
    });

    await notes.update(
      {

        date: data.date
        ||
        null
,

        notes: data.notes
        ||
        null
,

        checked: data.checked
        ||
        false

,

        updatedById: currentUser.id,
      },
      {transaction},
    );

    await notes.setEvent(data.event || null, {
      transaction,
    });

    await notes.setUsers(data.users || [], {
      transaction,
    });

    return notes;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || {id: null};
    const transaction = (options && options.transaction) || undefined;

    const notes = await db.notes.findByPk(id, options);

    await notes.update({
      deletedBy: currentUser.id
    }, {
      transaction,
    });

    await notes.destroy({
      transaction
    });

    return notes;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const notes = await db.notes.findOne(
      { where },
      { transaction },
    );

    if (!notes) {
      return notes;
    }

    const output = notes.get({plain: true});

    output.event = await notes.getEvent({
      transaction
    });

    output.users = await notes.getUsers({
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
      },

      {
        model: db.users,
        as: 'users',
        through: filter.users ? { where: {
          [Op.or]: filter.users.split('|').map(item => {
            return { ['Id']: Utils.uuid(item) }
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

      if (filter.notes) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'notes',
            'notes',
            filter.notes,
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

    let { rows, count } = await db.notes.findAndCountAll(
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
            'notes',
            'id',
            query,
          ),
        ],
      };
    }

    const records = await db.notes.findAll({
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

