const db = require('../models');
const BranchesCacheApi = require('../../cache/branches');
const BranchesDBApi = require('./branches');
const Utils = require('../utils');
const ValidationError = require('../../services/notifications/errors/validation');



const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class BranchtypeDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    await BranchesCacheApi.removeBranches();

    const branchtype = await db.branchtype.create(
      {
        id: data.id || undefined,

        bol: data.bol || false,
        name: data.name || null,
        physical: data.physical || false,

        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await branchtype.setParent(data.parent || null, {
      transaction,
    });

    return branchtype;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const branchtype = await db.branchtype.findByPk(id, {
      transaction,
    });

    await BranchesCacheApi.removeBranches();

    await branchtype.update(
      {
        name: data.name || null,
        bol: data.bol || false,
        physical: data.physical || false,

        updatedById: currentUser.id,
      },
      { transaction },
    );

    await branchtype.setParent(data.parent || null, {
      transaction,
    });

    return branchtype;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const branchtype = await db.branchtype.findByPk(id, options);
    if (!branchtype) {
      throw new ValidationError('branchetypes.notFound');
    }

    let numberOfChildren = await db.branchtype.count({
      where: {
        parentId: branchtype.dataValues.id,
      },
    });

    if (numberOfChildren > 0) {
      throw new ValidationError('branchetypes.hasChild');
    }

    await BranchesCacheApi.removeBranches();

    await branchtype.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await branchtype.destroy({
      transaction,
    });

    return branchtype;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const branchtype = await db.branchtype.findOne({ where }, { transaction });

    if (!branchtype) {
      return branchtype;
    }

    const output = branchtype.get({ plain: true });

    output.parent = await branchtype.getParent({
      transaction,
    });

    return output;
  }

  static async findAll(filter, options) {
    // if (filter.branches) {
    //   filter.branches = await BranchesDBApi.getBranchStructures({
    //     companyId: filter.companyId,
    //     branchIds: filter.branches
    //   });
    // }
    var limit = filter.limit || 0;
    var offset = 0;
    const currentPage = +filter.page;

    offset = currentPage * limit;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        model: db.branchtype,
        as: 'parent',
      },
      {
        attributes: ['id', 'firstName'],
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
          [Op.and]: Utils.ilike('branchtype', 'name', filter.name),
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

      if (filter.bol) {
        where = {
          ...where,
          bol: filter.bol,
        };
      }

      if (filter.parent) {
        var listItems = filter.parent.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          parentId: { [Op.or]: listItems },
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

    let { rows, count } = await db.branchtype.findAndCountAll({
      where,
      include,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
    });

    return { rows, count };
  }

  static async findAllAutocomplete(query, limit, filter) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike('branchtype', 'id', query),
        ],
      };
    }
    if (filter.companyId) {
      where = {
        ...where,
        ['$createdBy.companyId$']: Utils.uuid(filter.companyId),
      };
    }

    const records = await db.branchtype.findAll({
      attributes: ['id', 'name'],
      include: [
        {
          model: db.users,
          as: 'createdBy',
          paranoid: false,
        },
      ],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['id', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.name,
    }));
  }

  static async getDescendentBrancheTypes(filter) {
    let filteredBrancheTypes = filter.branchTypeIds.split('|');

    let mustBeChecked = filteredBrancheTypes;

    let queryOptions = {
      attributes: ['id', 'parentId'],
    };

    let rows = await db.branchtype.findAll(queryOptions);
    const branchetypes = JSON.parse(JSON.stringify(rows));

    let parentChildBranchtype = new Map();

    for (let i = 0; i < branchetypes.length; i++) {
      if (!parentChildBranchtype.has(branchetypes[i].parentId)) {
        let childs = [branchetypes[i].id, branchetypes[i].parentId];
        parentChildBranchtype.set(branchetypes[i].parentId, childs);
      } else {
        parentChildBranchtype.get(branchetypes[i].parentId).push(branchetypes[i].id);
      }

      if (!parentChildBranchtype.has(branchetypes[i].id)) {
        let childs = [branchetypes[i].id];
        parentChildBranchtype.set(branchetypes[i].id, childs);
      }
    }

    for (let j = 0; j < mustBeChecked.length; j++) {
      let childs = parentChildBranchtype.get(mustBeChecked[j]);
      if (childs) {
        for (let m = 0; m < childs.length; m++) {
          if (!mustBeChecked.includes(childs[m])) {
            mustBeChecked.push(childs[m]);
          }
        }
      }
    }
    return mustBeChecked;
  }

  static async findByBranchtypeName(filter, options) {
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


    let rows = await db.branchtype.findAll({
      where,
      include,
      attributes :['id'],
      transaction,

    });
    const parsedRows = JSON.parse(JSON.stringify(rows));

    return parsedRows;
  }
};
