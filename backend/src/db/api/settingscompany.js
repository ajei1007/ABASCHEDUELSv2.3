const db = require('../models');
const Utils = require('../utils');
const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class SettingscompanyDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const settingscompany = await db.settingscompany.create(
      {
        id: data.id || undefined,
        cancellationdeadline: data.cancellationdeadline || null,
        timeoffdeadline: data.timeoffdeadline || null,
        importHash: data.importHash || null,
        chatEnabled: data.chatEnabled || false,
        companyId: data.company || null,
        // customLabels: data.customLabels || null, // TODO For not it is manually controlled from DB
        staffTrackerBranchTypeId: data.branchType || null,
        aliasFormatType: data.aliasFormatType || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );
    await settingscompany.setCompany(data.company || null, {
      transaction,
    });
    await settingscompany.setStaffTrackerBranchType(data.branchType || null, {
      transaction,
    });
    await settingscompany.setStaffTrackerBranches(data.branches || [], {
      transaction,
    });
    await settingscompany.setStaffTrackerActivities(data.activities || [], {
      transaction,
    });
    await settingscompany.setStaffTrackerRoles(data.roles || [], {
      transaction,
    });

    const output = settingscompany.get({ plain: true });
    output.staffTrackerBranches =
      await settingscompany.getStaffTrackerBranches();
    output.staffTrackerActivities =
      await settingscompany.getStaffTrackerActivities();
    output.staffTrackerRoles = await settingscompany.getStaffTrackerRoles();
    output.staffTrackerBranchType =
      await settingscompany.getStaffTrackerBranchType();
    output.company = await settingscompany.getCompany();

    const parsedSettingscompany = JSON.parse(JSON.stringify(output));

    let staffTrackerBranchType = null;
    if (parsedSettingscompany.staffTrackerBranchType) {
      staffTrackerBranchType = {
        id: parsedSettingscompany.staffTrackerBranchType.id,
        value: parsedSettingscompany.staffTrackerBranchType.id,
        label: parsedSettingscompany.staffTrackerBranchType.name,
      };
    }

    return {
      ...parsedSettingscompany,
      staffTrackerBranches: parsedSettingscompany.staffTrackerBranches.map(
        (val) => ({ id: val.id, value: val.id, label: val.name }),
      ),
      staffTrackerActivities: parsedSettingscompany.staffTrackerActivities.map(
        (val) => ({
          id: val.id,
          value: val.id,
          label: `${val.firstName} ${val.lastName || ''}`,
        }),
      ),
      staffTrackerBranchType,
    };
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const settingscompany = await db.settingscompany.findByPk(id, {
      transaction,
    });

    await settingscompany.update(
      {
        cancellationdeadline: data.cancellationdeadline || null,
        timeoffdeadline: data.timeoffdeadline || null,
        companyId: data.company || null,
        staffTrackerBranchTypeId: data.branchType || null,
        aliasFormatType: data.aliasFormatType || null,
        chatEnabled: data.chatEnabled || false,
        updatedById: currentUser.id,
        // customLabels: data.customLabels || null, // TODO For not it is manually controlled from DB
      },
      { transaction },
    );

    await settingscompany.setCompany(data.company || null, {
      transaction,
    });
    await settingscompany.setStaffTrackerBranchType(data.branchType || null, {
      transaction,
    });
    await settingscompany.setStaffTrackerBranches(data.branches || [], {
      transaction,
    });
    await settingscompany.setStaffTrackerActivities(data.activities || [], {
      transaction,
    });
    await settingscompany.setStaffTrackerRoles(data.roles || [], {
      transaction,
    });

    return settingscompany;
  }

  static async updateAlias(id, alias, aliasFormatType, options) {
    const transaction = (options && options.transaction) || undefined;
    const currentUser = (options && options.currentUser) || { id: null };
    
    const settingscompany = await db.settingscompany.findByPk(id, { transaction });
    await settingscompany.update({ isAlias: alias, aliasFormatType, updatedById: currentUser.id }, { transaction });
    return settingscompany;
  }

  static async updateSchedulerLocked(id, currentUser) {
    const settingscompany = await db.settingscompany.findByPk(id);

    if (!settingscompany) {
      return 404;
    }

    if (currentUser.companyId !== settingscompany.companyId) {
      return 403;
    }

    await settingscompany.update({
      schedulerLocked: !settingscompany.schedulerLocked,
      updatedById: currentUser.id,
    });

    return JSON.parse(JSON.stringify(settingscompany));
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const settingscompany = await db.settingscompany.findByPk(id, options);

    await settingscompany.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await settingscompany.destroy({
      transaction,
    });

    return settingscompany;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const settingscompany = await db.settingscompany.findOne({
      where,
      transaction,
    });

    if (!settingscompany) {
      return settingscompany;
    }

    const output = settingscompany.get({ plain: true });

    return output;
  }

  static async findByCompanyId(companyId, options = {}) {
    const transaction = options.transaction;

    const settingscompany = await db.settingscompany.findOne({
      include: [
        {
          model: db.companies,
          as: 'company',
        },
      ],
      where: {
        ['$company.id$']: companyId,
      },
      transaction,
    });
    if (!settingscompany) {
      return 404;
    }
    const output = settingscompany.get({ plain: true });

    output.staffTrackerBranches =
      await settingscompany.getStaffTrackerBranches();
    output.staffTrackerActivities =
      await settingscompany.getStaffTrackerActivities();
    output.staffTrackerBranchType =
      await settingscompany.getStaffTrackerBranchType();
    output.staffTrackerRoles = await settingscompany.getStaffTrackerRoles();

    const parsedSettingscompany = JSON.parse(JSON.stringify(output));

    let staffTrackerBranchType = null;
    if (parsedSettingscompany.staffTrackerBranchType) {
      staffTrackerBranchType = {
        id: parsedSettingscompany.staffTrackerBranchType.id,
        value: parsedSettingscompany.staffTrackerBranchType.id,
        label: parsedSettingscompany.staffTrackerBranchType.name,
      };
    }

    return {
      ...parsedSettingscompany,
      staffTrackerBranches: parsedSettingscompany.staffTrackerBranches.map(
        (val) => ({ id: val.id, value: val.id, label: val.name }),
      ),
      staffTrackerActivities: parsedSettingscompany.staffTrackerActivities.map(
        (val) => ({
          id: val.id,
          value: val.id,
          label: `${val.firstName} ${val.lastName || ''}`,
        }),
      ),
      staffTrackerRoles: parsedSettingscompany.staffTrackerRoles.map((val) => ({
        id: val.id,
        value: val.id,
        label: val?.name,
      })),
      staffTrackerBranchType,
    };
  }

  static async checkIfCompanySchedulerIsLocked(companyId) {
    const settingscompany = await db.settingscompany.findOne({
      attributes: ['id', 'schedulerLocked'],
      where: {
        companyId: companyId,
      },
    });

    if (!settingscompany) {
      return 404;
    }

    return settingscompany.schedulerLocked;
  }

  static async findAll(filter, options) {
    var limit = filter.limit || 0;
    var offset = 0;
    const currentPage = +filter.page - 1;

    offset = currentPage * limit;

    var orderBy = null;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        attributes: ['id'],
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

      if (filter.cancellationdeadlineRange) {
        const [start, end] = filter.cancellationdeadlineRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            cancellationdeadline: {
              ...where.cancellationdeadline,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            cancellationdeadline: {
              ...where.cancellationdeadline,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.timeoffdeadlineRange) {
        const [start, end] = filter.timeoffdeadlineRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            timeoffdeadline: {
              ...where.timeoffdeadline,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            timeoffdeadline: {
              ...where.timeoffdeadline,
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

    let { rows, count } = await db.settingscompany.findAndCountAll({
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

    return { rows, count };
  }

  static async findAllAutocomplete(query, limit) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike('settingscompany', 'id', query),
        ],
      };
    }

    const records = await db.settingscompany.findAll({
      attributes: ['id', 'id'],
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
