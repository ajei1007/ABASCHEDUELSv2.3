const db = require('../models');
const FileDBApi = require('./file');
const BranchesDBApi = require('./branches');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class SubgroupsDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const subgroups = await db.subgroups.create(
      {
        id: data.id || undefined,

        name: data.name || null,
        allbranches: data.allbranches || false,

        noTag: data.noTag || false,

        importHash: data.importHash || null,
        iconName: data.iconName || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await subgroups.setGroup(data.group || null, {
      transaction,
    });

    await subgroups.setBranch(data.branch || null, {
      transaction,
    });

    await subgroups.setRelatedUser(data.relatedUser || null, {
      transaction,
    });

    await subgroups.setUser(data.user || [], {
      transaction,
    });

    await subgroups.setBranches(data.branches || [], {
      transaction,
    });

    await subgroups.setSubgroup(data.subgroup || [], {
      transaction,
    });

    await subgroups.setSubgroup3(data.subgroup3 || [], {
      transaction,
    });

    return subgroups;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const subgroups = await db.subgroups.findByPk(id, {
      transaction,
    });

    await subgroups.update(
      {
        name: data.name || null,
        allbranches: data.allbranches || false,

        noTag: data.noTag || false,
        iconName: data.iconName || null,

        updatedById: currentUser.id,
      },
      { transaction },
    );

    await subgroups.setGroup(data.group || null, {
      transaction,
    });

    await subgroups.setBranch(data.branch || null, {
      transaction,
    });

    await subgroups.setUser(data.user || [], {
      transaction,
    });

    await subgroups.setBranches(data.branches || [], {
      transaction,
    });

    await subgroups.setSubgroup(data.subgroup || [], {
      transaction,
    });

    await subgroups.setSubgroup3(data.subgroup3 || [], {
      transaction,
    });

    return subgroups;
  }

  static async updateNameAndUsers(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const subgroups = await db.subgroups.findByPk(id, {
      transaction,
    });

    await subgroups.update(
      {
        name: data.name || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await subgroups.setUser(data.user || [], {
      transaction,
    });

    return subgroups;
  }

  static async updateName(id, name, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const subgroups = await db.subgroups.findByPk(id, {
      transaction,
    });

    await subgroups.update(
      {
        name: name || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const subgroups = await db.subgroups.findByPk(id, options);

    await subgroups.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await subgroups.destroy({
      transaction,
    });

    return subgroups;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;
    let include =[];
    if (where.hasOwnProperty('companyId') && !where.companyId){
      return false;
    }
    if (where.companyId){
      where = {
        ...where,
        ['$createdBy.companyId$']: Utils.uuid(where.companyId),
      };
      delete where.companyId;
      include = [
        {
          attributes: [],
          model: db.users,
          as: 'createdBy',
          paranoid: false,
        },
      ];
    }
    const subgroups = await db.subgroups.findOne({ where, include }, { transaction });

    if (!subgroups) {
      return subgroups;
    }

    const output = subgroups.get({ plain: true });

    output.group = await subgroups.getGroup({
      include: [
        {
          attributes: ['name'],
          model: db.roles,
          as: 'roles1',
        },
      ],
      transaction,
    });

    output.user = await subgroups.getUser({
      transaction,
    });

    output.branch = await subgroups.getBranch({
      transaction,
    });

    output.branches = await subgroups.getBranches({
      transaction,
    });

    output.subgroup = await subgroups.getSubgroup({
      transaction,
    });

    output.subgroup3 = await subgroups.getSubgroup3({
      transaction,
    });

    return output;
  }

  static async findAllTable(filter, options) {
    // if (filter.branches) {
    //   filter.branches = await BranchesDBApi.getDescendentAndAncestorBranches({
    //     branchIds: filter.branches,
    //   });
    // }

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        attributes: ['name'],
        model: db.groupings,
        as: 'group',
      },
      {
        attributes: [],
        model: db.users,
        as: 'createdBy',
        paranoid: false,
      },

      {
        attributes: ['firstName', 'lastName'],
        model: db.users,
        as: 'user',
        separate: false,
        through: filter.user
          ? {
              attributes: [],
              where: {
                [Op.or]: filter.user.split('|').map((item) => {
                  return { ['Id']: Utils.uuid(item) };
                }),
              },
            }
          : { attributes: [] },
        required: filter.user ? true : null,
      },
      {
        attributes: ['id', 'name'],
        model: db.branches,
        as: 'branch',
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.branch) {
        where = {
          ...where,
          ['branchId']: filter.branch,
        };
      }
      

      if (filter.companyId) {
        where = {
          ...where,
          ['$createdBy.companyId$']: Utils.uuid(filter.companyId),
        };
      }

      if (filter.userName) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('user', 'firstName', filter.userName),
        };
      }

      if (filter.name) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('subgroups', 'name', filter.name),
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

      if (filter.allbranches) {
        where = {
          ...where,
          allbranches: filter.allbranches,
        };
      }

      if (filter.noTag) {
        where = {
          ...where,
          noTag: filter.noTag,
        };
      }

      if (filter.group) {
        var listItems = filter.group.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          groupId: { [Op.or]: listItems },
        };
      }

      if (filter.group_name) {
        var listItems = filter.group_name.split('|').map((item) => {
          return item;
        });

        where = {
          ...where,
          '$group.name$': { [Op.or]: listItems },
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

    let rows = [];
    let count = 0;

    rows = await db.subgroups.findAll({
      where,
      include,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
    });

    count = rows.length;

    return { rows, count };
  }

  static async findAll(filter, options) {
    if (filter.branches) {
      filter.branches = await BranchesDBApi.getDescendentAndAncestorBranches({
        branchIds: filter.branches,
      });
    }

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        attributes: ['name'],
        model: db.groupings,
        as: 'group',
      },
      {
        attributes: [],
        model: db.users,
        as: 'createdBy',
        paranoid: false,
      },
      {
        attributes: [],
        model: db.branches,
        as: 'branch',
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.branches) {
        where = {
          ...where,
          ['$branch.id$']: { 
            [Op.or]: [
              { [Op.in]: filter.branches },
              { [Op.is]: null }
            ]
          },
        };
      }

      if (filter.companyId) {
        where = {
          ...where,
          ['$createdBy.companyId$']: Utils.uuid(filter.companyId),
        };
      }

      if (filter.userName) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('user', 'firstName', filter.userName),
        };
      }

      if (filter.name) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('subgroups', 'name', filter.name),
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

      if (filter.allbranches) {
        where = {
          ...where,
          allbranches: filter.allbranches,
        };
      }

      if (filter.noTag) {
        where = {
          ...where,
          noTag: filter.noTag,
        };
      }

      if (filter.group) {
        var listItems = filter.group.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          groupId: { [Op.or]: listItems },
        };
      }

      if (filter.group_name) {
        var listItems = filter.group_name.split('|').map((item) => {
          return item;
        });

        where = {
          ...where,
          '$group.name$': { [Op.or]: listItems },
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

    let rows = [];
    let count = 0;

    rows = await db.subgroups.findAll({
      where: where,
      include,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
    });

    count = rows.length;

    return { rows, count };
  }

  static async findAllAutocomplete(query, limit, filter) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike('subgroups', 'name', query),
        ],
      };
    }
    if (filter.companyId) {
      where = {
        ...where,
        ['$createdBy.companyId$']: Utils.uuid(filter.companyId),
      };
    }

    const records = await db.subgroups.findAll({
      attributes: ['id', 'name'],
      include: [
        {
          model: db.groupings,
          as: 'group',
          attributes: ['id', 'name'],
        },
        {
          model: db.branches,
          as: 'branch',
          attributes: ['id', 'name'],
        },
        {
          model: db.users,
          as: 'createdBy',
          attributes: ['id'],
          paranoid: false,
        },
      ],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['name', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.name,
      group: record.group,
      branch: record.branch,
    }));
  }

  static async findSubgroupIdsByGroupId(filter) {
    let where = {};

    if (filter.ids) {
      where = {
        id: { [Op.or]: filter.ids },
      };
    }

    if (filter.groupId) {
      where = {
        ...where,
        groupId: filter.groupId,
      };
    }

    const records = await db.subgroups.findAll({
      attributes: ['id'],
      include: [],
      where,
    });

    return records.map((record) => ({
      id: record.id,
    }));
  }

  static async findBySubroupName(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    const currentUser = (options && options.currentUser) || { id: null };

    let where = {
      name: filter.name,
    };
    if (filter.groupId) {
      where.groupId = filter.groupId;
    }
    if (options.currentUser.companyId) {
      where = {
        ...where,
        ['$createdBy.companyId$']: Utils.uuid(currentUser.companyId),
      };
    }
    let include = [
      {
        model: db.users,
        as: 'createdBy',
        paranoid: false,
        attributes: ['companyId'],
      },
    ];

    let rows = await db.subgroups.findAll({
      where,
      include,
      attributes: ['id'],
      transaction,
    });
    const parsedRows = JSON.parse(JSON.stringify(rows));

    return parsedRows;
  }

  static async isRelatedActiveUserExists(subgroupId) {
    let include = {
      model: db.subgroups,
      as : "subgroups",
      where: { id: subgroupId },
      through: { attributes: [] }
    }
    let where = {
      deletedAt: null
    }
    const activeUser = await db.users.findOne({
      where,
      include,
    })
    if (activeUser) {
      return true;
    }
    return false 
  }
};
