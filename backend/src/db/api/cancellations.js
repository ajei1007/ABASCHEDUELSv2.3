const db = require('../models');
// const FileDBApi = require('./file');
const BranchesDBApi = require('./branches');
// const crypto = require('crypto');
const Utils = require('../utils');
const moment = require('moment');
const { compareSync } = require('bcrypt');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class CancellationsDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const findCancellation = await db.cancellations.findByPk(data.id, {
      ...options,
      paranoid: false,
    });
    // If there is and event like this, then restore it.
    if (findCancellation) {
      await findCancellation.restore();
      return findCancellation;
    }

    const cancellations = await db.cancellations.create(
      {
        id: data.id || undefined,
        date: data.date || null,
        rescheduled: data.rescheduled || false,
        partialRescheduled: data.partialRescheduled || false,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await cancellations.setEvent(data.event || null, {
      transaction,
    });

    await cancellations.setReason(data.reason || null, {
      transaction,
    });

    await cancellations.setUser(data.user || null, {
      transaction,
    });

    return cancellations;
  }

  static async createBulk(data, options) {
    const transaction = (options && options.transaction) || undefined;

    const cancellations = await db.cancellations.bulkCreate(data, {
      transaction,
    });

    return cancellations;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const cancellations = await db.cancellations.findByPk(id, {
      transaction,
    });

    await cancellations.update(
      {
        date: data.date || null,
        rescheduled: data.rescheduled || false,
        partialRescheduled: data.partialRescheduled || false,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await cancellations.setEvent(data.event || null, {
      transaction,
    });

    await cancellations.setReason(data.reason || null, {
      transaction,
    });

    await cancellations.setUser(data.user || null, {
      transaction,
    });

    return cancellations;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const cancellations = await db.cancellations.findByPk(id, options);

    await cancellations.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await cancellations.destroy({
      transaction,
    });

    return cancellations;
  }

  static async removeBulk(ids, options) {
    const transaction = (options && options.transaction) || undefined;

    await db.cancellations.destroy({
      where: {
        id: ids,
      },
      transaction,
    });

    return true;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const cancellations = await db.cancellations.findOne(
      { where },
      { transaction },
    );

    if (!cancellations) {
      return cancellations;
    }

    const output = cancellations.get({ plain: true });

    output.event = await cancellations.getEvent({
      transaction,
    });

    output.reason = await cancellations.getReason({
      transaction,
    });

    output.user = await cancellations.getUser({
      transaction,
    });

    return output;
  }

  static async findAll(filter, options) {
    if (filter.branches) {
      filter.branches = await BranchesDBApi.getDescendentBranches({
        branchIds: filter.branches,
      });
    }
    let limitOffset = Utils.getLimitOffset(filter.limit, filter.page);

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let filterInclude = [];
    let include = [
      {
        model: db.events,
        as: 'event',
        attributes: ['id', 'start', 'end'],
        include: [
          {
            attributes: ['id', 'firstName', 'lastName'],
            model: db.users,
            as: 'activity0',
          },
          {
            attributes: ['id', 'firstName', 'lastName'],
            model: db.users,
            as: 'users',
            through: { attributes: [] },
            include: [
              {
                attributes: ['id', 'name'],
                model: db.branches,
                as: 'branches',
                through: { attributes: [] },
              },
            ],
          },
        ],
      },
      // {
      //   attributes: [],
      //   model: db.users,
      //   as: 'createdBy',
      // },
      {
        model: db.cancellationtypes,
        as: 'reason',
        attributes: ['id', 'name'],
      },
      {
        model: db.users,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName'],
      },
    ];

    if (filter) {
      if (filter.branches && filter.branches.length > 0 && !filter.overbook) {
        where = {
          ...where,
          '$event.users.branches.id$': { [Op.or]: filter.branches },
        };
        // if (filter.roles.length > 0) {
        //   where = {
        //     ...where,
        //     '$event.users.roles.name$': { [Op.or]: filter.roles },
        //   };
        // }
        filterInclude.push({
          model: db.events,
          as: 'event',
          attributes: [],
          include: [
            {
              attributes: [],
              model: db.users,
              as: 'users',
              through: { attributes: [] },
              include: [
                {
                  attributes: [],
                  model: db.branches,
                  as: 'branches',
                  through: { attributes: [] },
                },
                // {
                //   attributes: [],
                //   model: db.roles,
                //   as: 'roles',
                //   through: { attributes: [] },
                // },
              ],
            },
          ],
        });
      }

      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }
      // if (filter.companyId) {
      //   where = {
      //     ...where,
      //     ['$createdBy.companyId$']: Utils.uuid(filter.companyId),
      //   };
      // }

      if (
        filter.start &&
        filter.end
        //&& !filter.overbook
      ) {
        where = {
          ...where,
          [Op.and]: {
            date: {
              //...where.startRecur,
              [Op.lt]: filter.end,
              [Op.gte]: filter.start,
            },
          },
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
          active: filter.active === true || filter.active === 'true',
        };
      }

      if (filter.rescheduled) {
        where = {
          ...where,
          rescheduled: filter.rescheduled,
        };
      }

      if (filter.partialRescheduled) {
        where = {
          ...where,
          partialRescheduled: filter.partialRescheduled,
        };
      }

      if (filter.event) {
        var listItems = filter.event.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          eventId: { [Op.or]: listItems },
        };
      }

      if (filter.reason) {
        var listItems = filter.reason.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          reasonId: { [Op.or]: listItems },
        };
      }
      // if (filter.start && filter.end) {
      //   where = {
      //     ...where,
      //     [Op.and]: {
      //       date: {
      //         //...where.startRecur,
      //         [Op.lt]: filter.end,
      //         [Op.gte]: filter.start,
      //       },
      //     },
      //   };
      // }
      //console.log('fooky', filter.user, filter);

      if (filter.eventIds) {
        var listItems = filter.eventIds.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          eventId: { [Op.or]: listItems },
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

    let cancellationIds = [];
    let numberOfCancellations = 0;

    let queryOptionForGettingTheIds = {
      where,
      attributes: ['id'],
      group: ['id'],
      include: filterInclude,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
      //logging: console.log,
      benchmark: true,
    };

    if (limitOffset.lim >= 0 && limitOffset.off >= 0) {
      queryOptionForGettingTheIds = {
        ...queryOptionForGettingTheIds,
        limit: limitOffset.lim,
        offset: limitOffset.off,
        subQuery: false,
      };
    }

    const results = await db.cancellations.findAndCountAll(
      queryOptionForGettingTheIds,
    );

    cancellationIds = results.rows;
    numberOfCancellations = results.count.length;

    const cannellationIdsParsed = JSON.parse(JSON.stringify(cancellationIds));
    const cancellationIdArray = cannellationIdsParsed.map(
      (cancellation) => cancellation.id,
    );

    if (cancellationIdArray.length == 0) {
      return { rows: [], count: 0 };
    }

    let rows = await db.cancellations.findAll({
      where: {
        id: { [Op.or]: cancellationIdArray },
      },
      include,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
      attributes: ['id', 'date', 'rescheduled', 'partialRescheduled'],
      benchmark: true,
    });

    // const fo = await db.cancellations.findAll({
    //   where,
    //   include,
    //   limit: limit ? Number(limit) : undefined,
    //   offset: offset ? Number(offset) : undefined,
    //   order:
    //     filter.field && filter.sort
    //       ? [[filter.field, filter.sort]]
    //       : [['createdAt', 'desc']],
    //   transaction,
    //   attributes: ['id', 'date', 'rescheduled', 'partialRescheduled'],
    //   benchmark: true,
    // });

    // const c = await db.cancellations.count({
    //   where,
    //   transaction,
    //   benchmark: true,
    // });

    return { rows: rows, count: numberOfCancellations };
  }

  static async findAllWithEventIDs(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        model: db.cancellationtypes,
        as: 'reason',
        attributes: ['id'],
      },
      {
        model: db.users,
        as: 'user',
        attributes: ['id'],
      },
    ];

    if (filter.IncludeEvents) {
      include.push({
        model: db.events,
        as: 'event',
        attributes: ['id'],
      });
    }

    if (filter.eventIDs.length > 0) {
      where = {
        ...where,
        eventId: { [Op.or]: filter.eventIDs },
      };
    }

    const fo = await db.cancellations.findAll({
      where,
      include,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
      attributes: [
        'id',
        'date',
        'rescheduled',
        'partialRescheduled',
        'eventId',
      ],
      benchmark: true,
    });

    return { rows: fo, count: fo.length };
  }

  static async filterCancelledEventIds(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [];

    if (filter.eventIDs.length > 0) {
      where = {
        ...where,
        eventId: { [Op.or]: filter.eventIDs },
      };
    }

    const fo = await db.cancellations.findAll({
      where,
      include,
      transaction,
      attributes: ['eventId'],
      benchmark: true,
    });

    let parsedEventIds = JSON.parse(JSON.stringify(fo));

    let eventIds = [];

    for (let i = 0; i < parsedEventIds.length; i++) {
      eventIds.push(parsedEventIds[i].eventId);
    }

    return { data: eventIds };
  }

  static async filterCancelledEventIdsAndCancellerIds(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [];

    if (filter.eventIDs.length > 0) {
      where = {
        ...where,
        eventId: { [Op.or]: filter.eventIDs },
      };
    }

    const fo = await db.cancellations.findAll({
      where,
      include,
      transaction,
      attributes: ['eventId', 'userId'],
      benchmark: true,
    });

    let parsedEventIds = JSON.parse(JSON.stringify(fo));

    let eventIds = new Array();
    let userIds = new Array();

    for (let i = 0; i < parsedEventIds.length; i++) {
      eventIds.push(parsedEventIds[i].eventId);
      userIds.push(parsedEventIds[i].userId);
    }

    return { eventIds: eventIds, userIds: userIds };
  }

  static async findAllFaster(filter, options) {
    var limit = filter.limit || 0;
    var offset = 0;
    const currentPage = +filter.page - 1;

    offset = currentPage * limit;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        model: db.events,
        as: 'event',
      },
      {
        model: db.cancellationtypes,
        as: 'reason',
      },
      {
        model: db.users,
        as: 'user',
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
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
          active: filter.active === true || filter.active === 'true',
        };
      }

      if (filter.event) {
        var listItems = filter.event.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          eventId: { [Op.or]: listItems },
        };
      }

      if (filter.reason) {
        var listItems = filter.reason.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          reasonId: { [Op.or]: listItems },
        };
      }

      if (filter.start && filter.end) {
        where = {
          ...where,
          [Op.and]: {
            date: {
              //...where.startRecur,
              [Op.lt]: filter.end,
              [Op.gte]: filter.start,
            },
          },
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

    // let { rows, count } = await db.cancellations.findAndCountAll(
    //   {
    //     where,
    //     include,
    //     limit: limit ? Number(limit) : undefined,
    //     offset: offset ? Number(offset) : undefined,
    //     order: (filter.field && filter.sort)
    //       ? [[filter.field, filter.sort]]
    //       : [['createdAt', 'desc']],
    //     transaction,
    //   },
    // );

    const opt = {
      type: db.sequelize.QueryTypes.SELECT,
      hasJoin: true,
      include,
    };
    db.cancellations._validateIncludedElements(opt);
    const query =
      "SELECT `cancellations`.`id`, `cancellations`.`date`, `cancellations`.`importHash`, `cancellations`.`createdAt`, `cancellations`.`updatedAt`, `cancellations`.`deletedAt`, `cancellations`.`eventId`, `cancellations`.`reasonId`, `cancellations`.`userId`, `cancellations`.`createdById`, `cancellations`.`updatedById`, `event`.`id` AS `event.id`, `event`.`start` AS `event.start`, `event`.`end` AS `event.end`, `event`.`address` AS `event.address`, `event`.`longitude` AS `event.longitude`, `event`.`latitude` AS `event.latitude`, `event`.`startRecur` AS `event.startRecur`, `event`.`endRecur` AS `event.endRecur`, `event`.`frequency` AS `event.frequency`, `event`.`interval` AS `event.interval`, `event`.`background` AS `event.background`, `event`.`border` AS `event.border`, `event`.`notes` AS `event.notes`, `event`.`secondary` AS `event.secondary`, `event`.`allDay` AS `event.allDay`, `event`.`visible` AS `event.visible`, `event`.`importHash` AS `event.importHash`, `event`.`createdAt` AS `event.createdAt`, `event`.`updatedAt` AS `event.updatedAt`, `event`.`deletedAt` AS `event.deletedAt`, `event`.`eventConnectId` AS `event.eventConnectId`, `event`.`createdById` AS `event.createdById`, `event`.`updatedById` AS `event.updatedById`, `reason`.`id` AS `reason.id`, `reason`.`name` AS `reason.name`, `reason`.`importHash` AS `reason.importHash`, `reason`.`createdAt` AS `reason.createdAt`, `reason`.`updatedAt` AS `reason.updatedAt`, `reason`.`deletedAt` AS `reason.deletedAt`, `reason`.`createdById` AS `reason.createdById`, `reason`.`updatedById` AS `reason.updatedById`, `user`.`id` AS `user.id`, `user`.`capacity` AS `user.capacity`, `user`.`firstName` AS `user.firstName`, `user`.`lastName` AS `user.lastName`, `user`.`phoneNumber` AS `user.phoneNumber`, `user`.`email` AS `user.email`, `user`.`role` AS `user.role`, `user`.`disabled` AS `user.disabled`, `user`.`password` AS `user.password`, `user`.`emailVerified` AS `user.emailVerified`, `user`.`emailVerificationToken` AS `user.emailVerificationToken`, `user`.`emailVerificationTokenExpiresAt` AS `user.emailVerificationTokenExpiresAt`, `user`.`passwordResetToken` AS `user.passwordResetToken`, `user`.`passwordResetTokenExpiresAt` AS `user.passwordResetTokenExpiresAt`, `user`.`provider` AS `user.provider`, `user`.`gender` AS `user.gender`, `user`.`alias` AS `user.alias`, `user`.`otherPhones` AS `user.otherPhones`, `user`.`otherEmails` AS `user.otherEmails`, `user`.`address` AS `user.address`, `user`.`longitude` AS `user.longitude`, `user`.`latitude` AS `user.latitude`, `user`.`active` AS `user.active`, `user`.`minHours` AS `user.minHours`, `user`.`maxHours` AS `user.maxHours`, `user`.`color` AS `user.color`, `user`.`birthday` AS `user.birthday`, `user`.`mobiletoken` AS `user.mobiletoken`, `user`.`address2` AS `user.address2`, `user`.`address2Default` AS `user.address2Default`, `user`.`billable` AS `user.billable`, `user`.`allBranches` AS `user.allBranches`, `user`.`paid` AS `user.paid`, `user`.`idCustom` AS `user.idCustom`, `user`.`importHash` AS `user.importHash`, `user`.`createdAt` AS `user.createdAt`, `user`.`updatedAt` AS `user.updatedAt`, `user`.`deletedAt` AS `user.deletedAt`, `user`.`parentId` AS `user.parentId`, `user`.`resourceId` AS `user.resourceId`, `user`.`companyId` AS `user.companyId`, `user`.`locationTypeId` AS `user.locationTypeId`, `user`.`address1RelationshipId` AS `user.address1RelationshipId`, `user`.`address2RelationshipId` AS `user.address2RelationshipId`, `user`.`createdById` AS `user.createdById`, `user`.`updatedById` AS `user.updatedById` FROM `cancellations` AS `cancellations` LEFT OUTER JOIN `events` AS `event` ON `cancellations`.`eventId` = `event`.`id` AND (`event`.`deletedAt` IS NULL) LEFT OUTER JOIN `cancellationtypes` AS `reason` ON `cancellations`.`reasonId` = `reason`.`id` AND (`reason`.`deletedAt` IS NULL) LEFT OUTER JOIN `users` AS `user` ON `cancellations`.`userId` = `user`.`id` AND (`user`.`deletedAt` IS NULL) WHERE (`cancellations`.`deletedAt` IS NULL AND ((`cancellations`.`date` <= '" +
      filter.end +
      "' AND `cancellations`.`date` >= '" +
      filter.start +
      "'))) ORDER BY `cancellations`.`createdAt` DESC";
    const timeconstraints = await db.sequelize.query(query, opt);

    return { rows: timeconstraints, count: timeconstraints.length };
  }

  static async findAllAutocomplete(query, limit, filter) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike('cancellations', 'event', query),
        ],
      };
    }

    const records = await db.cancellations.findAll({
      attributes: ['id', 'event'],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['event', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.event,
    }));
  }
};
