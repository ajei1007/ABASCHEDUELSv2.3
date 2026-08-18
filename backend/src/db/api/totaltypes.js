const db = require('../models');
const FileDBApi = require('./file');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class TotaltypesDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const totaltypes = await db.totaltypes.create(
      {
        id: data.id || undefined,

        name: data.name || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await totaltypes.setActivities(data.activities || [], {
      transaction,
    });

    return totaltypes;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const totaltypes = await db.totaltypes.findByPk(id, {
      transaction,
    });

    await totaltypes.update(
      {
        name: data.name || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await totaltypes.setActivities(data.activities || [], {
      transaction,
    });

    return totaltypes;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const totaltypes = await db.totaltypes.findByPk(id, options);

    await totaltypes.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await totaltypes.destroy({
      transaction,
    });

    return totaltypes;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const totaltypes = await db.totaltypes.findOne({ where }, { transaction });

    if (!totaltypes) {
      return totaltypes;
    }

    const output = totaltypes.get({ plain: true });

    output.activities = await totaltypes.getActivities({
      transaction,
    });

    return output;
  }

  static async findAll(filter, options) {
    let limitOffset = Utils.getLimitOffset(filter.limit, filter.offset);
    let limitOffsetGiven = false;

    var orderBy = null;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        attributes: [],
        model: db.users,
        as: 'createdBy',
        paranoid: false,
      },
    ];

    if (filter) {
      if (!filter.activity) {
        include.push({
          model: db.users,
          as: 'activities',
          through: filter.activities
            ? {
                where: {
                  [Op.or]: filter.activities.split('|').map((item) => {
                    return { ['Id']: Utils.uuid(item) };
                  }),
                },
              }
            : null,
          required: filter.activities ? true : null,
        });
      }
      if (filter.companyId) {
        where = {
          ...where,
          ['$createdBy.companyId$']: Utils.uuid(filter.companyId),
        };
      }

      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.ids && filter.ids.split('|').length > 0) {
        where = {
          ...where,
          id: { [Op.or]: filter.ids.split('|') },
        };
      }

      if (filter.name) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('totaltypes', 'name', filter.name),
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

    let queryOptionForGettingTheIds = {
      where,
      attributes: ['id'],
      include: [
        {
          model: db.users,
          as: 'createdBy',
          paranoid: false,
        },
      ],
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
    };

    if (limitOffset.lim >= 0 && limitOffset.off >= 0) {
      limitOffsetGiven = true;
      queryOptionForGettingTheIds = {
        ...queryOptionForGettingTheIds,
        limit: limitOffset.lim,
        offset: limitOffset.off,
      };
    }

    let result = await db.totaltypes.findAndCountAll(
      queryOptionForGettingTheIds,
    );
    const numberOfTotalTypes = result.count;

    const totalTypingIds = JSON.parse(JSON.stringify(result.rows));
    const totalTypeIdArray = totalTypingIds.map((totaltype) => totaltype.id);

    let rows = [];
    if (totalTypeIdArray.length > 0) {
      rows = await db.totaltypes.findAll({
        where: !limitOffsetGiven
          ? where
          : {
              id: { [Op.or]: [totalTypeIdArray] },
            },
        include,
        order:
          filter.field && filter.sort
            ? [[filter.field, filter.sort]]
            : [['createdAt', 'desc']],
        transaction,
      });
    }

    return { rows: rows, count: numberOfTotalTypes };
  }

  static async findAllAutocomplete(query, limit) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike('totaltypes', 'id', query),
        ],
      };
    }

    const records = await db.totaltypes.findAll({
      attributes: ['id', 'name'],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['name', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.name,
    }));
  }
};
