const db = require('../models');
const FileDBApi = require('./file');
const BranchesDBApi = require('./branches');
const crypto = require('crypto');
const Utils = require('../utils');
const moment = require('moment');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class StatuseventsDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    // there shouldn't be 2 statusevents
    // with same userId, eventId, startdatetime, status
    const existingRecord = await db.statusevents.findOne({
      where: {
        startdatetime: data.startdatetime,
        status: data.status,
        userId: data.user,
        eventId: data.event,
      },
    });

    if (existingRecord){
      return existingRecord;
    }

    const statusevents = await db.statusevents.create(
      {
        id: data.id || undefined,

        startdatetime: data.startdatetime || null,
        status: data.status || null,
        note: data.note || null,
        noteadmin: data.noteadmin || null,
        late: data.late || false,

        latetime: data.latetime || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await statusevents.setEvent(data.event || null, {
      transaction,
    });

    await statusevents.setUser(data.user || null, {
      transaction,
    });

    await statusevents.setReason(data.reason || null, {
      transaction,
    });

    return statusevents;
  }

  static async updateStatus(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const statusevents = await db.statusevents.findByPk(id, {
      transaction,
    });

    await statusevents.update(
      {
        status: data.status || null,
        updatedById: currentUser.id,
        ...(data.noteadmin && { noteadmin: data.noteadmin }),
      },
      { transaction },
    );

    return statusevents;
  }
  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const statusevents = await db.statusevents.findByPk(id, {
      transaction,
    });

    await statusevents.update(
      {
        startdatetime: data.startdatetime || null,
        status: data.status || null,
        note: data.note || null,
        noteadmin: data.noteadmin || null,
        late: data.late || false,

        latetime: data.latetime || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await statusevents.setEvent(data.event || null, {
      transaction,
    });

    await statusevents.setUser(data.user || null, {
      transaction,
    });

    await statusevents.setReason(data.reason || null, {
      transaction,
    });

    return statusevents;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const statusevents = await db.statusevents.findByPk(id, options);

    await statusevents.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await statusevents.destroy({
      transaction,
    });

    return statusevents;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const statusevents = await db.statusevents.findOne(
      { where },
      { transaction },
    );

    if (!statusevents) {
      return statusevents;
    }

    const output = statusevents.get({ plain: true });

    output.event = await statusevents.getEvent({
      transaction,
    });

    output.user = await statusevents.getUser({
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
    var limit = filter.limit || 0;
    var offset = 0;
    const currentPage = +filter.page - 1;

    offset = currentPage * limit;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        attributes: [
          'id',
          'start',
          'end',
          'startRecur',
          'endRecur',
          'deletedAt',
        ],
        model: db.events,
        where: { deletedAt: { [Op.eq]: null } },
        as: 'event',
      },
      {
        model: db.users,
        as: 'createdBy',
        paranoid: false,
        attributes: ['id', 'firstName'],
      },
      {
        attributes: ['id', 'name'],
        model: db.cancellationtypes,
        as: 'reason',
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
          ['$user.companyId$']: Utils.uuid(filter.companyId),
        };
      }

      if (filter.branches && filter.branches.length > 0) {
        where = {
          ...where,
          ['$user.branches.id$']: { [Op.or]: filter.branches },
        };
      }

      if (filter.ids) {
        var listItems = filter.ids.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          id: { [Op.or]: listItems },
        };
      }

      if (filter.note) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('statusevents', 'note', filter.note),
        };
      }

      if (filter.noteadmin) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('statusevents', 'noteadmin', filter.noteadmin),
        };
      }

      if (filter.startdatetimeRange) {
        const [start, end] = filter.startdatetimeRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            startdatetime: {
              ...where.startdatetime,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            startdatetime: {
              ...where.startdatetime,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.latetimeRange) {
        const [start, end] = filter.latetimeRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            latetime: {
              ...where.latetime,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            latetime: {
              ...where.latetime,
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

      if (filter.status) {
        where = {
          ...where,
          status: filter.status,
        };
      }

      if (filter.late) {
        where = {
          ...where,
          late: filter.late,
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

    let { rows, count } = await db.statusevents.findAndCountAll({
      where,
      include,
      //limit: limit ? Number(limit) : undefined,
      // offset: offset ? Number(offset) : undefined,
      //logging: console.log,
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

  static async findAllForConfirmation(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let user_include_event = [];
    user_include_event = [
      {
        attributes: ['id', 'firstName', 'color'],
        model: db.users,
        as: 'activity0',
      },
      {
        attributes: ['id', 'firstName', 'lastName'],
        model: db.users,
        as: 'users',
        through: { attributes: [] },
      },
    ];

    let include = [
      {
        attributes: ['id', 'firstName', 'lastName'],
        model: db.users,
        as: 'user',
      },
      {
        attributes: ['id', 'name'],
        model: db.cancellationtypes,
        as: 'reason',
      },
      {
        model: db.users,
        as: 'createdBy',
        attributes: ['id', 'firstName', 'lastName'],
      },
      {
        model: db.users,
        as: 'updatedBy',
        paranoid: false,
        attributes: ['id', 'firstName', 'lastName'],
      },
    ];

    if (filter) {
      if (filter.includeEvent) {
        include.push({
          attributes: [
            'id',
            'eventGroupId',
            'start',
            'end',
            'startRecur',
            'endRecur',
            'deletedAt',
          ],
          model: db.events,
          where: { deletedAt: { [Op.eq]: null } },
          include: user_include_event,
          as: 'event',
        });
      }

      if (filter.ids) {
        var listItems = filter.ids.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          id: { [Op.or]: listItems },
        };
      }

      if (filter.note) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('statusevents', 'note', filter.note),
        };
      }

      if (filter.noteadmin) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('statusevents', 'noteadmin', filter.noteadmin),
        };
      }

      if (filter.start && filter.end) {
        where = {
          ...where,
          startdatetime: {
            [Op.gte]: filter.start,
            [Op.lt]: filter.end,
          },
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

      if (filter.status) {
        where = {
          ...where,
          status: filter.status,
        };
      }

      if (filter.late) {
        where = {
          ...where,
          late: filter.late,
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

      if (filter.user) {
        var listItems = filter.user.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          userId: { [Op.or]: listItems },
        };
      }

      if (filter.companyId) {
        where = {
          ...where,
          '$user.companyId$': filter.companyId,
        };
      }
    }

    let statusEvents = await db.statusevents.findAll({
      where,
      include,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
    });

    let res = JSON.parse(JSON.stringify(statusEvents));

    return res;
  }

  static async findAllForSchedulerTable(filter, options) {
    let limitOffset = Utils.getLimitOffset(filter.limit, filter.page);
    const transaction = (options && options.transaction) || undefined;

    let where = {
      '$event.id$': {
        [Op.ne]: null,
      },
    };
    let include = [
      {
        model: db.events,
        as: 'event',
        include: [
          {
            attributes: ['id', 'firstName'],
            model: db.users,
            as: 'activity0',
          },
          {
            attributes: ['id', 'firstName', 'lastName'],
            model: db.users,
            as: 'users',
            through: { attributes: [] },
          },
        ],
      },
      {
        attributes: ['id', 'firstName', 'lastName'],
        model: db.users,
        as: 'user',
      },
    ];

    if (filter.start && filter.end) {
      where = {
        ...where,
        startdatetime: {
          [Op.gte]: filter.start,
          [Op.lte]: filter.end,
        },
      };
    }

    if (filter.status.length > 0) {
      where = {
        ...where,
        status: { [Op.or]: filter.status },
      };
    }

    if (filter.user.length) {
      where = {
        ...where,
        userId: { [Op.or]: filter.user },
      };
    }

    let statusIds = [];
    let numberOfStatuses = 0;
    let queryOptionForGettingTheIds = {
      where,
      attributes: ['id'],
      include: [
        {
          model: db.events,
          as: 'event',
          attributes: [],
        },
      ],
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
      benchmark: true,
    };

    if (limitOffset.lim >= 0 && limitOffset.off >= 0) {
      queryOptionForGettingTheIds = {
        ...queryOptionForGettingTheIds,
        limit: limitOffset.lim,
        offset: limitOffset.off,
      };
    }

    const results = await db.statusevents.findAndCountAll(
      queryOptionForGettingTheIds,
    );

    statusIds = results.rows;
    numberOfStatuses = results.count;

    const statusIdsParsed = JSON.parse(JSON.stringify(statusIds));
    const statusIdArray = statusIdsParsed.map((status) => status.id);
    let rows = [];
    let parsedStatus = [];
    if (statusIdArray.length > 0) {
      rows = await db.statusevents.findAll({
        where: {
          id: { [Op.or]: statusIdArray },
        },
        include,
        order:
          filter.field && filter.sort
            ? [[filter.field, filter.sort]]
            : [['createdAt', 'desc']],
        transaction,
        benchmark: true,
      });
      parsedStatus = JSON.parse(JSON.stringify(rows));
    }

    let response = new Array();
    for (let i = 0; i < parsedStatus.length; i++) {
      let title =
        moment(parsedStatus[i].event.start).format('h:mm A') +
        '-' +
        moment(parsedStatus[i].event.end).format('h:mm A') +
        ' ';
      parsedStatus[i].event.users.forEach(
        (user) => (title += user.firstName + ' ' + user.lastName + ' - '),
      );
      title += parsedStatus[i].event.activity0?.firstName;
      parsedStatus[i].event.title = title;
    }

    return { rows: parsedStatus, count: numberOfStatuses };
  }

  static async findAllAutocomplete(query, limit) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike('statusevents', 'id', query),
        ],
      };
    }

    const records = await db.statusevents.findAll({
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
