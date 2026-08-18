const db = require('../models');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class SettingsDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const settings = await db.settings.create(
      {
        id: data.id || undefined,

        sunday: data.sunday || false,

        monday: data.monday || false,

        tuesday: data.tuesday || false,

        wednesday: data.wednesday || false,

        thursday: data.thursday || false,

        friday: data.friday || false,

        saturday: data.saturday || false,

        overbooking: data.overbooking || false,
        emptyAvailability: data.emptyAvailability || false,
        notAvailableBusy: data.notAvailableBusy || false,
        differentBranch: data.differentBranch || false,

        weekends: data.weekends || false,

        blockScheduling: data.blockScheduling || false,

        titleFormatYear: data.titleFormatYear || null,
        titleFormatMonth: data.titleFormatMonth || null,
        titleFormatDay: data.titleFormatDay || null,
        scrollTime: data.scrollTime || null,
        initialView: data.initialView || null,
        timezone: data.timezone || null,
        dateformats: data.dateformats || null,
        hour24: data.hour24 || false,

        driveTime: data.driveTime || false,

        blocks: data.blocks || false,

        orange: data.orange || false,

        recurring: data.recurring || null,
        noGaps: data.noGaps || false,

        driveTimeQuantity: data.driveTimeQuantity || null,
        driveTimeUnit: data.driveTimeUnit || null,
        driveDistanceMax: data.driveDistanceMax || false,

        driveDistanceMaxQuantity: data.driveDistanceMaxQuantity || null,
        driveDistanceMaxUnit: data.driveDistanceMaxUnit || null,
        timeconstraints: data.timeconstraints || false,

        timeConstraintUpperBuffer: data.timeConstraintUpperBuffer || null,
        timeConstraintLowerBuffer: data.timeConstraintLowerBuffer || null,
        rolesFilterLabels: data.rolesFilterLabels || null,
        statsFilterLabels: data.statsFilterLabels || null,
        teamSeparation: data.teamSeparation || false,

        isolateCanceled: data.isolateCanceled || false,

        locationQuantity: data.locationQuantity || null,
        subgroupsFilterLabels: data.subgroupsFilterLabels || null,
        resourceFilterLabels: data.resourceFilterLabels || null,
        backgroundColorRole: data.backgroundColorRole || null,
        borderColorRole: data.borderColorRole || null,
        businessStartTime: data.businessStartTime || null,
        businessEndTime: data.businessEndTime || null,
        hideCancelations: data.hideCancelations || false,
        eventReminderNotifications: data.eventReminderNotifications || false,
        showMobileCancellations: data.showMobileCancellations || false,

        lavender: data.lavender || false,

        absoluteTotal: data.absoluteTotal || false,

        timeInterval: data.timeInterval || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await settings.setUser(data.user || null, {
      transaction,
    });

    await settings.setDefaultActivity(data.defaultActivity || null, {
      transaction,
    });

    await settings.setDefaultLocation(data.defaultLocation || null, {
      transaction,
    });

    await settings.setDefaultLocation2(data.defaultLocation2 || null, {
      transaction,
    });

    await settings.setTotalCustom(data.totalCustom || null, {
      transaction,
    });

    await settings.setBranchDefault(data.branchDefault || null, {
      transaction,
    });

    await settings.setRolesDefault(data.rolesDefault || [], {
      transaction,
    });

    await settings.setStatsTotalLabels(data.statsTotalLabels || [], {
      transaction,
    });

    return settings;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const settings = await db.settings.findByPk(id, {
      transaction,
    });

    await settings.update(
      {
        sunday: data.sunday || false,

        monday: data.monday || false,

        tuesday: data.tuesday || false,

        wednesday: data.wednesday || false,

        thursday: data.thursday || false,

        friday: data.friday || false,

        saturday: data.saturday || false,

        overbooking: data.overbooking || false,
        emptyAvailability: data.emptyAvailability || false,
        notAvailableBusy: data.notAvailableBusy || false,
        differentBranch: data.differentBranch || false,

        weekends: data.weekends || false,

        blockScheduling: data.blockScheduling || false,

        titleFormatYear: data.titleFormatYear || null,
        titleFormatMonth: data.titleFormatMonth || null,
        titleFormatDay: data.titleFormatDay || null,
        scrollTime: data.scrollTime || null,
        initialView: data.initialView || null,
        timezone: data.timezone || null,
        dateformats: data.dateformats || null,
        hour24: data.hour24 || false,

        driveTime: data.driveTime || false,

        blocks: data.blocks || false,

        orange: data.orange || false,

        recurring: data.recurring || null,
        noGaps: data.noGaps || false,

        driveTimeQuantity: data.driveTimeQuantity || null,
        driveTimeUnit: data.driveTimeUnit || null,
        driveDistanceMax: data.driveDistanceMax || false,

        driveDistanceMaxQuantity: data.driveDistanceMaxQuantity || null,
        driveDistanceMaxUnit: data.driveDistanceMaxUnit || null,
        timeconstraints: data.timeconstraints || false,

        timeConstraintUpperBuffer: data.timeConstraintUpperBuffer || null,
        timeConstraintLowerBuffer: data.timeConstraintLowerBuffer || null,
        rolesFilterLabels: data.rolesFilterLabels || null,
        statsFilterLabels: data.statsFilterLabels || null,
        teamSeparation: data.teamSeparation || false,

        isolateCanceled: data.isolateCanceled || false,

        locationQuantity: data.locationQuantity || null,
        subgroupsFilterLabels: data.subgroupsFilterLabels || null,
        resourceFilterLabels: data.resourceFilterLabels || null,
        hideCancelations: data.hideCancelations || false,
        eventReminderNotifications: data.eventReminderNotifications || false,
        showMobileCancellations: data.showMobileCancellations || false,
        lavender: data.lavender || false,
        absoluteTotal: data.absoluteTotal || false,
        timeInterval: data.timeInterval || null,
        backgroundColorRole: data.backgroundColorRole || null,
        borderColorRole: data.borderColorRole || null,
        businessStartTime: data.businessStartTime || null,
        businessEndTime: data.businessEndTime || null,

        updatedById: currentUser.id,
      },
      { transaction },
    );

    await settings.setUser(data.user || null, {
      transaction,
    });

    await settings.setDefaultActivity(data.defaultActivity || null, {
      transaction,
    });

    await settings.setDefaultLocation(data.defaultLocation || null, {
      transaction,
    });

    await settings.setDefaultLocation2(data.defaultLocation2 || null, {
      transaction,
    });

    await settings.setTotalCustom(data.totalCustom || null, {
      transaction,
    });

    await settings.setBranchDefault(data.branchDefault || null, {
      transaction,
    });

    await settings.setRolesDefault(data.rolesDefault || [], {
      transaction,
    });

    await settings.setStatsTotalLabels(data.statsTotalLabels || [], {
      transaction,
    });

    return settings;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const settings = await db.settings.findByPk(id, options);

    await settings.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await settings.destroy({
      transaction,
    });

    return settings;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const settings = await db.settings.findOne({ where }, { transaction });

    if (!settings) {
      return settings;
    }

    const output = settings.get({ plain: true });

    output.user = await settings.getUser({
      transaction,
    });

    output.defaultActivity = await settings.getDefaultActivity({
      transaction,
    });

    output.defaultLocation = await settings.getDefaultLocation({
      transaction,
    });

    output.defaultLocation2 = await settings.getDefaultLocation2({
      transaction,
    });

    output.rolesDefault = await settings.getRolesDefault({
      transaction,
    });

    output.statsTotalLabels = await settings.getStatsTotalLabels({
      transaction,
    });

    output.totalCustom = await settings.getTotalCustom({
      transaction,
    });

    output.branchDefault = await settings.getBranchDefault({
      transaction,
    });

    return output;
  }

  static async findAll(filter, options) {
    var limit = filter.limit || 0;
    var offset = 0;
    const currentPage = +filter.page - 1;

    offset = currentPage * limit;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      // {
      //   attributes: ['id'],
      //   model: db.users,
      //   as: 'user',
      // },
      // {
      //   attributes: ['id'],
      //   model: db.users,
      //   as: 'createdBy',
      // },
      // {
      //   model: db.users,
      //   as: 'defaultActivity',
      // },
      // {
      //   model: db.roles,
      //   as: 'defaultLocation',
      // },
      // {
      //   model: db.users,
      //   as: 'defaultLocation2',
      // },
      // {
      //   model: db.totaltypes,
      //   as: 'totalCustom',
      // },
      // {
      //   model: db.branches,
      //   as: 'branchDefault',
      // },
      // {
      //   model: db.roles,
      //   as: 'rolesDefault',
      //   through: filter.rolesDefault
      //     ? {
      //         where: {
      //           [Op.or]: filter.rolesDefault.split('|').map((item) => {
      //             return { ['Id']: Utils.uuid(item) };
      //           }),
      //         },
      //       }
      //     : null,
      //   required: filter.rolesDefault ? true : null,
      // },
      // {
      //   attributes: [],
      //   model: db.totaltypes,
      //   as: 'statsTotalLabels',
      //   through: filter.statsTotalLabels
      //     ? {
      //         where: {
      //           [Op.or]: filter.statsTotalLabels.split('|').map((item) => {
      //             return { ['Id']: Utils.uuid(item) };
      //           }),
      //         },
      //       }
      //     : null,
      //   required: filter.statsTotalLabels ? true : null,
      // },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }
      if (filter.createdBy) {
        where = {
          ...where,
          createdById: Utils.uuid(filter.createdBy),
        };
      }

      if (filter.rolesFilterLabels) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'settings',
            'rolesFilterLabels',
            filter.rolesFilterLabels,
          ),
        };
      }

      if (filter.statsFilterLabels) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'settings',
            'statsFilterLabels',
            filter.statsFilterLabels,
          ),
        };
      }

      if (filter.subgroupsFilterLabels) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'settings',
            'subgroupsFilterLabels',
            filter.subgroupsFilterLabels,
          ),
        };
      }

      if (filter.resourceFilterLabels) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'settings',
            'resourceFilterLabels',
            filter.resourceFilterLabels,
          ),
        };
      }

      if (filter.scrollTimeRange) {
        const [start, end] = filter.scrollTimeRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            scrollTime: {
              ...where.scrollTime,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            scrollTime: {
              ...where.scrollTime,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.driveTimeQuantityRange) {
        const [start, end] = filter.driveTimeQuantityRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            driveTimeQuantity: {
              ...where.driveTimeQuantity,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            driveTimeQuantity: {
              ...where.driveTimeQuantity,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.driveDistanceMaxQuantityRange) {
        const [start, end] = filter.driveDistanceMaxQuantityRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            driveDistanceMaxQuantity: {
              ...where.driveDistanceMaxQuantity,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            driveDistanceMaxQuantity: {
              ...where.driveDistanceMaxQuantity,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.timeConstraintUpperBufferRange) {
        const [start, end] = filter.timeConstraintUpperBufferRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            timeConstraintUpperBuffer: {
              ...where.timeConstraintUpperBuffer,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            timeConstraintUpperBuffer: {
              ...where.timeConstraintUpperBuffer,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.timeConstraintLowerBufferRange) {
        const [start, end] = filter.timeConstraintLowerBufferRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            timeConstraintLowerBuffer: {
              ...where.timeConstraintLowerBuffer,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            timeConstraintLowerBuffer: {
              ...where.timeConstraintLowerBuffer,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.locationQuantityRange) {
        const [start, end] = filter.locationQuantityRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            locationQuantity: {
              ...where.locationQuantity,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            locationQuantity: {
              ...where.locationQuantity,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.timeIntervalRange) {
        const [start, end] = filter.timeIntervalRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            timeInterval: {
              ...where.timeInterval,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            timeInterval: {
              ...where.timeInterval,
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

      if (filter.sunday) {
        where = {
          ...where,
          sunday: filter.sunday,
        };
      }

      if (filter.monday) {
        where = {
          ...where,
          monday: filter.monday,
        };
      }

      if (filter.tuesday) {
        where = {
          ...where,
          tuesday: filter.tuesday,
        };
      }

      if (filter.wednesday) {
        where = {
          ...where,
          wednesday: filter.wednesday,
        };
      }

      if (filter.thursday) {
        where = {
          ...where,
          thursday: filter.thursday,
        };
      }

      if (filter.friday) {
        where = {
          ...where,
          friday: filter.friday,
        };
      }

      if (filter.saturday) {
        where = {
          ...where,
          saturday: filter.saturday,
        };
      }

      if (filter.overbooking) {
        where = {
          ...where,
          overbooking: filter.overbooking,
        };
      }

      if (filter.weekends) {
        where = {
          ...where,
          weekends: filter.weekends,
        };
      }

      if (filter.blockScheduling) {
        where = {
          ...where,
          blockScheduling: filter.blockScheduling,
        };
      }

      if (filter.titleFormatYear) {
        where = {
          ...where,
          titleFormatYear: filter.titleFormatYear,
        };
      }

      if (filter.titleFormatMonth) {
        where = {
          ...where,
          titleFormatMonth: filter.titleFormatMonth,
        };
      }

      if (filter.titleFormatDay) {
        where = {
          ...where,
          titleFormatDay: filter.titleFormatDay,
        };
      }

      if (filter.initialView) {
        where = {
          ...where,
          initialView: filter.initialView,
        };
      }

      if (filter.timezone) {
        where = {
          ...where,
          timezone: filter.timezone,
        };
      }

      if (filter.dateformats) {
        where = {
          ...where,
          dateformats: filter.dateformats,
        };
      }

      if (filter.hour24) {
        where = {
          ...where,
          hour24: filter.hour24,
        };
      }

      if (filter.driveTime) {
        where = {
          ...where,
          driveTime: filter.driveTime,
        };
      }

      if (filter.blocks) {
        where = {
          ...where,
          blocks: filter.blocks,
        };
      }

      if (filter.orange) {
        where = {
          ...where,
          orange: filter.orange,
        };
      }

      if (filter.recurring) {
        where = {
          ...where,
          recurring: filter.recurring,
        };
      }

      if (filter.noGaps) {
        where = {
          ...where,
          noGaps: filter.noGaps,
        };
      }

      if (filter.driveTimeUnit) {
        where = {
          ...where,
          driveTimeUnit: filter.driveTimeUnit,
        };
      }

      if (filter.driveDistanceMax) {
        where = {
          ...where,
          driveDistanceMax: filter.driveDistanceMax,
        };
      }

      if (filter.driveDistanceMaxUnit) {
        where = {
          ...where,
          driveDistanceMaxUnit: filter.driveDistanceMaxUnit,
        };
      }

      if (filter.timeconstraints) {
        where = {
          ...where,
          timeconstraints: filter.timeconstraints,
        };
      }

      if (filter.teamSeparation) {
        where = {
          ...where,
          teamSeparation: filter.teamSeparation,
        };
      }

      if (filter.isolateCanceled) {
        where = {
          ...where,
          isolateCanceled: filter.isolateCanceled,
        };
      }

      if (filter.hideCancelations) {
        where = {
          ...where,
          hideCancelations: filter.hideCancelations,
        };
      }

      if (filter.lavender) {
        where = {
          ...where,
          lavender: filter.lavender,
        };
      }

      if (filter.absoluteTotal) {
        where = {
          ...where,
          absoluteTotal: filter.absoluteTotal,
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

      if (filter.defaultActivity) {
        var listItems = filter.defaultActivity.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          defaultActivityId: { [Op.or]: listItems },
        };
      }

      if (filter.defaultLocation) {
        var listItems = filter.defaultLocation.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          defaultLocationId: { [Op.or]: listItems },
        };
      }

      if (filter.defaultLocation2) {
        var listItems = filter.defaultLocation2.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          defaultLocation2Id: { [Op.or]: listItems },
        };
      }

      if (filter.totalCustom) {
        var listItems = filter.totalCustom.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          totalCustomId: { [Op.or]: listItems },
        };
      }

      if (filter.branchDefault) {
        var listItems = filter.branchDefault.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          branchDefaultId: { [Op.or]: listItems },
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

    let rows = await db.settings.findAll({
      where,
      include,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
      benchmark: true,
    });
    let count = rows.length;

    return { rows, count };
  }

  static async findAllReminderNotificationEnabledUserIds() {
    let where = {
      eventReminderNotifications : 1
    };
    let userIds = await db.settings.findAll({
      where,
      attributes : ['createdById'],
      benchmark: true,
    });
    let parsedUserIds = JSON.parse(JSON.stringify(userIds));

    return { rows: parsedUserIds, count: parsedUserIds.length };
  }

  static async findAllAutocomplete(query, limit, filter) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike('settings', 'sunday', query),
        ],
      };
    }

    const records = await db.settings.findAll({
      attributes: ['id', 'sunday'],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['sunday', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.sunday,
    }));
  }
};
