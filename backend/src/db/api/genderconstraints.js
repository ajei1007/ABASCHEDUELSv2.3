
const db = require('../models');
const FileDBApi = require('./file');const BranchesDBApi = require('./branches')
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class GenderconstraintsDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const genderconstraints = await db.genderconstraints.create(
      {
        id: data.id || undefined,

        gender1: data.gender1 || null,
        gender2: data.gender2 || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await genderconstraints.setRole1(data.role1 || null, {
      transaction,
    });

    await genderconstraints.setUser(data.user || null, {
      transaction,
    });

    await genderconstraints.setRole2(data.role2 || null, {
      transaction,
    });

    return genderconstraints;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const genderconstraints = await db.genderconstraints.findByPk(id, {
      transaction,
    });

    await genderconstraints.update(
      {
        gender1: data.gender1 || null,
        gender2: data.gender2 || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await genderconstraints.setRole1(data.role1 || null, {
      transaction,
    });

    await genderconstraints.setUser(data.user || null, {
      transaction,
    });

    await genderconstraints.setRole2(data.role2 || null, {
      transaction,
    });

    return genderconstraints;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const genderconstraints = await db.genderconstraints.findByPk(id, options);

    await genderconstraints.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await genderconstraints.destroy({
      transaction,
    });

    return genderconstraints;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const genderconstraints = await db.genderconstraints.findOne(
      { where },
      { transaction },
    );

    if (!genderconstraints) {
      return genderconstraints;
    }

    const output = genderconstraints.get({ plain: true });

    output.role1 = await genderconstraints.getRole1({
      transaction,
    });

    output.user = await genderconstraints.getUser({
      transaction,
    });

    output.role2 = await genderconstraints.getRole2({
      transaction,
    });

    return output;
  }

  static async findAll(filter, options) {
    if (filter.branches) {
      filter.branches = await BranchesDBApi.getBranchStructures({
        companyId: filter.companyId,
        branchIds: filter.branches
      });
    }
    var limit = filter.limit || 0;
    var offset = 0;
    const currentPage = +filter.page - 1;

    offset = currentPage * limit;

    var orderBy = null;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        model: db.roles,
        as: 'role1',
      },

      {
        model: db.users,
        as: 'user',
      },

      {
        model: db.roles,
        as: 'role2',
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
          active: filter.active === true || filter.active === 'true',
        };
      }

      if (filter.gender1) {
        where = {
          ...where,
          gender1: filter.gender1,
        };
      }

      if (filter.gender2) {
        where = {
          ...where,
          gender2: filter.gender2,
        };
      }

      if (filter.role1) {
        var listItems = filter.role1.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          role1Id: { [Op.or]: listItems },
        };
      }

      if (filter.user) {
        var listItems = filter.user.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          userId: { [Op.or]: listItems },
        };
      }

      if (filter.role2) {
        var listItems = filter.role2.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          role2Id: { [Op.or]: listItems },
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

    let { rows, count } = await db.genderconstraints.findAndCountAll({
      where,
      include,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
    });

    //    rows = await this._fillWithRelationsAndFilesForRows(
    //      rows,
    //      options,
    //    );

    return { rows, count };
  }

  static async findAllAutocomplete(query, limit, filter) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike('genderconstraints', 'gender1', query),
        ],
      };
    }

    const records = await db.genderconstraints.findAll({
      attributes: ['id', 'gender1'],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['gender1', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.gender1,
    }));
  }
};

