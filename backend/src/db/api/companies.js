const db = require('../models');
const FileDBApi = require('./file');
const BranchesDBApi = require('./branches');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class CompaniesDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;
    const companies = await db.companies.create(
      {
        id: data.id || undefined,

        name: data.name || null,
        membership: data.membership || 'pro',
        disabled: data.disabled || false,
        subscriptionType: data.subscriptionType || 'person',
        stripeId: data.stripeId,
        industryId: data.industry,
        onboarded: data.onboarded || false,

        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await companies.setIndustry(data.industry || null, {
      transaction,
    });

    return companies;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const companies = await db.companies.findByPk(id, {
      transaction,
    });

    await companies.update(
      {
        name: data.name || null,
        membership: data.membership || null,
        subscriptionType: data.subscriptionType || null,
        stripeId: data.stripeId,

        disabled: data.disabled || false,

        updatedById: currentUser.id,
      },
      { transaction },
    );

    await companies.setIndustry(data.industry || null, {
      transaction,
    });
    // await companies.setAdmin(data.adminId || null, {
    //   transaction,
    // });

    return companies;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const companies = await db.companies.findByPk(id, options);

    await companies.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await companies.destroy({
      transaction,
    });

    return companies;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const companies = await db.companies.findOne({ where }, { transaction });

    if (!companies) {
      return companies;
    }

    const output = companies.get({ plain: true });

    output.industry = await companies.getIndustry({
      transaction,
    });

    return output;
  }

  static async findCompanyDisabled(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const company = await db.companies.findOne(
      { where, attributes: ['disabled'] },
      { transaction },
    );

    return company.dataValues.disabled;
  }

  static async findAll(filter, options) {
    if (filter.branches) {
      filter.branches = await BranchesDBApi.getBranchStructures({
        companyId: filter.companyId,
        branchIds: filter.branches,
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
        model: db.industries,
        as: 'industry',
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.name) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('companies', 'name', filter.name),
        };
      }

      if (filter.membership) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('companies', 'membership', filter.membership),
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

      if (filter.disabled) {
        where = {
          ...where,
          disabled: filter.disabled,
        };
      }

      if (filter.excludeDisabled) {
        where = {
          ...where,
          disabled: false,
        };
      }

      if (filter.industry) {
        var listItems = filter.industry.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          industryId: { [Op.or]: listItems },
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

    let { rows, count } = await db.companies.findAndCountAll({
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
          Utils.ilike('companies', 'name', query),
        ],
      };
    }

    const records = await db.companies.findAll({
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

  static async updateOnboardedStatus(companyId, onboarded, options = {}) {
    const transaction = options.transaction

    await db.companies.update(
      { onboarded },
      { where: { id: companyId }, transaction }
    );

    return true;
  }
};
