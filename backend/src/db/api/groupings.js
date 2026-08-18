const db = require('../models');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class GroupingsDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const groupings = await db.groupings.create(
      {
        id: data.id || undefined,

        name: data.name.replace(/\//g, '-') || null,
        min: data.min || null,
        max: data.max || null,
        active: data.active || false,
        required: data.required || false,

        noTag: data.noTag || false,

        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await groupings.setRoles1(data.roles1 || [], {
      transaction,
    });

    await groupings.setRoles2(data.roles2 || [], {
      transaction,
    });

    return groupings;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const groupings = await db.groupings.findByPk(id, {
      transaction,
    });

    await groupings.update(
      {
        name: data.name.replace(/\//g, '-') || null,
        min: data.min || null,
        max: data.max || null,
        active: data.active || false,

        noTag: data.noTag || false,
        required: data.required || false,

        updatedById: currentUser.id,
      },
      { transaction },
    );

    await groupings.setRoles1(data.roles1 || [], {
      transaction,
    });

    await groupings.setRoles2(data.roles2 || [], {
      transaction,
    });

    return groupings;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const groupings = await db.groupings.findByPk(id, options);

    await groupings.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await groupings.destroy({
      transaction,
    });

    return groupings;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const groupings = await db.groupings.findOne({ where }, { transaction });

    if (!groupings) {
      return groupings;
    }

    const output = groupings.get({ plain: true });

    output.roles1 = await groupings.getRoles1({
      transaction,
    });

    output.roles2 = await groupings.getRoles2({
      transaction,
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
    let limitOffset = Utils.getLimitOffset(filter.limit, filter.page);
    let limitOffsetGiven = false;

    var orderBy = null;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
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
      {
        model: db.users,
        as: 'createdBy',
        paranoid: false,
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }
      if (filter.companyId) {
        where = {
          ...where,
          ['$createdBy.companyId$']: Utils.uuid(filter.companyId),
        };
      }

      if (filter.name) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('groupings', 'name', filter.name),
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

      if (filter.active) {
        where = {
          ...where,
          active: filter.active,
        };
      }

      if (filter.noTag) {
        where = {
          ...where,
          noTag: filter.noTag,
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

    let result = await db.groupings.findAndCountAll(
      queryOptionForGettingTheIds,
    );
    const numberOfGroupings = result.count;

    const groupingIdsParsed = JSON.parse(JSON.stringify(result.rows));
    const groupingIdArray = groupingIdsParsed.map((grouping) => grouping.id);

    let rows = [];
    if (groupingIdArray.length > 0) {
      rows = await db.groupings.findAll({
        where: !limitOffsetGiven
          ? where
          : {
              id: { [Op.or]: [groupingIdArray] },
            },
        include,
        order:
          filter.field && filter.sort
            ? [[filter.field, filter.sort]]
            : [['createdAt', 'desc']],
        transaction,
      });
    }

    return { rows: rows, count: numberOfGroupings };

    //    rows = await this._fillWithRelationsAndFilesForRows(
    //      rows,
    //      options,
    //    );`
  }

  static async findAllAutocomplete(query, filter) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike('groupings', 'name', query),
        ],
      };
    }
    if (filter.companyId) {
      where = {
        ...where,
        ['$createdBy.companyId$']: Utils.uuid(filter.companyId),
      };
    }

    const records = await db.groupings.findAll({
      attributes: ['id', 'name', 'required'],
      include: [
        {
          model: db.users,
          as: 'createdBy',
          paranoid: false,
        },
        {
          model: db.subgroups,
          attributes: ['id', 'name', 'branchId'],
          as: 'subgroups',
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
      ],
      where,
      //limit: limit ? Number(limit) : undefined,
      orderBy: [['name', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.name,
      subgroups: record.subgroups,
      roles: record.roles1.concat(record.roles2),
      required: record.required,
    }));
  }

  static async findFunderGroupID(filter) {
    let where = {
      name: "Funder",
    };

    if (filter.companyId) {
      where = {
        ...where,
        ['$createdBy.companyId$']: Utils.uuid(filter.companyId),
      };
    }

    const records = await db.groupings.findOne({
      attributes: ['id'],
      include: [
        {
          model: db.users,
          as: 'createdBy',
          paranoid: false,
          attributes : []
        },
      ],
      where,
    });

    return JSON.parse(JSON.stringify(records));

  }

  static async findMatchingGroupID(filter) {
    let where = {
      name: "Matching",
    };

    if (filter.companyId) {
      where = {
        ...where,
        ['$createdBy.companyId$']: Utils.uuid(filter.companyId),
      };
    }

    const records = await db.groupings.findOne({
      attributes: ['id'],
      include: [
        {
          model: db.users,
          as: 'createdBy',
          paranoid: false,
          attributes : []
        },
      ],
      where,
    });

    return JSON.parse(JSON.stringify(records));
  }

  static async findByGroupingName(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    const currentUser = (options && options.currentUser) || { id: null };

    let where = {
      name : filter.name
    };
    if (options.currentUser.companyId) {
      where = {
        ...where,
        ['$createdBy.companyId$']: Utils.uuid(currentUser.companyId),
      }
    }
    let include = [
      {
        model: db.users,
        as: 'createdBy',
        paranoid: false,
        attributes: ['companyId'],
      },
    ];


    let rows = await db.groupings.findAll({
      where,
      include,
      attributes :['id'],
      transaction,

    });
    const parsedRows = JSON.parse(JSON.stringify(rows));

    return parsedRows;
  }

  static async findFunderGroupIdCompanyIdPairs() {
    let where = {
      name: "Funder",
    };

    const records = await db.groupings.findAll({
      attributes: ['id'],
      include: [
        {
          model: db.users,
          as: 'createdBy',
          paranoid: false,
          attributes : ['companyId']
        },
      ],
      where,
    });

    return JSON.parse(JSON.stringify(records));

  }
};
