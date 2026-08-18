
const db = require('../models');
const FileDBApi = require('./file');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class ConstraintgeneratorDBApi {

  static async create(data, options) {
  const currentUser = (options && options.currentUser) || { id: null };
  const transaction = (options && options.transaction) || undefined;

  const constraintgenerator = await db.constraintgenerator.create(
  {
  id: data.id || undefined,

    constraintType: data.constraintType
    ||
    null
,

    description: data.description
    ||
    null
,

    alias: data.alias
    ||
    null
,

    antecedentType: data.antecedentType
    ||
    null
,

    antecedentTypeUsers: data.antecedentTypeUsers
    ||
    null
,

    antecedentTypeRoles: data.antecedentTypeRoles
    ||
    null
,

    antecedentTypeSubgroups: data.antecedentTypeSubgroups
    ||
    null
,

    consequenceType: data.consequenceType
    ||
    null
,

    consequenceTypeUsers: data.consequenceTypeUsers
    ||
    null
,

    consequenceTypeRoles: data.consequenceTypeRoles
    ||
    null
,

    consequenceTypeSubgroups: data.consequenceTypeSubgroups
    ||
    null
,

    consequenceTypeDaySelection: data.consequenceTypeDaySelection
    ||
    null
,

    min: data.min
    ??
    null
,

    max: data.max
    ??
    null
,

    frequency: data.frequency
    ||
    null
,

    start: data.start
    ||
    null
,

    end: data.end
    ||
    null
,

    disabled: data.disabled
    ||
    false

,

    consequenceTypeEachOrAll: data.consequenceTypeEachOrAll
    ||
    null
,

    antecedentTypeEachOrAll: data.antecedentTypeEachOrAll
    ||
    null
,

    noLimit: data.noLimit
    ||
    false

,

  importHash: data.importHash || null,
  createdById: currentUser.id,
  updatedById: currentUser.id,
  },
  { transaction },
  );

  return constraintgenerator;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || {id: null};
    const transaction = (options && options.transaction) || undefined;

    const constraintgenerator = await db.constraintgenerator.findByPk(id, {
      transaction,
    });

    await constraintgenerator.update(
      {

        constraintType: data.constraintType
        ||
        null
,

        description: data.description
        ||
        null
,

        alias: data.alias
        ||
        null
,

        antecedentType: data.antecedentType
        ||
        null
,

        antecedentTypeUsers: data.antecedentTypeUsers
        ||
        null
,

        antecedentTypeRoles: data.antecedentTypeRoles
        ||
        null
,

        antecedentTypeSubgroups: data.antecedentTypeSubgroups
        ||
        null
,

        antecedentTypeDaySelection: data.antecedentTypeDaySelection
        ||
        null
,

        consequenceType: data.consequenceType
        ||
        null
,

        consequenceTypeUsers: data.consequenceTypeUsers
        ||
        null
,

        consequenceTypeRoles: data.consequenceTypeRoles
        ||
        null
,

        consequenceTypeSubgroups: data.consequenceTypeSubgroups
        ||
        null
,

        consequenceTypeDaySelection: data.consequenceTypeDaySelection
        ||
        null
,

        min: data.min
        ??
        null
,

        max: data.max
        ??
        null
,

        frequency: data.frequency
        ||
        null
,

        start: data.start
        ||
        null
,

        end: data.end
        ||
        null
,

        disabled: data.disabled
        ||
        false

,

        consequenceTypeEachOrAll: data.consequenceTypeEachOrAll
        ||
        null
,

        antecedentTypeEachOrAll: data.antecedentTypeEachOrAll
        ||
        null
,

        noLimit: data.noLimit
        ||
        false

,

        updatedById: currentUser.id,
      },
      {transaction},
    );

    return constraintgenerator;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || {id: null};
    const transaction = (options && options.transaction) || undefined;

    const constraintgenerator = await db.constraintgenerator.findByPk(id, options);

    await constraintgenerator.update({
      deletedBy: currentUser.id
    }, {
      transaction,
    });

    await constraintgenerator.destroy({
      transaction
    });

    return constraintgenerator;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const constraintgenerator = await db.constraintgenerator.findOne(
      { where },
      { transaction },
    );

    if (!constraintgenerator) {
      return constraintgenerator;
    }

    const output = constraintgenerator.get({plain: true});

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

    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.constraintType) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'constraintgenerator',
            'constraintType',
            filter.constraintType,
          ),
        };
      }

      if (filter.description) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'constraintgenerator',
            'description',
            filter.description,
          ),
        };
      }

      if (filter.alias) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'constraintgenerator',
            'alias',
            filter.alias,
          ),
        };
      }

      if (filter.antecedentType) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'constraintgenerator',
            'antecedentType',
            filter.antecedentType,
          ),
        };
      }

      if (filter.antecedentTypeUsers) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'constraintgenerator',
            'antecedentTypeUsers',
            filter.antecedentTypeUsers,
          ),
        };
      }

      if (filter.antecedentTypeRoles) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'constraintgenerator',
            'antecedentTypeRoles',
            filter.antecedentTypeRoles,
          ),
        };
      }

      if (filter.antecedentTypeSubgroups) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'constraintgenerator',
            'antecedentTypeSubgroups',
            filter.antecedentTypeSubgroups,
          ),
        };
      }

      if (filter.antecedentTypeDaySelection) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'constraintgenerator',
            'antecedentTypeDaySelection',
            filter.antecedentTypeDaySelection,
          ),
        };
      }

      if (filter.consequenceType) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'constraintgenerator',
            'consequenceType',
            filter.consequenceType,
          ),
        };
      }

      if (filter.consequenceTypeUsers) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'constraintgenerator',
            'consequenceTypeUsers',
            filter.consequenceTypeUsers,
          ),
        };
      }

      if (filter.consequenceTypeRoles) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'constraintgenerator',
            'consequenceTypeRoles',
            filter.consequenceTypeRoles,
          ),
        };
      }

      if (filter.consequenceTypeSubgroups) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'constraintgenerator',
            'consequenceTypeSubgroups',
            filter.consequenceTypeSubgroups,
          ),
        };
      }

      if (filter.consequenceTypeDaySelection) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'constraintgenerator',
            'consequenceTypeDaySelection',
            filter.consequenceTypeDaySelection,
          ),
        };
      }
      
      if (filter.frequency) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'constraintgenerator',
            'frequency',
            filter.frequency,
          ),
        };
      }

      if (filter.consequenceTypeEachOrAll) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'constraintgenerator',
            'consequenceTypeEachOrAll',
            filter.consequenceTypeEachOrAll,
          ),
        };
      }

      if (filter.antecedentTypeEachOrAll) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'constraintgenerator',
            'antecedentTypeEachOrAll',
            filter.antecedentTypeEachOrAll,
          ),
        };
      }

      if (filter.minRange) {
        const [start, end] = filter.minRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            min: {
              ...where.min,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            min: {
              ...where.min,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.maxRange) {
        const [start, end] = filter.maxRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            max: {
              ...where.max,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            max: {
              ...where.max,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.startRange) {
        const [start, end] = filter.startRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            start: {
              ...where.start,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            start: {
              ...where.start,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.endRange) {
        const [start, end] = filter.endRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            end: {
              ...where.end,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            end: {
              ...where.end,
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

      if (filter.disabled) {
        where = {
          ...where,
          disabled: filter.disabled,
        };
      }

      if (filter.noLimit) {
        where = {
          ...where,
          noLimit: filter.noLimit,
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

    let { rows, count } = await db.constraintgenerator.findAndCountAll(
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
            'constraintgenerator',
            'id',
            query,
          ),
        ],
      };
    }

    const records = await db.constraintgenerator.findAll({
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

