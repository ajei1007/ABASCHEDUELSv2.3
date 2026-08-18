const db = require('../models');
const BranchesDBApi = require('./branches');
const RolesDBApi = require('./roles');
const Utils = require('../utils');
const moment = require('moment');
const momentTimezone = require('moment-timezone');
const Sequelize = db.Sequelize;
const Op = Sequelize.Op;
const col = Sequelize.col;
const where_function = Sequelize.where;
const rule_RRule = require('rrule');
const { v4: uuidv4 } = require('uuid');

const get_days = (data) => {
  if (!data.daysOfWeek)
    return {
      U: data.U || false,
      M: data.M || false,
      T: data.T || false,
      W: data.W || false,
      R: data.R || false,
      F: data.F || false,
      S: data.S || false,
    };

  let U = false;
  let M = false;
  let T = false;
  let W = false;
  let R = false;
  let F = false;
  let S = false;

  if (data.daysOfWeek.includes('20770718-a98e-499f-ae8b-c395f0f743bb')) {
    U = true;
  }
  if (data.daysOfWeek.includes('2d0599e7-2729-49ee-acbe-ede6de8ad9b7')) {
    M = true;
  }
  if (data.daysOfWeek.includes('3260c7e7-c57b-4144-803f-7db9cf88393c')) {
    T = true;
  }
  if (data.daysOfWeek.includes('56cbe76a-0cf6-4647-8a49-2ef9fd102079')) {
    W = true;
  }
  if (data.daysOfWeek.includes('6d92706c-9bb1-447e-bf74-572609066663')) {
    R = true;
  }
  if (data.daysOfWeek.includes('ecd70b60-3fef-4d43-9181-2f9db60e19fe')) {
    F = true;
  }
  if (data.daysOfWeek.includes('fa2adb44-e5ba-4586-ae19-5f1e1767228d')) {
    S = true;
  }
  return { U, M, T, W, R, F, S };
};
const get_week_day_ids = (data) => {
  let result = [];
  if (data?.U) {
    result.push('20770718-a98e-499f-ae8b-c395f0f743bb');
  }

  if (data?.M) {
    result.push('2d0599e7-2729-49ee-acbe-ede6de8ad9b7');
  }

  if (data?.T) {
    result.push('3260c7e7-c57b-4144-803f-7db9cf88393c');
  }

  if (data?.W) {
    result.push('56cbe76a-0cf6-4647-8a49-2ef9fd102079');
  }

  if (data?.R) {
    result.push('6d92706c-9bb1-447e-bf74-572609066663');
  }

  if (data?.F) {
    result.push('ecd70b60-3fef-4d43-9181-2f9db60e19fe');
  }

  if (data?.S) {
    result.push('fa2adb44-e5ba-4586-ae19-5f1e1767228d');
  }

  return result;
};
function convertToDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // Months are zero-based in JavaScript
}

function buildStatusFilterings(filter) {
  let statusArray = [];
  if (filter.status) {
    statusArray = Array.isArray(filter.status)
      ? filter.status
      : [filter.status].filter(Boolean);
  }

  if (statusArray.length === 0) {
    return {
      where: {},
      options: {
        paranoid: false,
      },
    };
  }

  const showDeleted = statusArray.includes('showDeleted');
  const showCanceled = statusArray.includes('showCanceled');
  const showActive = statusArray.includes('showActive');

  const options = {
    paranoid: !showDeleted,
  };

  const where = {};

  if (showDeleted && (showActive || showCanceled)) {
    const conditions = [];
    
    conditions.push({ deletedAt: { [Op.ne]: null } });
    
    if (showActive && showCanceled) {
      conditions.push({ deletedAt: null });
    } else if (showActive) {
      conditions.push({ deletedAt: null, isCancelled: false });
    } else if (showCanceled) {
      conditions.push({ deletedAt: null, isCancelled: true });
    }
    
    where[Op.or] = conditions;
  } else if (showActive && showCanceled) {
    // No isCancelled filter needed - returns both
  } else if (showActive) {
    where.isCancelled = false;
  } else if (showCanceled) {
    where.isCancelled = true;
  } else if (showDeleted) {
    where.deletedAt = { [Op.ne]: null };
  }

  return { where, options };
}

function getDaysOfWeekBetween(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  let dates = [];

  // While the current date is less than the end date
  while (startDate <= endDate) {
    // Push the current date to the array
    dates.push(startDate.getDay());
    // Move to the next day
    startDate.setDate(startDate.getDate() + 1);
  }

  // Return the array of dates
  return [...new Set(dates)];
}

function createDayArrayFromDaysOfWeek(days) {
  let day_array = [];
  days.forEach((d) => {
    if (d == 0) {
      day_array.push('U');
    } else if (d == 1) {
      day_array.push('M');
    } else if (d == 2) {
      day_array.push('T');
    } else if (d == 3) {
      day_array.push('W');
    } else if (d == 4) {
      day_array.push('R');
    } else if (d == 5) {
      day_array.push('F');
    } else if (d == 6) {
      day_array.push('S');
    }
  });
  return day_array;
}

module.exports = class EventsDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const findEvent = await db.events.findByPk(data.id, {
      ...options,
      paranoid: false,
    });
    // If there is and event like this, then restore it.
    if (findEvent) {
      await findEvent.restore();
      return findEvent;
    }
    const startDatetime =
      data.startRecur && data.start
        ? `${data.startRecur} ${
            new Date(data.start).toTimeString().split(' ')[0]
          }`
        : null;

    const endDatetime =
      data.endRecur && data.end
        ? `${data.endRecur} ${new Date(data.end).toTimeString().split(' ')[0]}`
        : null;

    const eventIdReal = data.id || uuidv4();
    const obj = {
      id: eventIdReal,
      start: data.start || null,
      end: data.end || null,
      //default value of startActual and endActual is start and end
      startActual: data.startActual || data.start,
      endActual: data.endActual || data.end,
      // Combine startRecur date and time from data.start
      startDatetime: startDatetime,

      // Combine endRecur date and time from data.end
      endDatetime: endDatetime,
      address: data.address || null,
      integratedAt: data.integratedAt || null,
      eventIdCustoms: data.eventIdCustoms || null,
      longitude: data.longitude || null,
      latitude: data.latitude || null,
      distance: data.distance || null,
      driveDuration: data.driveDuration || null,
      startRecur: data.startRecur || null,
      endRecur: data.endRecur || null,
      frequency: data.frequency || null,
      interval: data.interval || null,
      background: data.background || null,
      activity0Id: data.activity0Id || null,
      location0Id: data.location0Id || null,
      border: data.border || null,
      notes: data.notes || null,
      secondary: data.secondary || false,
      allDay: data.allDay || false,
      visible: data.visible || false,
      sandboxMode: data.sandboxMode || false,
      ...get_days(data),
      bysetpos: data.frequency === 'Monthly' ? data.bysetpos : null,
      importHash: data.importHash || null,
      isCancelled: data.isCancelled || false,
      cancellationReasonId: data.cancellationReasonId || null,
      timezone: data.timezone || null,
      eventGroupId: data.eventGroupId || uuidv4(),
      cancelledByUserId: data.cancelledByUserId || null,
      createdById: data?.createdById ?? currentUser?.id,
      updatedById: data?.updatedById ?? currentUser?.id,
      supervisionId: data.supervisionId || null,

      //
      converted: data.converted || false,
      userIds: data.users,
    };

    // TODO @jepbarasgarov try not to check startRecur/endRecur as following, validation must be done in services file
    // TODO I think you should make validations/eventsValidator.js file that should be
    if (
      true ||
      (data.startRecur && data.endRecur && data.startRecur != data.endRecur)
    ) {
      const events = await db.events.create(obj, { transaction });

      // await events.setUsers(data.users || [], {
      //   through: {
      //     startDatetime23: startDatetime,
      //     endDatetime23: endDatetime,
      //   },
      //   transaction,
      // });
      const now = new Date().toISOString().slice(0, 19).replace('T', ' '); // 'YYYY-MM-DD HH:MM:SS'
      const values = data.users
        .map(
          (user) =>
            `('${eventIdReal}', '${user}', '${startDatetime}', '${endDatetime}','${now}', '${now}')`,
        )
        .join(', ');

      // Full SQL query
      const query = `
    INSERT INTO eventsUsersUsers (eventId, userId, startDatetime2, endDatetime2, createdAt, updatedAt)
    VALUES ${values}
    ON DUPLICATE KEY UPDATE
      startDatetime2 = VALUES(startDatetime2),
      endDatetime2 = VALUES(endDatetime2);
  `;

      // Execute the query
      await db.sequelize.query(query, { transaction });

      const output = events.get({ plain: true });
      output.location0 = await events.getLocation0({
        transaction,
      });

      const parsedRows = JSON.parse(JSON.stringify(output));
      return parsedRows;
    } else {
      return {};
    }
  }
   /**
   * Bulk-insert events with user links in one transaction.
   *
   * @param   {Array<Object>} rawEvents   –  each element looks like  { data , users }
   * @param   {Object}        options     –  { currentUser , transaction }
   * @return  {Promise<Array<Object>>}    –  plain rows (same shape as your create)
   */
  static async bulkCreate(rawEvents, options = {}) {
    const currentUser = options.currentUser ?? { id: null };
    const externalTx  = options.transaction ?? null;

    // ── 1. Build rows & junction table values in memory ───────────────
    const insertData = []
    const junctionValues = [];      // raw strings for VALUES(…)
    const nowSQL = new Date().toISOString().slice(0, 19).replace('T', ' ');

    /* ----- 2.   build real column objects + junction row strings ----- */
    for (const data of rawEvents) {
      const eventId = data.id || uuidv4()
      const startDatetime = data.startRecur && data.start
        ? `${data.startRecur} ${new Date(data.start).toTimeString().split(' ')[0]}`
        : null;

      const endDatetime = data.endRecur && data.end
        ? `${data.endRecur} ${new Date(data.end).toTimeString().split(' ')[0]}`
        : null;

      const obj = {
        id           : eventId,
        start        : data.start || null,
        end          : data.end || null,
        startActual  : data.startActual || data.start,
        endActual    : data.endActual   || data.end,
        startDatetime,
        endDatetime,
        address      : data.address      || null,
        integratedAt : data.integratedAt || null,
        eventIdCustoms: data.eventIdCustoms || null,
        longitude    : data.longitude    || null,
        latitude     : data.latitude     || null,
        distance     : data.distance     || null,
        driveDuration: data.driveDuration|| null,
        startRecur   : data.startRecur   || null,
        endRecur     : data.endRecur     || null,
        frequency    : data.frequency    || null,
        interval     : data.interval     || null,
        background   : data.background   || null,
        activity0Id  : data.activity0Id  || null,
        location0Id  : data.location0Id  || null,
        border       : data.border       || null,
        notes        : data.notes        || null,
        secondary    : data.secondary    || false,
        allDay       : data.allDay       || false,
        visible      : data.visible      || false,
        sandboxMode  : data.sandboxMode  || false,
        ...get_days(data),
        bysetpos     : data.frequency === 'Monthly' ? data.bysetpos : null,
        importHash   : data.importHash   || null,
        isCancelled  : data.isCancelled  || false,
        cancellationReasonId: data.cancellationReasonId || null,
        timezone     : data.timezone     || null,
        eventGroupId : data.eventGroupId || uuidv4(),
        cancelledByUserId: data.cancelledByUserId || null,
        createdById  : data?.createdById  ?? currentUser?.id,
        updatedById  : data?.updatedById  ?? currentUser?.id,
        supervisionId: data.supervisionId || null,
        converted    : data.converted     || false,
        userIds      : data.users,
      };

      insertData.push(obj);

      // user links
      const valuesStr = data.users
        .map(u =>
          `('${eventId}', '${u}', '${startDatetime}', '${endDatetime}', '${nowSQL}', '${nowSQL}')`)
        .join(', ');
      junctionValues.push(valuesStr);
    }

    // ── 3. One transaction with two statements ─────────────────────────
    const tx = externalTx || await db.sequelize.transaction();
    try {
      const created = await db.events.bulkCreate(insertData, {
        transaction : tx,
        validate    : false,
      });

      if (junctionValues.length) {
        await db.sequelize.query(
          `INSERT INTO eventsUsersUsers
             (eventId, userId, startDatetime2, endDatetime2, createdAt, updatedAt)
           VALUES ${junctionValues.join(', ')}
           ON DUPLICATE KEY UPDATE
             startDatetime2 = VALUES(startDatetime2),
             endDatetime2   = VALUES(endDatetime2);`,
          { transaction: tx },
        );
      }
      if (!externalTx) await tx.commit();
      return created.map(e => e.get({ plain: true }));
    } catch (err) {
      if (!externalTx) await tx.rollback();
      throw err;
    }
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const events = await db.events.findByPk(id, {
      transaction,
    });

    if (data.cancellationReasonId || data.cancelledByUserId) {
      data.isCancelled = true;
    }

    const currentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS');
    events.changed('updatedAt', true);
    const startDatetime =
      data.startRecur && data.start
        ? `${data.startRecur} ${
            new Date(data.start).toTimeString().split(' ')[0]
          }`
        : null;

    const endDatetime =
      data.endRecur && data.end
        ? `${data.endRecur} ${new Date(data.end).toTimeString().split(' ')[0]}`
        : null;

    let obj = {
      start: data.start || null,
      end: data.end || null,
      //default value of startActual and endActual is start and end
      startActual: data.startActual || data.start,
      endActual: data.endActual || data.end,
      // Combine startRecur date and time from data.start
      startDatetime: startDatetime,

      // Combine endRecur date and time from data.end
      endDatetime: endDatetime,
      integratedAt: data.integratedAt || null,
      address: data.address || null,
      //eventIdCustom: data.eventIdCustom || null,
      longitude: data.longitude || null,
      latitude: data.latitude || null,
      distance: data.distance || null,
      driveDuration: data.driveDuration || null,
      startRecur: data.startRecur || null,
      endRecur: data.endRecur || null,
      frequency: data.frequency || null,
      interval: data.interval || null,
      background: data.background || null,
      bysetpos: data.frequency === 'Monthly' ? data.bysetpos || '1' : null,
      border: data.border || null,
      notes: data.notes || null,
      ...get_days(data),
      activity0Id: data.activity0Id || null,
      location0Id: data.location0Id || null,
      secondary: data.secondary || false,
      allDay: data.allDay || false,
      converted: data.converted || false,
      visible: data.visible || false,
      sandboxMode: data.sandboxMode || false,
      updatedAt: currentDateTime,
      isCancelled: data.isCancelled || false,
      timezone: data.timezone || null,
      eventGroupId: data.eventGroupId || uuidv4(),
      cancellationReasonId: data.cancellationReasonId || null,
      cancelledByUserId: data.cancelledByUserId || null,
      updatedById: data?.updatedById ?? currentUser?.id,
      userIds: data.users,
    };
    if (data.eventIdCustom) {
      obj = { ...obj, eventIdCustom: data.eventIdCustom };
    }

    if (data.updateSupervisionID) {
      obj = { ...obj, supervisionId: data.supervisionId };
    }
    await events.update(obj, {
      transaction,
    });

    // await events.setEventConnect(data.eventConnect || null, {
    //   transaction,
    // });

    // await events.setStatus(data.status || null, {
    //   transaction,
    // });

    // await events.setUsers(data.users || [], {
    //   transaction,
    // });
    const now = new Date().toISOString().slice(0, 19).replace('T', ' '); // MySQL-compatible timestamp

    // Step 1: Delete existing associations for the given eventId
    const deleteQuery = `
      DELETE FROM eventsUsersUsers
      WHERE eventId = '${data.id}';
    `;
    await db.sequelize.query(deleteQuery, { transaction });

    // Step 2: Insert new associations
    const values = data.users
      .map(
        (user) =>
          `('${data.id}', '${user}', '${startDatetime}', '${endDatetime}', '${now}', '${now}')`,
      )
      .join(', ');

    const insertQuery = `
      INSERT INTO eventsUsersUsers (eventId, userId, startDatetime2, endDatetime2, createdAt, updatedAt)
      VALUES ${values};
    `;
    await db.sequelize.query(insertQuery, { transaction });

    // await events.setCancellations(data.cancellations || [], {
    //   transaction,
    // });

    // await events.setExclusions(data.exclusions || [], {
    //   transaction,
    // });

    // await events.setDaysOfWeek(data.daysOfWeek || [], {
    //   transaction,
    // });

    // await events.setUsersVirtual(data.usersVirtual || [], {
    //   transaction,
    // });

    const output = events.get({ plain: true });
    output.location0 = await events.getLocation0({
      transaction,
    });

    const parsedRows = JSON.parse(JSON.stringify(output));
    return parsedRows;
  }

  static async enableSandboxModeOfEvents(data, options) {
    const eventIds = data.eventIds;
    const sandboxMode = data.sandboxMode;
    const transaction = (options && options.transaction) || undefined;

    await db.events.update(
      { sandboxMode },
      { where: { id: eventIds } },
      { transaction },
    );
  }

  static async changeCancellationOfEvent(data, options) {
    const eventId = data.eventId;
    const cancellationReasonId = data.cancellationReasonId;
    const cancelledByUserId = data.cancelledByUserId;

    const transaction = (options && options.transaction) || undefined;
    const currentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS');

    await db.events.update(
      {
        isCancelled: true,
        cancellationReasonId: cancellationReasonId,
        cancelledByUserId: cancelledByUserId,
        updatedAt: currentDateTime,
        eventGroupId: uuidv4(),
      },
      { where: { id: eventId } },
      { transaction },
    );
  }

  static async updateCustomEventIds(updates) {
    // Construct CASE statement parts for each column you wish to update
    let caseStatement = updates
      .map((update) => {
        return `WHEN id = '${update.eventId}' THEN '${update.cr_eventId}'`;
      })
      .join(' ');

    let caseStatement2 = updates
      .map((update) => {
        const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
        return `WHEN id = '${update.eventId}' THEN '${currentDateTime}'`;
      })
      .join(' ');

    const query = `UPDATE events SET eventIdCustom = CASE ${caseStatement} END,
                  integratedAt = CASE ${caseStatement2} END WHERE id IN (${updates
      .map((update) => `'${update.eventId}'`)
      .join(', ')})`;

    db.sequelize
      .query(query, { type: db.sequelize.QueryTypes.UPDATE })
      .catch((error) => console.error('Bulk update error:', error));
  }

  // TODO Need to remove after findToBeIntegratedImproved is tested and used
  static async findToBeIntegrated(filter, options) {
    const transaction = (options && options.transaction) || undefined;

    const syncEventUpdatedInThePast =
      filter?.syncEventUpdatedInThePast ?? 300000;
    const now = new Date();
    const nextTime = new Date(
      now.getTime() - syncEventUpdatedInThePast,
    ).toISOString(); // Now: 86400000 = 24h Before: 300000ms = 5min

    if (filter.branches) {
      filter.branches = await BranchesDBApi.getDescendentAndAncestorBranches({
        branchIds: filter.branches,
      });
    }

    let include = [
      {
        model: db.users,
        as: 'users',
        where: {
          idCustom: {
            [Op.not]: null, // This ensures 'columnName' is not NULL
          },
        },
        attributes: ['id', 'firstName', 'lastName', 'idCustom'],
        include: [
          {
            attributes: ['name', 'id'],
            model: db.roles,
            as: 'roles',
            through: { attributes: [] },
          },
          {
            attributes: ['name'],
            model: db.branches,
            as: 'branches',
            through: { attributes: [] },
            include: [
              {
                attributes: ['id', 'firstName', 'idCustom'],
                model: db.users,
                as: 'user',
                required: false,
              },
            ],
          },
        ],
      },
      {
        attributes: [
          'id',
          'firstName',
          'idCustom',
          'titleCustom',
          'codeCustom',
        ],
        model: db.users,
        as: 'activity0',
      },
      {
        attributes: ['id', 'firstName', 'idCustom'],
        model: db.users,
        as: 'location0',
        include: [
          {
            //attributes: ['name', 'id'],
            model: db.roles,
            as: 'roles',
            through: { attributes: [] },
            include: [
              {
                //attributes: ['id', 'name', 'idCustom'],
                model: db.locationstypes,
                as: 'locationstypes',
                required: false,
              },
            ],
          },
        ],
      },
      // cancellation type customId
      {
        model: db.cancellationtypes,
        as: 'cancellationReason',
        attributes: ['name', 'customId'],
      },
    ];
    let where = {
      sandboxMode: 0,
      [Op.and]: [
        {
          updatedAt: {
            [Op.gt]: moment.utc(nextTime).format(),
          },
        },
        Sequelize.literal(
          `(integratedAt < events.updatedAt OR integratedAt IS NULL)`,
        ),
      ],
    };

    if (filter.branches) {
      where = {
        ...where,
        '$users.branches.id$': { [Op.or]: { [Op.or]: filter.branches } },
      };
    }

    let query = {
      where,
      include,
      paranoid: false,
      benchmark: true,
      transaction,
    };
    const event = await db.events.findAll(query);

    const parsedEvent = JSON.parse(JSON.stringify(event));
    return parsedEvent;
  }

  // TODO all integrations must use eventsIntegrationData table, so remove this method, use findToBeIntegratedWithIntegrationsData instead
  static async findToBeIntegratedImproved(filter, options) {
    const transaction = options && options.transaction;
    const lookbackMs = (filter && filter.syncEventUpdatedInThePast) || 300000;
    const cutoff = new Date(Date.now() - lookbackMs);

    if (filter.branches) {
      filter.branches = await BranchesDBApi.getDescendentAndAncestorBranches({
        branchIds: filter.branches,
      });
    }

    let include = [
      {
        model: db.users,
        as: 'users',
        attributes: ['id', 'firstName', 'lastName', 'idCustom'],
        include: [
          {
            attributes: ['name', 'id'],
            model: db.roles,
            as: 'roles',
            through: { attributes: [] },
          },
          {
            attributes: ['name'],
            model: db.branches,
            as: 'branches',
            through: { attributes: [] },
            include: [
              {
                attributes: ['id', 'firstName', 'idCustom'],
                model: db.users,
                as: 'user',
                required: false,
              },
            ],
          },
        ],
      },
      {
        attributes: [
          'id',
          'firstName',
          'idCustom',
          'titleCustom',
          'codeCustom',
        ],
        model: db.users,
        as: 'activity0',
      },
      {
        attributes: ['id', 'firstName', 'idCustom'],
        model: db.users,
        as: 'location0',
        include: [
          {
            model: db.roles,
            as: 'roles',
            through: { attributes: [] },
            include: [
              {
                model: db.locationstypes,
                as: 'locationstypes',
                required: false,
              },
            ],
          },
        ],
      },
      // cancellation type customId
      {
        model: db.cancellationtypes,
        as: 'cancellationReason',
        attributes: ['name', 'customId'],
      },
    ];
    let where = {
      sandboxMode: 0,
      updatedAt: { [Op.gt]: cutoff },
      [Op.or]: [
        Sequelize.where(
          Sequelize.col('events.integratedAt'), '<', Sequelize.col('events.updatedAt')
        ),
        { integratedAt: null }
      ]
    };

    if (filter.branches) {
      where = {
        ...where,
        '$users.branches.id$': { [Op.or]: { [Op.or]: filter.branches } },
      };
    }

    let query = {
      where,
      include,
      paranoid: false,
      benchmark: true,
      transaction,
    };
    const event = await db.events.findAll(query);

    const parsedEvent = JSON.parse(JSON.stringify(event));
    return parsedEvent;
  }

  /**
   * Find events that need to be (re-)integrated:
   *  • created (no integration row)
   *  • updated (event.updatedAt > integration.updatedAt)
   *  • deleted  (event.deletedAt and integration still exists)
   *
   * @param {Object} filter — may include .syncEventUpdatedInThePast (ms)
   *                        and .integratingSoftware (string),
   *                        and .branches (array of branchIds)
   * @param {Object} options — may include .transaction
   */
  static async findToBeIntegratedWithIntegrationsData(filter = {}, options = {}) {
    const transaction = options.transaction;
    const lookbackMs = filter.syncEventUpdatedInThePast || 300000;
    const cutoff = new Date(Date.now() - lookbackMs);

    // expand branches if provided
    if (filter.branches) {
      filter.branches = await BranchesDBApi.getDescendentAndAncestorBranches({
        branchIds: filter.branches,
      });
    }

    // base WHERE: sandboxMode off, recently updated in our system
    const where = {
      sandboxMode: 0,
      updatedAt: { [Op.gt]: cutoff },
      [Op.or]: [
        // 1) integration row is stale
        Sequelize.where(
          Sequelize.col('integrationData.updatedAt'),
          '<',
          Sequelize.col('events.updatedAt')
        ),
        // 2) no integration row yet
        { '$integrationData.id$': { [Op.is]: null } }
      ],
    };

    // restrict to a specific integrator if given
    const integrationWhere = filter.integratingSoftware
      ? { integratingSoftware: filter.integratingSoftware }
      : {};

    // branch‐based filter
    if (filter.branches) {
      where['$users.branches.id$'] = { [Op.in]: filter.branches };
    }

    // assemble full query
    const events = await db.events.findAll({
      where,
      include: [
        // users + roles + branches
        {
          model: db.users,
          as: 'users',
          attributes: ['id', 'firstName', 'lastName', 'idCustom'],
          include: [
            { model: db.roles, as: 'roles', through: { attributes: [] }, attributes: ['id', 'name'] },
            {
              model: db.branches, as: 'branches', through: { attributes: [] },
              attributes: ['id', 'name'],
              include: [{ model: db.users, as: 'user', required: false, attributes: ['id', 'firstName', 'idCustom'] }]
            },
          ],
        },
        // activity + location + cancellationReason as before
        { model: db.users, as: 'activity0', attributes: ['id', 'firstName', 'idCustom', 'titleCustom', 'codeCustom'] },
        {
          model: db.users, as: 'location0',
          attributes: ['id', 'firstName', 'idCustom'],
          include: [
            {
              model: db.roles, as: 'roles', through: { attributes: [] },
              include: [{ model: db.locationstypes, as: 'locationstypes', required: false }]
            }
          ]
        },
        { model: db.cancellationtypes, as: 'cancellationReason', attributes: ['name', 'customId'] },

        // ← NEW: left‐join to eventsIntegrationData
        {
          model: db.eventsIntegrationData,
          as: 'integrationData',
          required: false,
          attributes: ['id', 'eventIdOther', 'recurringEventIdOther', 'updatedAt'],
          where: integrationWhere,
        },
      ],
      paranoid: false,
      transaction,
      benchmark: true,
    });

    return JSON.parse(JSON.stringify(events));
  }
  
  static async updateEventsIntegratedAt(events) {
    const currentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss');

    try {
      // Execute each update query individually
      for (const event of events) {
        let updateQuery = `
        UPDATE events
        SET integratedAt = '${currentDateTime}'`;

        // Only update eventIdCustom if it's not null or undefined
        if (event.eventIdCustom !== null && event.eventIdCustom !== undefined) {
          updateQuery += `, eventIdCustom = '${event.eventIdCustom}'`;
        }

        updateQuery += ` WHERE id = '${event.eventId}';`;

        // Execute the update query
        await db.sequelize.query(updateQuery, {
          type: db.sequelize.QueryTypes.RAW,
        });
      }
    } catch (error) {
      console.error(
        'Error updating events on updateEventsIntegratedAt()',
        error,
      );
    }
  }

  static async updateSupervision(id, supervisionId) {
    const currentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss');

    await db.events.update(
      {
        supervisionId,
        updatedAt: currentDateTime,
      },
      { where: { id } },
    );
  }
  static async findSupervisionEvent(id) {
    const event = await db.events.findOne({
      where: { id },
      attributes: ['id'],
    });
    if (event) {
      return event;
    }
    return;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;
    const events = await db.events.findByPk(id, options);

    if (events) {
      await events.update(
        {
          deletedBy: currentUser.id,
        },
        {
          transaction,
        },
      );

      await events.destroy({
        transaction,
      });

      const output = events.get({ plain: true });
      output.location0 = await events.getLocation0({
        transaction,
      });

      const parsedRows = JSON.parse(JSON.stringify(output));
      return parsedRows;
    }
  }

  static async bulkRemove(ids, options) {
    const transaction = (options && options.transaction) || undefined;

    // Find all events by their IDs to ensure they exist before deleting
    const events = await db.events.findAll({
      where: {
        id: ids,
      },
      transaction,
      attributes: ['id'], // Only fetch the 'id' attribute as it's all we need
    });

    // Capture the IDs before destruction.
    const eventIds = events.map((event) => event.id);

    // Now destroy all found events.
    await db.events.destroy({
      where: {
        id: ids,
      },
      transaction,
    });

    return eventIds; // Return only the IDs of the deleted events
  }

  static async bulkUndelete(ids, options) {
    const transaction = (options && options.transaction) || undefined;

    // Find all events by their IDs to ensure they exist before restoring
    const events = await db.events.findAll({
      where: {
        id: ids,
      },
      transaction,
      attributes: ['id'], // Only fetch the 'id' attribute as it's all we need
      paranoid: false,
    });

    // Capture the IDs before restoration.
    const eventIds = events.map((event) => event.id);

    // Now restore all found events.
    await db.events.restore({
      where: {
        id: ids,
      },
      transaction,
    });

    return eventIds; // Return only the IDs of the restored events
  }

  static async updateEventGroupId(id, eventGroupId, options) {
    const transaction = (options && options.transaction) || undefined;
    const currentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    await db.events.update(
      {
        eventGroupId,
        updatedAt: currentDateTime,
      },
      {
        where: { id },
        transaction,
      },
    );
  }

  static async findBy(where, options) {
    // const transaction = (options && options.transaction) || undefined;

    const users_include1 = [
      {
        attributes: ['id', 'name'],
        model: db.roles,
        as: 'roles',
        through: { attributes: [] },
      },
      {
        attributes: ['id', 'name'],
        model: db.branches,
        as: 'branches',
        through: { attributes: [] },
      },
    ];
    const eventsPk = await db.events.findOne({
      where,
      include: [
        {
          attributes: [
            'id',
            'firstName',
            'lastName',
            'billable',
            'color',
            'borderColor',
          ],
          model: db.users,
          as: 'users',
          through: { attributes: [] },
          include: users_include1,
        },
        {
          attributes: ['id', 'firstName', 'priority', 'color'],
          model: db.users,
          as: 'activity0',
        },
        {
          attributes: ['id', 'firstName'],
          model: db.users,
          as: 'location0',
        },
        {
          attributes: ['id', 'activity0Id', 'start', 'end', 'isCancelled'],
          model: db.events,
          as: 'supervision',
          include: [
            {
              model: db.users,
              as: 'users',
              attributes: ['id'],
            },
            {
              model: db.users,
              as: 'cancelledByUser',
              attributes: ['id'],
            },
            {
              model: db.cancellationtypes,
              as: 'cancellationReason',
              attributes: ['id'],
            },
          ],
        },
      ],
    });

    if (!eventsPk) {
      return eventsPk;
    }

    let activity = eventsPk.dataValues.activity0;
    if (activity) {
      activity.dataValues = {
        ...activity.dataValues,
        roles: [{ dataValues: { name: 'Activity' }, name: 'Activity' }],
      };
      eventsPk.dataValues.users.push(activity);
    }
    let location = eventsPk.dataValues.location0;
    if (location) {
      location.dataValues = {
        ...location.dataValues,
        roles: [{ dataValues: { name: 'Location' }, name: 'Location' }],
      };
      eventsPk.dataValues.users.push(location);
    }
    return eventsPk;
  }

  // TODO: deprecated ? remove ?
  static async RemoveEventsNow(filter, options) {
    const opt = {
      type: db.sequelize.QueryTypes.DELETE,
    };
    const start = filter.start;
    const end = filter.end;
    if (start && end && filter.password == 'e635dgndd88473g7d') {
      const query = `DELETE FROM events WHERE startRecur >= '${start}' && endRecur <= '${end}'`;
      const eventsUsersUsers = await db.sequelize.query(query, opt);
    }

    return true;
  }

  // events/ids
  static async findAllIds(filter, options) {
    // if (filter.branches) {
    //   filter.branches = await BranchesDBApi.getBranchStructures({
    //     companyId: filter.companyId,
    //     branchIds: filter.branches
    //   });
    // }
    // const currentUser = (options && options.currentUser) || { id: null };
    // const roles = await RolesDBApi.findAll({
    //   companyId: filter.companyId,
    // });

    // const get_role_hierarchy_ids = (roles) => {
    //   const role_obj = {};
    //   roles.rows.map((e) => {
    //     let roles_all = [e.id];

    //     let parent_id = e.parent ? e.parent.id : null;
    //     let i = 0;
    //     while (parent_id != null && i < 1000) {
    //       roles_all.push(parent_id);
    //       const role_parent = roles.rows.find((r) => r.id == parent_id).parent;
    //       parent_id = role_parent != null ? role_parent.id : null;
    //       i++;
    //     }
    //     role_obj[e.name] = { roles: roles_all, id: e.id };
    //   });
    //   return role_obj;
    // };

    // const hierarchy = get_role_hierarchy_ids(roles);
    // const getResources = (resourceName) => {
    //   let roles_list = [];
    //   Object.entries(hierarchy).map((t) => {
    //     const [key, value] = t;
    //     if (value.roles.includes(resourceName)) {
    //       roles_list.push(key);
    //     }
    //     return roles_list;
    //   });
    //   return roles_list;
    // };
    // const people = hierarchy['Person'];
    // const person_id = hierarchy['Person'].id;
    // const peopleIds = getResources(hierarchy['Person'].id).map(
    //   (t) => hierarchy[t].id,
    // );
    // const activityIds = getResources(hierarchy['Activity'].id).map(
    //   (t) => hierarchy[t].id,
    // );

    // const locationIds = getResources(hierarchy['Location'].id).map(
    //   (t) => hierarchy[t].id,
    // );

    var limit = filter.limit || 0;
    var offset = 0;
    const currentPage = filter.page;

    offset = currentPage * limit;

    var orderBy = null;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        attributes: [],
        model: db.users,
        as: 'users',
        through: filter.people
          ? {
              attributes: [],
              where: {
                [Op.or]: filter.people.split('|').map((item) => {
                  return { ['userId']: Utils.uuid(item) };
                }),
              },
            }
          : { attributes: [] },
        required: filter.people ? true : null,
        //separate: true,
      },
    ];

    //       where = {
    //         ...where,
    //         '$users.roles.id$': { [Op.or]: peopleIds },
    //       };
    // if(filter.branches){
    //       where = {
    //         ...where,
    //         '$users.branches.id$': { [Op.or]: filter.branches.split('|') },
    //       };
    //     }

    //}
    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }
      if (filter.usersIds) {
        where = {
          ...where,
          '$users.id$': { [Op.or]: filter.usersIds.split('|') },
        };
      }
      if (filter.people) {
        where = {
          ...where,
          '$users.id$': { [Op.or]: filter.people.split('|') },
        };
      }
      if (filter.activity && filter.activity.split('|').length > 0) {
        where = {
          ...where,
          '$activity0.id$': { [Op.or]: filter.activity.split('|') },
        };
      }
      if (filter.companyId) {
        where = {
          ...where,
          ['$users.companyId$']: Utils.uuid(filter.companyId),
        };
      }
      if (filter.userName) {
        const tils = Utils.ilike('users', 'firstName', filter.userName);
        where = {
          ...where,
          [Op.and]: where[Op.and] ? [...where[Op.and], tils] : [tils],
        };
      }

      //CUSTOM FIND DATE RANGES OVERLAP - https://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
      if (filter.start && filter.end) {
        where = {
          ...where,
          [Op.and]: {
            startRecur: {
              //...where.startRecur,
              [Op.lt]: filter.end,
            },
            endRecur: {
              //...where.startRecur,
              [Op.gt]: filter.start,
            },
          },
        };
      }
      if (filter.updatedAtStart && filter.bol == 'true') {
        where = {
          ...where,
          [Op.and]: {
            ...where[Op.and],
            updatedAt: {
              [Op.gt]: moment.utc(filter.updatedAtStart).format(),
            },
          },
        };
      }
    }

    let things = {
      where,
      include,
      //limit: limit ? Number(limit) : undefined,
      //offset: offset ? Number(offset) : undefined,
      attributes: ['id'],
      benchmark: true,

      // logging: (_, timingMs) => console.log(`[ Events findAllIds() - Execution time: ${timingMs}ms ]`),

      //separate:true,
      // order:
      //   filter.field && filter.sort
      //     ? [[filter.field, filter.sort]]
      //     : [['createdAt', 'desc']],
      transaction,
    };
    if (filter.id_only) {
      things = { ...things, attributes: ['id'] };
    }
    if (filter.updatedAtStart && filter.bol == 'true') {
      things = { ...things, paranoid: false };
    }
    const opt = {
      type: db.sequelize.QueryTypes.SELECT,
    };
    let query = `SELECT id FROM events AS events JOIN eventsUsersUsers ON id = eventsUsersUsers.eventId WHERE events.startRecur < '${new Date(
      filter.end,
    ).toISOString()}' AND events.endRecur > '${new Date(
      filter.start,
    ).toISOString()}' AND eventsUsersUsers.userId IN ('${filter.people
      .split('|')
      .join("','")}')`;
    if (filter.updatedAtStart && filter.bol == 'true') {
      query += ` AND events.updatedAt > '${new Date(
        filter.updatedAtStart,
      ).toISOString()}'`;
    } else {
      query += ` AND events.deletedAt IS NULL`;
    }

    const fo = await db.sequelize.query(query, opt);

    return { rows: fo, count: fo.length };
  }

  // TODO: remove not used
  static async findAllIds9(filter, options) {
    // if (filter.branches) {
    //   filter.branches = await BranchesDBApi.getBranchStructures({
    //     companyId: filter.companyId,
    //     branchIds: filter.branches
    //   });
    // }
    const roles = await RolesDBApi.findAll({
      companyId: filter.companyId,
    });
    const get_role_hierarchy_ids = (roles) => {
      const role_obj = {};
      roles.rows.map((e) => {
        let roles_all = [e.id];

        let parent_id = e.parent ? e.parent.id : null;
        let i = 0;
        while (parent_id != null && i < 1000) {
          roles_all.push(parent_id);
          const role_parent = roles.rows.find((r) => r.id == parent_id).parent;
          parent_id = role_parent != null ? role_parent.id : null;
          i++;
        }
        role_obj[e.name] = { roles: roles_all, id: e.id };
      });
      return role_obj;
    };

    const hierarchy = get_role_hierarchy_ids(roles);
    const getResources = (resourceName) => {
      let roles_list = [];
      Object.entries(hierarchy).map((t) => {
        const [key, value] = t;
        if (value.roles.includes(resourceName)) {
          roles_list.push(key);
        }
        return roles_list;
      });
      return roles_list;
    };
    const people = hierarchy['Person'];
    const person_id = hierarchy['Person'].id;
    const peopleIds = getResources(hierarchy['Person'].id).map(
      (t) => hierarchy[t].id,
    );
    const activityIds = getResources(hierarchy['Activity'].id).map(
      (t) => hierarchy[t].id,
    );
    const locationIds = getResources(hierarchy['Location'].id).map(
      (t) => hierarchy[t].id,
    );
    var limit = filter.limit || 0;
    var offset = 0;
    const currentPage = filter.page;

    offset = currentPage * limit;

    var orderBy = null;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        attributes: [],
        model: db.users,
        as: 'users',
        //separate: true,
        include: [
          {
            attributes: [],
            model: db.roles,
            as: 'roles',
            //separate: true,
            through: peopleIds
              ? {
                  attributes: [],
                  where: {
                    [Op.or]: peopleIds.map((item) => {
                      return { ['roleId']: Utils.uuid(item) };
                    }),
                  },
                }
              : { attributes: [] },
          },
          {
            attributes: [],
            model: db.branches,
            as: 'branches',
            through: filter.branches
              ? {
                  attributes: [],
                  where: {
                    [Op.or]: filter.branches.split('|').map((item) => {
                      return { ['BranchId']: Utils.uuid(item) };
                    }),
                  },
                }
              : { attributes: [] },
          },
        ],
      },
    ];
    where = {
      ...where,
      '$users.roles.id$': { [Op.or]: peopleIds },
    };
    if (filter.branches) {
      where = {
        ...where,
        '$users.branches.id$': { [Op.or]: filter.branches.split('|') },
      };
    }

    if (filter.usersIds) {
      where = {
        ...where,
        '$users.id$': { [Op.or]: filter.usersIds.split('|') },
      };
    }

    //}
    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      // if (filter.ids) {
      //   where = {
      //     ...where,
      //     [Op.or]: filter.ids.split('|').map((item) => {
      //       return { ['Id']: Utils.uuid(item) };
      //     }),
      //   };
      // }

      if (filter.userName) {
        const tils = Utils.ilike('users', 'firstName', filter.userName);
        where = {
          ...where,
          [Op.and]: where[Op.and] ? [...where[Op.and], tils] : [tils],
        };
      }

      // if (true || filter.createdAtRange) {
      //   const start = filter.createdAtRange;

      //     where = {
      //       ...where,
      //       ['createdAt']: {
      //         ...where.updatedAt,
      //         [Op.gte]: '2900-01-01',
      //       },
      //     };

      // }

      // if (filter.startRange) {
      //   const [start, end] = filter.startRange;

      //   if (start !== undefined && start !== null && start !== '') {
      //     where = {
      //       ...where,
      //       start: {
      //         ...where.start,
      //         [Op.gte]: start,
      //       },
      //     };
      //   }

      //   if (end !== undefined && end !== null && end !== '') {
      //     where = {
      //       ...where,
      //       start: {
      //         ...where.start,
      //         [Op.lte]: end,
      //       },
      //     };
      //   }
      // }

      // if (filter.endRange) {
      //   const [start, end] = filter.endRange;

      //   if (start !== undefined && start !== null && start !== '') {
      //     where = {
      //       ...where,
      //       end: {
      //         ...where.end,
      //         [Op.gte]: start,
      //       },
      //     };
      //   }

      //   if (end !== undefined && end !== null && end !== '') {
      //     where = {
      //       ...where,
      //       end: {
      //         ...where.end,
      //         [Op.lte]: end,
      //       },
      //     };
      //   }
      // }

      //CUSTOM FIND DATE RANGES OVERLAP - https://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
      if (filter.start && filter.end) {
        where = {
          ...where,
          [Op.and]: {
            startRecur: {
              //...where.startRecur,
              [Op.lt]: filter.end,
            },
            endRecur: {
              //...where.startRecur,
              [Op.gt]: filter.start,
            },
          },
        };
      }

      // if (filter.startRecurRange) {
      //   const [start, end] = filter.startRecurRange;

      //   if (start !== undefined && start !== null && start !== '') {
      //     where = {
      //       ...where,
      //       startRecur: {
      //         ...where.startRecur,
      //         [Op.gte]: start,
      //       },
      //     };
      //   }

      //   if (end !== undefined && end !== null && end !== '') {
      //     where = {
      //       ...where,
      //       startRecur: {
      //         ...where.startRecur,
      //         [Op.lte]: end,
      //       },
      //     };
      //   }
      // }

      if (filter.endRecurRange) {
        const [start, end] = filter.endRecurRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            endRecur: {
              ...where.endRecur,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            endRecur: {
              ...where.endRecur,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.intervalRange) {
        const [start, end] = filter.intervalRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            interval: {
              ...where.interval,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            interval: {
              ...where.interval,
              [Op.lte]: end,
            },
          };
        }
      }
      if (filter.updatedAtStart && filter.bol == 'true') {
        where = {
          ...where,
          [Op.and]: {
            ...where[Op.and],
            updatedAt: {
              [Op.gt]: moment.utc(filter.updatedAtStart).format(),
            },
          },
        };
      }
    }

    let things = {
      where,
      include,
      //limit: limit ? Number(limit) : undefined,
      //offset: offset ? Number(offset) : undefined,
      attributes: ['id'],
      benchmark: true,
      // logging: (_, timingMs) => console.log(`[ Events findAllIds() - Execution time: ${timingMs}ms ]`),
      //separate:true,
      // order:
      //   filter.field && filter.sort
      //     ? [[filter.field, filter.sort]]
      //     : [['createdAt', 'desc']],
      transaction,
    };
    if (filter.id_only) {
      things = { ...things, attributes: ['id'] };
    }
    if (filter.updatedAtStart && filter.bol == 'true') {
      things = { ...things, paranoid: false };
    }
    const fo = await db.events.findAll(things);

    return { rows: fo, count: fo.length };
  }

  // events/ids
  // scheduler/events2
  // scheduler/try_event
  // scheduler/connected_events
  // scheduler/connected_events2
  // scheduler/branch_structure
  static async findAll(filter, options) {
    // const ids_payload = await this.findAllIds(filter, options);

    // let ids = ids_payload.rows.map((t) => t.id);
    // if (ids.length == 0) {
    //   ids = 'cnienc';
    // } else {
    //   ids = ids.join('|');
    // }

    // // if (filter.branches) {
    // //   filter.branches = await BranchesDBApi.getBranchStructures({
    // //     companyId: filter.companyId,
    // //     branchIds: filter.branches
    // //   });
    // // }
    // filter = { ...filter, ids: ids };

    // if (filter.branches) {
    //   filter.branches = await BranchesDBApi.getBranchStructures({
    //     companyId: filter.companyId,
    //     branchIds: filter.branches
    //   });
    // }

    var limit = filter.limit || 0;
    var offset = 0;
    const currentPage = filter.page;

    offset = currentPage * limit;

    const transaction = (options && options.transaction) || undefined;
    const users_include1 = [
      {
        attributes: ['id', 'name'],
        model: db.roles,
        as: 'roles',
        //separate:true,
        through: { attributes: [] },
      },

      {
        attributes: ['id', 'name'],
        model: db.branches,
        as: 'branches',
        through: { attributes: [] },
      },
    ];

    let where = {};

    let include = [
      // {
      //   model: db.events,
      //   as: 'eventConnect',
      // },
      {
        attributes: [
          'id',
          'firstName',
          'priority',
          'billable',
          'color',
          'borderColor',
        ],
        model: db.users,
        as: 'activity0',
        //include: users_include2,
        //include: {all:true}
      },
      {
        attributes: ['id', 'firstName'],
        model: db.users,
        as: 'location0',
        //include: users_include3,
        //include:{all:true}
      },
      {
        attributes: [
          'id',
          'firstName',
          'lastName',
          'billable',
          'color',
          'borderColor',
        ],
        model: db.users,
        as: 'users',
        //separate:true,
        through: { attributes: [] },
        include: users_include1,
      },
    ];
    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      // if (filter.ids) {
      //   where = {
      //     ...where,
      //     [Op.or]: filter.ids.split('|').map((item) => {
      //       return { ['Id']: Utils.uuid(item) };
      //     }),
      //   };
      // }

      if (filter.people) {
        where = {
          ...where,
          '$users.id$': { [Op.or]: filter.people.split('|') },
        };
      }

      if (filter.activity && filter.activity.split('|').length > 0) {
        where = {
          ...where,
          $activity0Id$: { [Op.or]: filter.activity.split('|') },
        };
      }

      if (!filter.sandboxMode || filter.sandboxMode === 'false') {
        where = {
          ...where,
          sandboxMode: 0,
        };
      }
      if (filter.location && filter.location.split('|').length > 0) {
        where = {
          ...where,
          $location0Id$: { [Op.or]: filter.location.split('|') },
        };
      }
      // if (filter.branches) {
      //   where = {
      //     ...where,
      //     '$users->branches.id$': {
      //       [Op.or]: filter.branches.split('|').map((item) => {
      //         return Utils.uuid(item);
      //       }),
      //     },
      //   };
      // }

      if (filter.userName) {
        const tils = Utils.ilike('users', 'firstName', filter.userName);
        where = {
          ...where,
          [Op.and]: where[Op.and] ? [...where[Op.and], tils] : [tils],
        };
      }

      //CUSTOM FIND DATE RANGES OVERLAP - https://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
      if (filter.start && filter.end) {
        const startRecur = moment.utc(filter.start).format('YYYY-MM-DD');
        const endRecur = moment.utc(filter.end).format('YYYY-MM-DD');
        where = {
          ...where,
          [Op.and]: {
            startRecur: {
              //...where.startRecur,
              [Op.lt]: endRecur,
            },
            endRecur: {
              //...where.startRecur,
              [Op.gt]: startRecur,
            },
          },
        };
      }

      // if (filter.updatedAtStart && filter.bol == 'true') {
      //   where = {
      //     ...where,
      //     [Op.and]: {...where[Op.and],
      //       updatedAt: {
      //         [Op.gt]: moment.utc(filter.updatedAtStart).format(),
      //       },
      //     },
      //   };
      // }

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
      if (filter.updatedAtStart && filter.bol == 'true') {
        where = {
          ...where,
          [Op.and]: {
            ...where[Op.and],
            updatedAt: {
              [Op.gt]: moment.utc(filter.updatedAtStart).format(),
            },
          },
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
    let things = {
      where,
      include,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
      benchmark: true,
      //logging:console.log
      //logging: (_, timingMs) => console.log(`[ Events 1 findAll() - Execution time: ${timingMs}ms ]`),
    };
    let include_final = [
      {
        attributes: ['id'],
        model: db.users,
        as: 'users',
        through: { attributes: [] },
        // include: {
        //   attributes: [],
        //   model: db.branches,
        //   as: 'branches',
        //   //separate:true,
        //   through: filter.branches
        //     ? {
        //         attributes: [],
        //         where: {
        //           [Op.or]: filter.branches.split('|').map((item) => {
        //             return { ['BranchId']: Utils.uuid(item) };
        //           }),
        //         },
        //       }
        //     : { attributes: [] },
        //   required: filter.branches ? true : null,
        // },
        // through: filter.people
        //   ? {
        //       attributes: [],
        //       where: {
        //         [Op.or]: filter.people.split('|').map((item) => {
        //           return { ['userId']: Utils.uuid(item) };
        //         }),
        //       },
        //     }
        //   : { attributes: [] },
        // required: filter.people ? true : null,
        //separate: true,
      },
    ];

    let things2 = {
      //attributes: ['id'],
      where,
      //include:include_final,
      include: include,
      subQuery: false,
      // order:
      //   filter.field && filter.sort
      //     ? [[filter.field, filter.sort]]
      //     : [['createdAt', 'desc']],
      transaction,
      benchmark: true,
      //logging: (_, timingMs) => console.log(`[ Events 2 findAll() - Execution time: ${timingMs}ms ]`),
    };
    if (filter.updatedAtStart && filter.bol == 'true') {
      things2 = { ...things2, paranoid: false };
    }
    const fo2 = await db.events.findAll({
      ...things2,
      attributes: ['id'],
      ////logging: console.log,
      benchmark: true,
      include: [
        {
          attributes: ['id'],
          model: db.users,
          as: 'users',
          through: { attributes: [] },
        },
        // {
        //   attributes: ['id', 'firstName','priority'],
        //   model: db.users,
        //   as: 'activity0',
        // }
      ],
    });
    let ids = fo2.map((t) => t.id);
    if (ids.length == 0) {
      ids = 'cnienc';
    } else {
      ids = ids.join('|');
    }
    const fo = await db.events.findAll({
      ...things2,
      // include:include,
      //attributes: ['id'],
      ////logging: console.log,
      benchmark: true,
      where: {
        [Op.or]: ids.split('|').map((item) => {
          return { ['Id']: Utils.uuid(item) };
        }),
      },
    });
    const opt = {
      type: db.sequelize.QueryTypes.SELECT,
    };
    // let users_additional = fo.flatMap(t=>{
    //   let arr = []
    //   if(t.dataValues.activity0Id){
    //     arr.push(t.dataValues.activity0Id)
    //   }
    //   if(t.dataValues.location0Id){
    //     arr.push(t.dataValues.location0Id)
    //   }
    //   return arr
    // })
    // users_additional = [...new Set(users_additional)]

    // const event_ids = fo.map(t=>t.id)
    // const query_eventsUsersUsers = `SELECT eventId, userId FROM eventsUsersUsers WHERE eventId IN ('${event_ids.join("','")}')`
    // const eventsUsersUsers = await db.sequelize.query(query_eventsUsersUsers, opt);
    // let users_include = [
    //   {
    //     attributes: ['id', 'name'],
    //     model: db.roles,
    //     as: 'roles',
    //     through: { attributes: [] },
    //   },
    //   {
    //     attributes: ['id', 'name'],
    //     model: db.branches,
    //     as: 'branches',
    //     through: { attributes: [] },
    //   },
    // ]
    // let where_users = {
    //   [Op.or]: [...new Set(eventsUsersUsers.map(t=> t.userId))].concat(users_additional).map((item) => {
    //     return { ['Id']: Utils.uuid(item) };
    //   })
    // }
    // let users_things = {
    //   include: users_include,
    //   where: where_users
    // }
    // const users = await db.users.findAll(users_things);
    // for (let index = 0; index < fo.length; index++) {
    //   const element = fo[index];
    //   const event_id = element.dataValues.id
    //   const activity = element.dataValues.activity0Id
    //   const location = element.dataValues.location0Id
    //   let otherUsers = []
    //   if(activity) otherUsers.push(activity)
    //   if(location) otherUsers.push(location)

    //   // Format Users
    //   let usersOfEvent = eventsUsersUsers.filter((u) => u.eventId === event_id);
    //   if(activity) usersOfEvent.push({userId:activity})
    //   if(location) usersOfEvent.push({userId:location})
    //   const formattedUsersOfEvent = usersOfEvent.map((u) => {
    //     let index = -1
    //     for(let i = 0; i < users.length; i++) {
    //       const userId = users[i].id
    //       if(userId === u.userId) {
    //         index = i;
    //         break;
    //       }
    //     }
    //     return users[index];
    //   })

    // }
    fo.forEach((t) => {
      // let d = {};
      // let days_of_week = [];
      // if (t.dataValues.U == 1) {
      //   d = {
      //     dataValues: { id: '20770718-a98e-499f-ae8b-c395f0f743bb' },
      //   };
      //   days_of_week.push(d);
      // }
      // if (t.dataValues.M == 1) {
      //   d = {
      //     dataValues: { id: '2d0599e7-2729-49ee-acbe-ede6de8ad9b7' },
      //   };
      //   days_of_week.push(d);
      // }
      // if (t.dataValues.T == 1) {
      //   d = {
      //     dataValues: { id: '3260c7e7-c57b-4144-803f-7db9cf88393c' },
      //   };
      //   days_of_week.push(d);
      // }
      // if (t.dataValues.W == 1) {
      //   d = {
      //     dataValues: { id: '56cbe76a-0cf6-4647-8a49-2ef9fd102079' },
      //   };
      //   days_of_week.push(d);
      // }
      // if (t.dataValues.R == 1) {
      //   d = {
      //     dataValues: { id: '6d92706c-9bb1-447e-bf74-572609066663' },
      //   };
      //   days_of_week.push(d);
      // }
      // if (t.dataValues.F == 1) {
      //   d = {
      //     dataValues: { id: 'ecd70b60-3fef-4d43-9181-2f9db60e19fe' },
      //   };
      //   days_of_week.push(d);
      // }
      // if (t.dataValues.S == 1) {
      //   d = {
      //     dataValues: { id: 'fa2adb44-e5ba-4586-ae19-5f1e1767228d' },
      //   };
      //   days_of_week.push(d);
      // }
      // console.log(
      //   'fleeber',
      //   t.daysOfWeek,
      //   t.dataValues.daysOfWeek,
      //   days_of_week,
      // );
      //t.daysOfWeek = days_of_week;
      //t.dataValues.daysOfWeek = days_of_week;

      if (t.dataValues.users) {
        if (t.dataValues.activity0) {
          let copy = t.dataValues.activity0;
          copy.dataValues = {
            ...copy.dataValues,
            roles: [{ dataValues: { name: 'Activity' }, name: 'Activity' }],
          };
          // t.dataValues.users = [copy,...t.dataValues.users]
          //t.dataValues.users = t.dataValues.users.filter(y=>y.dataValues.id != copy.dataValues.id)
          t.dataValues.users.push(copy);
        }
        if (t.dataValues.location0) {
          let copy = t.dataValues.location0;
          copy.dataValues = {
            ...copy.dataValues,
            roles: [{ dataValues: { name: 'Location' }, name: 'Location' }],
          };
          //t.dataValues.users = [copy,...t.dataValues.users]
          //t.dataValues.users = t.dataValues.users.filter(y=>y.dataValues.id != copy.dataValues.id)
          t.dataValues.users.push(copy);
        }
      }
    });
    // console.log('fleeker', fo);
    // console.log(
    //   'fleeker5',
    //   fo.map((t) => t.dataValues.daysOfWeek),
    // );
    // console.log(
    //   'fleeker6',
    //   fo.map((t) => t.daysOfWeek),
    // );
    // console.log(
    //   'fleeker7',
    //   fo.map((t) => t.dataValues.daysOfWeek.map((o) => o.dataValues)),
    // );
    return { rows: fo, count: fo.length };
  }

  // scheduler/events/staff-track
  static async findAllForTimezone(filter, options) {
    let limit = filter.limit || 0;
    let offset = 0;
    const currentPage = filter.page;

    offset = currentPage * limit;

    const transaction = (options && options.transaction) || undefined;
    const users_include = [
      {
        attributes: ['id', 'name'],
        model: db.roles,
        as: 'roles',
        through: { attributes: [] },
      },
      {
        attributes: ['id', 'name'],
        model: db.branches,
        as: 'branches',
        through: { attributes: [] },
      },
    ];
    let where = {};
    if (filter.specificCompanyId) {
      where = {
        ...where,
        '$users.companyId$': filter.specificCompanyId,
      };
    }
    let include = [
      {
        attributes: [
          'id',
          'firstName',
          'priority',
          'billable',
          'color',
          'borderColor',
        ],
        model: db.users,
        as: 'activity0',
      },
      {
        attributes: ['id', 'firstName'],
        model: db.users,
        as: 'location0',
      },
      {
        attributes: [
          'id',
          'firstName',
          'lastName',
          'billable',
          'color',
          'borderColor',
        ],
        model: db.users,
        as: 'users',
        through: { attributes: [] },
        include: users_include,
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }
      if (filter.people) {
        where = {
          ...where,
          '$users.id$': { [Op.or]: filter.people.split('|') },
        };
      }
      if (filter.activity && filter.activity.split('|').length > 0) {
        where = {
          ...where,
          $activity0Id$: { [Op.or]: filter.activity.split('|') },
        };
      }

      if (filter.branchList && filter.branchList.length > 0) {
        where = {
          ...where,
          '$users.branches.id$': { [Op.or]: filter.branchList },
        };
      }
      if (!filter.sandboxMode || filter.sandboxMode === 'false') {
        where = {
          ...where,
          sandboxMode: 0,
        };
      }
      if (filter.location && filter.location.split('|').length > 0) {
        where = {
          ...where,
          $location0Id$: { [Op.or]: filter.location.split('|') },
        };
      }
      if (filter.userName) {
        const tils = Utils.ilike('users', 'firstName', filter.userName);
        where = {
          ...where,
          [Op.and]: where[Op.and] ? [...where[Op.and], tils] : [tils],
        };
      }
      if (filter.start && filter.end) {
        // filter through end-start dates

        where = {
          ...where,
          [Op.and]: {
            [Op.and]: [
              where_function(col('events.startDatetime'), {
                [Op.lt]: filter.end,
              }),
              where_function(col('events.endDatetime'), {
                [Op.gt]: filter.start,
              }),

              // Joined table conditions
              where_function(col('users->eventsUsersUsers.startDatetime2'), {
                [Op.lt]: filter.end,
              }),
              where_function(col('users->eventsUsersUsers.endDatetime2'), {
                [Op.gt]: filter.start,
              }),
            ],
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
      if (filter.updatedAtStart && filter.bol == 'true') {
        where = {
          ...where,
          [Op.and]: {
            ...where[Op.and],
            updatedAt: {
              [Op.gt]: moment.utc(filter.updatedAtStart).format(),
            },
          },
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
    if (filter?.status) {
      include = [
        ...include,
        {
          attributes: [
            'id',
            'startdatetime',
            'status',
            'note',
            'noteadmin',
            'late',
            'userId',
            'reasonId',
            'eventId',
          ],
          model: db.statusevents,
          as: 'status',
        },
      ];
    }

    let findAllOptions = {
      where,
      include,
      subQuery: false,
      transaction,
      benchmark: true,
    };
    if (filter.updatedAtStart && filter.bol == 'true') {
      findAllOptions = { ...findAllOptions, paranoid: false };
    }
    const eventIds = await db.events.findAll({
      ...findAllOptions,
      attributes: ['id'],
      benchmark: true,
      include: [
        {
          attributes: ['id'],
          model: db.users,
          as: 'users',
          through: { attributes: [] },
          include: [
            {
              attributes: ['id'],
              model: db.branches,
              as: 'branches',
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    let ids = eventIds.map((t) => t.id);
    if (ids.length == 0) {
      ids = 'cnienc';
    } else {
      ids = ids.join('|');
    }

    const events = await db.events.findAll({
      ...findAllOptions,
      benchmark: true,
      where: {
        [Op.or]: ids.split('|').map((item) => {
          return { ['Id']: Utils.uuid(item) };
        }),
      },
    });
    events.forEach((t) => {
      if (t.dataValues.users) {
        if (t.dataValues.activity0) {
          let copy = t.dataValues.activity0;
          copy.dataValues = {
            ...copy.dataValues,
            roles: [{ dataValues: { name: 'Activity' }, name: 'Activity' }],
          };
          t.dataValues.users.push(copy);
        }
        if (t.dataValues.location0) {
          let copy = t.dataValues.location0;
          copy.dataValues = {
            ...copy.dataValues,
            roles: [{ dataValues: { name: 'Location' }, name: 'Location' }],
          };
          t.dataValues.users.push(copy);
        }
      }
    });

    return { rows: events, count: events.length };
  }

  // scheduler/events
  static async findAllForTimezoneGetEventSeperately(filter, options) {
    let limit = filter.limit || 0;
    let offset = 0;
    const currentPage = filter.page;

    offset = currentPage * limit;

    const transaction = (options && options.transaction) || undefined;

    let uIds = new Array();
    if (filter.people) {
      uIds = filter.people.split('|');
    }

    if (uIds.length === 0) {
      return { rows: [], count: 0 };
    }

    function convertArrayToWhereClause(days) {
      // Map each day to its condition string
      const conditions = days.map((day) => `(${day} = 1)`);

      // Join all conditions with ' or '
      const whereClause = conditions.join(' or ');

      // Encapsulate the final string with parentheses
      return `(${whereClause})`;
    }
    const days = getDaysOfWeekBetween(filter.start, filter.end);
    let day_array = createDayArrayFromDaysOfWeek(days);
    const day_where_clause = convertArrayToWhereClause(day_array);

    let selectPart = `events.* `;
    let includePart = `
  INNER JOIN (
    SELECT DISTINCT eventId 
    FROM eventsUsersUsers 
    WHERE eventsUsersUsers.userId IN (:uIds)
      AND startDatetime2 < :end 
      AND endDatetime2 > :start
  ) filteredUsers ON events.id = filteredUsers.eventId 
`;
    let wherePart = `1 = 1 `; // Start with a neutral condition for easier concatenation.
    //let wherePart = ' ';
    if (!filter.includeDeleted || filter.includeDeleted === 'false') {
      wherePart += `AND events.deletedAt IS NULL `;
    }

    let replacements = { uIds: uIds };

    if (!filter.sandboxMode || filter.sandboxMode === 'false') {
      wherePart += `AND events.sandboxMode = 0 `;
    }

    if (filter.start && filter.end) {
      // Filter through end-start dates
      //wherePart += `AND startDatetime < :end AND endDatetime > :start `;
      replacements.start = filter.start;
      replacements.end = filter.end;
    }

    if (filter.activity && filter.activity.split('|').length > 0) {
      wherePart += `AND events.activity0Id IN (:activityIds) `;
      replacements.activityIds = filter.activity.split('|');
    }

    if (filter.updatedAtStart && filter.bol === 'true') {
      wherePart += `AND events.updatedAt > :updatedAt `;
      replacements.updatedAt = moment.utc(filter.updatedAtStart).format();
    }

    if (!filter.viewCancelation) {
      wherePart += `AND events.isCancelled != 1 `;
    }

    if (day_array.length < 7) {
      wherePart += `AND ${day_where_clause}`;
    }

    let groupByPart = `GROUP BY events.id`;

    let fullQuery = `
  SELECT ${selectPart} 
  FROM events 
  ${includePart} 
  WHERE ${wherePart} `;
    // ${groupByPart}
    //console.time('Query Execution');
    const filteredEvents = await db.sequelize.query(fullQuery, {
      replacements: replacements,
      type: db.sequelize.QueryTypes.SELECT,
      model: db.events, // Specify the model to map the results to, if needed
      //logging: console.log,
      //raw: true,
      benchmark: true,
    });
    //console.timeEnd('Query Execution');

    let userIdsOfALLEvents = new Map();
    let allEventIds = new Array();
    for (let k = 0; k < filteredEvents.length; k++) {
      if (filteredEvents[k].dataValues.activity0Id) {
        userIdsOfALLEvents.set(filteredEvents[k].dataValues.activity0Id, true);
      }

      if (filteredEvents[k].dataValues.location0Id) {
        userIdsOfALLEvents.set(filteredEvents[k].dataValues.location0Id, true);
      }

      let currentEventUsers = filteredEvents[k].dataValues.userIds;
      for (let m = 0; m < currentEventUsers.length; m++) {
        userIdsOfALLEvents.set(currentEventUsers[m], true);
      }
      allEventIds.push(filteredEvents[k].dataValues.id);
    }

    let userIdsOfALLEventsARRAY = [...userIdsOfALLEvents.keys()];
    let allUsers = [];
    if (filteredEvents.length > 0) {
      allUsers = await db.users.findAll({
        attributes: [
          'id',
          'firstName',
          'lastName',
          'billable',
          'color',
          'borderColor',
          'priority',
        ],
        where: {
          id: { [Op.or]: userIdsOfALLEventsARRAY },
        },
        benchmark: true,
        //logging: console.log,
        include: [
          {
            attributes: ['id', 'name'],
            model: db.roles,
            as: 'roles',
            through: { attributes: [] },
          },
          {
            attributes: ['id', 'name'],
            model: db.branches,
            as: 'branches',
            through: { attributes: [] },
          },
        ],
      });
    }

    let allEventStatuses = [];
    if (allUsers.length > 0) {
      allEventStatuses = await db.statusevents.findAll({
        //logging: console.log,
        benchmark: true,
        attributes: [
          'id',
          'startdatetime',
          'status',
          'note',
          'noteadmin',
          'late',
          'userId',
          'eventId',
          'reasonId',
        ],
        where: {
          eventId: { [Op.or]: allEventIds },
        },
      });
    }

    for (let p = 0; p < filteredEvents.length; p++) {
      filteredEvents[p].dataValues.users = new Array();
      filteredEvents[p].users = new Array();
      let currentEventUserIds = filteredEvents[p].dataValues.userIds;
      for (let q = 0; q < allUsers.length; q++) {
        if (currentEventUserIds.includes(allUsers[q].dataValues.id)) {
          filteredEvents[p].dataValues.users.push(allUsers[q]);
          filteredEvents[p].users.push(allUsers[q]);
        }

        if (
          allUsers[q].dataValues.id === filteredEvents[p].dataValues.activity0Id
        ) {
          filteredEvents[p].dataValues.activity0 = allUsers[q];
          filteredEvents[p].activity0 = allUsers[q];
          filteredEvents[p].dataValues.users.push(allUsers[q]);
          filteredEvents[p].users.push(allUsers[q]);
        }

        if (
          allUsers[q].dataValues.id === filteredEvents[p].dataValues.location0Id
        ) {
          filteredEvents[p].dataValues.location0 = allUsers[q];
          filteredEvents[p].location0 = allUsers[q];
          filteredEvents[p].dataValues.users.push(allUsers[q]);
          filteredEvents[p].users.push(allUsers[q]);
        }
      }

      // set statusevents
      filteredEvents[p].dataValues.statuses = new Array();
      for (let t = 0; t < allEventStatuses.length; t++) {
        if (
          allEventStatuses[t].dataValues.eventId ===
          filteredEvents[p].dataValues.id
        ) {
          const sObj = {
            id: allEventStatuses[t].dataValues.id,
            startdatetime: allEventStatuses[t].dataValues.startdatetime,
            status: allEventStatuses[t].dataValues.status,
            note: allEventStatuses[t].dataValues.note,
            noteadmin: allEventStatuses[t].dataValues.noteadmin,
            late: allEventStatuses[t].dataValues.late,
            userId: allEventStatuses[t].dataValues.userId,
            reasonId: allEventStatuses[t].dataValues.reasonId,
            eventId: allEventStatuses[t].dataValues.eventId,
          };
          filteredEvents[p].dataValues.statuses.push(sObj);
        }
      }
    }

    return { rows: filteredEvents, count: filteredEvents.length };
  }

  static async findByGroupIds(filter, options) {
    let where = {};
    // check if any of companyId or evenGroupIds is not provided
    // just return empty array
    if (!filter.eventGroupIds || !filter.companyId) {
      return [];
    }

    // filter.eventGroupIds is concatenation of multiple Ids with |
    // example: A1|A2|B1|C1|C2|C3
    where = {
      ...where,
      eventGroupId: { [Op.in]: filter.eventGroupIds.split('|') },
      '$activity0.companyId$': filter.companyId,
    };

    const users_include1 = [
      {
        attributes: ['id', 'name'],
        model: db.roles,
        as: 'roles',
        through: { attributes: [] },
      },
      {
        attributes: ['id', 'name'],
        model: db.branches,
        as: 'branches',
        through: { attributes: [] },
      },
    ];
    const events = await db.events.findAll({
      where,
      include: [
        {
          attributes: ['id', 'firstName', 'lastName'],
          model: db.users,
          as: 'users',
          through: { attributes: [] },
        },
        {
          attributes: ['id', 'firstName'],
          model: db.users,
          as: 'activity0',
        },
        {
          attributes: ['id', 'firstName'],
          model: db.users,
          as: 'location0',
        },
      ],
      order: [
        ['startRecur', 'ASC']
      ],
      paranoid: !filter?.includeDeleted,
    });

    let parsedEvents = JSON.parse(JSON.stringify(events));
    parsedEvents = parsedEvents.map((item) => {
      // Extract user IDs from the users array
      const userIds = item.users.map((user) => user.id);
      let days = get_week_day_ids({
        U: item.U,
        M: item.M,
        T: item.T,
        W: item.W,
        R: item.R,
        F: item.F,
        S: item.S,
      });

      // Return a new object with all the original keys plus the new `userIds` key
      return {
        ...item,
        userIds: userIds,
        daysOfWeek: days,
      };
    });
    return parsedEvents;
  }

  // TODO: remove not used
  static async findAllNEWYGOOEY(filter, options) {
    // const ids_payload = await this.findAllIds(filter, options);

    // let ids = ids_payload.rows.map((t) => t.id);
    // if (ids.length == 0) {
    //   ids = 'cnienc';
    // } else {
    //   ids = ids.join('|');
    // }

    // // if (filter.branches) {
    // //   filter.branches = await BranchesDBApi.getBranchStructures({
    // //     companyId: filter.companyId,
    // //     branchIds: filter.branches
    // //   });
    // // }
    // filter = { ...filter, ids: ids };

    // if (filter.branches) {
    //   filter.branches = await BranchesDBApi.getBranchStructures({
    //     companyId: filter.companyId,
    //     branchIds: filter.branches
    //   });
    // }

    var limit = filter.limit || 0;
    var offset = 0;
    const currentPage = filter.page;

    offset = currentPage * limit;

    const transaction = (options && options.transaction) || undefined;
    const users_include1 = [
      {
        attributes: ['id', 'name'],
        model: db.roles,
        as: 'roles',
        //separate:true,
        through: { attributes: [] },
      },

      {
        attributes: ['id', 'name'],
        model: db.branches,
        as: 'branches',
        through: { attributes: [] },
      },
    ];

    let where = {};

    let include = [
      // {
      //   model: db.events,
      //   as: 'eventConnect',
      // },
      // {
      //   attributes: ['id', 'firstName','priority','billable','color', 'borderColor',],
      //   model: db.users,
      //   as: 'activity0',
      //   //include: users_include2,
      //   //include: {all:true}
      // },
      // {
      //   attributes: ['id', 'firstName'],
      //   model: db.users,
      //   as: 'location0',
      //   //include: users_include3,
      //   //include:{all:true}
      // },
      {
        attributes: [
          'id',
          'firstName',
          'lastName',
          'billable',
          'color',
          'borderColor',
        ],
        model: db.users,
        as: 'users',
        //separate:true,
        through: { attributes: [] },
        include: users_include1,
      },
    ];
    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      // if (filter.ids) {
      //   where = {
      //     ...where,
      //     [Op.or]: filter.ids.split('|').map((item) => {
      //       return { ['Id']: Utils.uuid(item) };
      //     }),
      //   };
      // }

      if (filter.people) {
        where = {
          ...where,
          '$users.id$': { [Op.or]: filter.people.split('|') },
        };
      }

      if (filter.activity && filter.activity.split('|').length > 0) {
        where = {
          ...where,
          $activity0Id$: { [Op.or]: filter.activity.split('|') },
        };
      }

      if (filter.location && filter.location.split('|').length > 0) {
        where = {
          ...where,
          $location0Id$: { [Op.or]: filter.location.split('|') },
        };
      }

      // if (filter.branches) {
      //   where = {
      //     ...where,
      //     '$users->branches.id$': {
      //       [Op.or]: filter.branches.split('|').map((item) => {
      //         return Utils.uuid(item);
      //       }),
      //     },
      //   };
      // }

      if (filter.userName) {
        const tils = Utils.ilike('users', 'firstName', filter.userName);
        where = {
          ...where,
          [Op.and]: where[Op.and] ? [...where[Op.and], tils] : [tils],
        };
      }

      //CUSTOM FIND DATE RANGES OVERLAP - https://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
      if (filter.start && filter.end) {
        where = {
          ...where,
          [Op.and]: {
            startRecur: {
              //...where.startRecur,
              [Op.lt]: filter.end,
            },
            endRecur: {
              //...where.startRecur,
              [Op.gt]: filter.start,
            },
          },
        };
      }

      // if (filter.updatedAtStart && filter.bol == 'true') {
      //   where = {
      //     ...where,
      //     [Op.and]: {...where[Op.and],
      //       updatedAt: {
      //         [Op.gt]: moment.utc(filter.updatedAtStart).format(),
      //       },
      //     },
      //   };
      // }

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
      if (filter.updatedAtStart && filter.bol == 'true') {
        where = {
          ...where,
          [Op.and]: {
            ...where[Op.and],
            updatedAt: {
              [Op.gt]: moment.utc(filter.updatedAtStart).format(),
            },
          },
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
    let things = {
      where,
      include,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
      benchmark: true,
      //logging: (_, timingMs) => console.log(`[ Events 1 findAll() - Execution time: ${timingMs}ms ]`),
    };
    let include_final = [
      {
        attributes: ['id'],
        model: db.users,
        as: 'users',
        through: { attributes: [] },
        // include: {
        //   attributes: [],
        //   model: db.branches,
        //   as: 'branches',
        //   //separate:true,
        //   through: filter.branches
        //     ? {
        //         attributes: [],
        //         where: {
        //           [Op.or]: filter.branches.split('|').map((item) => {
        //             return { ['BranchId']: Utils.uuid(item) };
        //           }),
        //         },
        //       }
        //     : { attributes: [] },
        //   required: filter.branches ? true : null,
        // },
        // through: filter.people
        //   ? {
        //       attributes: [],
        //       where: {
        //         [Op.or]: filter.people.split('|').map((item) => {
        //           return { ['userId']: Utils.uuid(item) };
        //         }),
        //       },
        //     }
        //   : { attributes: [] },
        // required: filter.people ? true : null,
        //separate: true,
      },
    ];

    let things2 = {
      //attributes: ['id'],
      where,
      //include:include_final,
      include: include,
      subQuery: false,
      // order:
      //   filter.field && filter.sort
      //     ? [[filter.field, filter.sort]]
      //     : [['createdAt', 'desc']],
      transaction,
      benchmark: true,
      //logging: (_, timingMs) => console.log(`[ Events 2 findAll() - Execution time: ${timingMs}ms ]`),
    };
    if (filter.updatedAtStart && filter.bol == 'true') {
      things2 = { ...things2, paranoid: false };
    }
    const fo2 = await db.events.findAll({
      ...things2,
      attributes: ['id'],
      benchmark: true,
      include: [
        {
          attributes: ['id'],
          model: db.users,
          as: 'users',
          through: { attributes: [] },
        },
        // {
        //   attributes: ['id', 'firstName','priority'],
        //   model: db.users,
        //   as: 'activity0',
        // }
      ],
    });
    let ids = fo2.map((t) => t.id);
    if (ids.length == 0) {
      ids = 'cnienc';
    } else {
      ids = ids.join('|');
    }
    const fo = await db.events.findAll({
      ...things2,
      // include:include,
      where: {
        [Op.or]: ids.split('|').map((item) => {
          return { ['Id']: Utils.uuid(item) };
        }),
      },
      // where : {
      //       [Op.or]: ids.split('|').map((item) => {
      //         return { ['Id']: Utils.uuid(item) };
      //       }),
      //     }
    });
    fo.map((p) => {
      //console.log('himmy2',p.dataValues.users.length,p.dataValues.users);
      //console.log('himmy',p.dataValues.activity0);
    });
    //console.log('flicky',fo);
    const opt = {
      type: db.sequelize.QueryTypes.SELECT,
    };
    //console.log('smoofer',fo);
    // let users_additional = fo.flatMap(t=>{
    //   let arr = []
    //   if(t.dataValues.activity0Id){
    //     arr.push(t.dataValues.activity0Id)
    //   }
    //   if(t.dataValues.location0Id){
    //     arr.push(t.dataValues.location0Id)
    //   }
    //   return arr
    // })
    // users_additional = [...new Set(users_additional)]

    // //console.log('smoofer4',users_additional);
    // const event_ids = fo.map(t=>t.id)
    // console.timeEnd('hoomy1')
    // console.time('hoomy1.5')
    // const query_eventsUsersUsers = `SELECT eventId, userId FROM eventsUsersUsers WHERE eventId IN ('${event_ids.join("','")}')`
    // const eventsUsersUsers = await db.sequelize.query(query_eventsUsersUsers, opt);
    // console.timeEnd('hoomy1.5')
    // console.time('hoomy2')
    // console.timeEnd('hoomy2')
    // console.time('hoomy3')
    // let users_include = [
    //   {
    //     attributes: ['id', 'name'],
    //     model: db.roles,
    //     as: 'roles',
    //     through: { attributes: [] },
    //   },
    //   {
    //     attributes: ['id', 'name'],
    //     model: db.branches,
    //     as: 'branches',
    //     through: { attributes: [] },
    //   },
    // ]
    // let where_users = {
    //   [Op.or]: [...new Set(eventsUsersUsers.map(t=> t.userId))].concat(users_additional).map((item) => {
    //     return { ['Id']: Utils.uuid(item) };
    //   })
    // }
    // let users_things = {
    //   include: users_include,
    //   where: where_users
    // }
    // const users = await db.users.findAll(users_things);
    // console.timeEnd('hoomy3')
    // console.time('hoomy4')
    // for (let index = 0; index < fo.length; index++) {
    //   const element = fo[index];
    //   const event_id = element.dataValues.id
    //   const activity = element.dataValues.activity0Id
    //   const location = element.dataValues.location0Id
    //   let otherUsers = []
    //   if(activity) otherUsers.push(activity)
    //   if(location) otherUsers.push(location)

    //   // Format Users
    //   let usersOfEvent = eventsUsersUsers.filter((u) => u.eventId === event_id);
    //   if(activity) usersOfEvent.push({userId:activity})
    //   if(location) usersOfEvent.push({userId:location})
    //   const formattedUsersOfEvent = usersOfEvent.map((u) => {
    //     let index = -1
    //     for(let i = 0; i < users.length; i++) {
    //       const userId = users[i].id
    //       if(userId === u.userId) {
    //         index = i;
    //         break;
    //       }
    //     }
    //     return users[index];
    //   })
    // }
    // console.timeEnd('hoomy4')
    // console.log('footy',fo);
    // fo.forEach(t=>{
    //   if(t.dataValues.users){
    //     if(t.dataValues.activity0){

    //       let copy = t.dataValues.activity0
    //       copy.dataValues = {...copy.dataValues,roles:[{dataValues:{name:'Activity'},name:'Activity'}]}
    //      // t.dataValues.users = [copy,...t.dataValues.users]
    //      //console.log('flimp3',copy, t.dataValues.users);
    //      //t.dataValues.users = t.dataValues.users.filter(y=>y.dataValues.id != copy.dataValues.id)
    //      t.dataValues.users.push(copy)

    //     }
    //     if(t.dataValues.location0){
    //       let copy = t.dataValues.location0
    //       copy.dataValues = {...copy.dataValues,roles:[{dataValues:{name:'Location'},name:'Location'}]}
    //       //t.dataValues.users = [copy,...t.dataValues.users]
    //       //t.dataValues.users = t.dataValues.users.filter(y=>y.dataValues.id != copy.dataValues.id)
    //       t.dataValues.users.push(copy)
    //     }

    //   }
    // })
    //console.log('seeker',fo);
    return { rows: fo, count: fo.length };
  }

  // scheduler/statistics
  // scheduler/overbooking
  static async findAllStats(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    const users_include1 = [
      {
        attributes: ['id', 'name'],
        model: db.roles,
        as: 'roles',
        //separate:true,
        through: { attributes: [] },
      },

      {
        attributes: ['id', 'name'],
        model: db.branches,
        as: 'branches',
        through: { attributes: [] },
      },
    ];

    let where = {};

    let include = [
      {
        attributes: [
          'id',
          'firstName',
          'priority',
          'billable',
          'productivityInclude',
          'productivityExclude',
        ],
        model: db.users,
        as: 'activity0',
      },
      {
        attributes: ['id', 'firstName'],
        model: db.users,
        as: 'location0',
      },
      {
        attributes: [
          'id',
          'firstName',
          'lastName',
          'billable',
          'color',
          'borderColor',
        ],
        model: db.users,
        as: 'users',
        through: { attributes: [] },
        include: users_include1,
      },
    ];
    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.people) {
        where = {
          ...where,
          '$users.id$': { [Op.or]: filter.people.split('|') },
        };
      }

      if (filter.activity && filter.activity.split('|').length > 0) {
        where = {
          ...where,
          '$activity0.id$': { [Op.or]: filter.activity.split('|') },
        };
      }

      if (!filter.sandboxMode || filter.sandboxMode === 'false') {
        where = {
          ...where,
          sandboxMode: 0,
        };
      }
      if (filter.location && filter.location.split('|').length > 0) {
        where = {
          ...where,
          '$location0.id$': { [Op.or]: filter.location.split('|') },
        };
      }

      if (filter.userName) {
        const tils = Utils.ilike('users', 'firstName', filter.userName);
        where = {
          ...where,
          [Op.and]: where[Op.and] ? [...where[Op.and], tils] : [tils],
        };
      }

      //CUSTOM FIND DATE RANGES OVERLAP - https://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
      if (filter.start && filter.end) {
        where = {
          ...where,
          [Op.and]: {
            [Op.and]: [
              where_function(col('events.startDatetime'), {
                [Op.lt]: filter.end,
              }),
              where_function(col('events.endDatetime'), {
                [Op.gt]: filter.start,
              }),

              // Joined table conditions
              where_function(col('users->eventsUsersUsers.startDatetime2'), {
                [Op.lt]: filter.end,
              }),
              where_function(col('users->eventsUsersUsers.endDatetime2'), {
                [Op.gt]: filter.start,
              }),
            ],
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
      if (filter.updatedAtStart && filter.bol == 'true') {
        where = {
          ...where,
          [Op.and]: {
            ...where[Op.and],
            updatedAt: {
              [Op.gt]: moment.utc(filter.updatedAtStart).format(),
            },
          },
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
    let things2 = {
      where,
      include: include,
      transaction,
      //benchmark: true,
      ////logging: console.log,
    };
    if (filter.updatedAtStart && filter.bol == 'true') {
      things2 = { ...things2, paranoid: false };
    }
    const events = await db.events.findAll(things2);

    events.forEach((t) => {
      if (t.dataValues.users) {
        if (t.dataValues.activity0) {
          let copy = t.dataValues.activity0;
          copy.dataValues = {
            ...copy.dataValues,
            roles: [{ dataValues: { name: 'Activity' }, name: 'Activity' }],
          };
          t.dataValues.users.push(copy);
        }
        if (t.dataValues.location0) {
          let copy = t.dataValues.location0;
          copy.dataValues = {
            ...copy.dataValues,
            roles: [{ dataValues: { name: 'Location' }, name: 'Location' }],
          };
          t.dataValues.users.push(copy);
        }
      }
    });
    return { rows: events, count: events.length };
  }

  // TODO: remove not used
  static async findAllForStatistics(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    const usersInclude = [
      {
        attributes: ['id', 'name'],
        model: db.roles,
        as: 'roles',
        through: { attributes: [] },
      },

      {
        attributes: ['id', 'name'],
        model: db.branches,
        as: 'branches',
        through: { attributes: [] },
      },
    ];

    let where = {};

    let include = [
      {
        attributes: ['id', 'firstName', 'priority'],
        model: db.users,
        as: 'activity0',
      },
      {
        attributes: ['id', 'firstName'],
        model: db.users,
        as: 'location0',
      },
      {
        attributes: [
          'id',
          'firstName',
          'lastName',
          'billable',
          'color',
          'borderColor',
        ],
        model: db.users,
        as: 'users',
        through: { attributes: [] },
        include: usersInclude,
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.people) {
        where = {
          ...where,
          '$users.id$': { [Op.in]: filter.people.split('|') },
        };
      }

      if (filter.activity && filter.activity.split('|').length > 0) {
        where = {
          ...where,
          '$activity0.id$': { [Op.or]: filter.activity.split('|') },
        };
      }

      if (filter.userName) {
        const tils = Utils.ilike('users', 'firstName', filter.userName);
        where = {
          ...where,
          [Op.and]: where[Op.and] ? [...where[Op.and], tils] : [tils],
        };
      }

      //CUSTOM FIND DATE RANGES OVERLAP - https://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
      if (filter.start && filter.end) {
        where = {
          ...where,
          [Op.and]: {
            startRecur: {
              [Op.lt]: filter.end,
            },
            endRecur: {
              [Op.gt]: filter.start,
            },
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
      if (filter.updatedAtStart && filter.bol == 'true') {
        where = {
          ...where,
          [Op.and]: {
            ...where[Op.and],
            updatedAt: {
              [Op.gt]: moment.utc(filter.updatedAtStart).format(),
            },
          },
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

    let getIdsQuery = {
      attributes: ['id'],
      where,
      include: [
        {
          attributes: [],
          model: db.users,
          as: 'users',
          through: { attributes: [] },
        },
      ],
      transaction,
    };

    let rows = await db.events.findAll(getIdsQuery);
    const eventIdsParsed = JSON.parse(JSON.stringify(rows));
    const eventIdArray = eventIdsParsed.map((event) => event.id);

    let query = {
      where: {
        id: { [Op.in]: eventIdArray },
      },
      include: include,
      transaction,
      benchmark: true,
    };

    if (filter.updatedAtStart && filter.bol == 'true') {
      query = { ...query, paranoid: false };
    }

    const events = await db.events.findAll(query);

    events.forEach((t) => {
      if (t.dataValues.users) {
        if (t.dataValues.activity0) {
          let copy = t.dataValues.activity0;
          copy.dataValues = {
            ...copy.dataValues,
            roles: [{ dataValues: { name: 'Activity' }, name: 'Activity' }],
          };
          t.dataValues.users.push(copy);
        }
        if (t.dataValues.location0) {
          let copy = t.dataValues.location0;
          copy.dataValues = {
            ...copy.dataValues,
            roles: [{ dataValues: { name: 'Location' }, name: 'Location' }],
          };
          t.dataValues.users.push(copy);
        }
      }
    });

    return { rows: events, count: events.length };
  }

  // statistics/dashboard
  // statusevents/confirmations
  static async findAllEventsForDashboardDay(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    let where = {};

    let user_include = [];

    where = {
      [Op.and]: [
        // Main table conditions
        where_function(col('events.startDatetime'), { [Op.lt]: filter.end }),
        where_function(col('events.endDatetime'), { [Op.gt]: filter.start }),

        // Joined table conditions
        where_function(col('users->eventsUsersUsers.startDatetime2'), {
          [Op.lt]: filter.end,
        }),
        where_function(col('users->eventsUsersUsers.endDatetime2'), {
          [Op.gt]: filter.start,
        }),

        // Additional filters
        { '$activity0.companyId$': filter.companyId },
        { '$users.disabled$': 0 },
      ],
    };

    if (filter.branches.length > 0) {
      where = {
        ...where,
        '$users.branches.id$': { [Op.or]: filter.branches },
      };

      user_include.push({
        attributes: ['id'],
        model: db.branches,
        as: 'branches',
        through: { attributes: [] },
      });
    }

    if (filter.roles.length > 0) {
      where = {
        ...where,
        '$users.roles.name$': { [Op.or]: filter.roles },
      };

      user_include.push({
        attributes: ['id'],
        model: db.roles,
        as: 'roles',
        through: { attributes: [] },
      });
    }

    if (filter.users.length > 0) {
      where = {
        ...where,
        '$users.id$': { [Op.or]: filter.users },
      };
    }

    if (filter.subgroups.length > 0) {
      where = {
        ...where,
        '$users.subgroups.id$': { [Op.or]: filter.subgroups },
      };

      user_include.push({
        attributes: ['id'],
        model: db.subgroups,
        as: 'subgroups',
        through: { attributes: [] },
      });
    }

    let include = [
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
        include: user_include,
      },
    ];

    if (filter.includeLocations) {
      include.push({
        attributes: ['id', 'firstName'],
        model: db.users,
        as: 'location0',
      });
    }

    let query = {
      attributes: [
        'id',
        'start',
        'end',
        'startRecur',
        'endRecur',
        'frequency',
        'interval',
        'bysetpos',
        'M',
        'T',
        'W',
        'R',
        'F',
        'S',
        'U',
        'isCancelled',
        'cancelledByUserId',
        'cancellationReasonId',
      ],
      where: where,
      include: include,
      transaction,
      //logging: console.log,
      benchmark: true,
    };

    const events = await db.events.findAll(query);
    let parsedEvents = JSON.parse(JSON.stringify(events));

    return { rows: parsedEvents, count: parsedEvents.length };
  }

  // events/
  static async findAllEventsForTable(filter, options) {
    /********************************************************************
     * STEP 0: Setup references and variables
     ********************************************************************/
    const transaction = (options && options.transaction) || undefined;
    const sequelize = db.sequelize; // We'll do raw queries here

    if (!sequelize) {
      throw new Error(
        'db.sequelize is undefined. Make sure your Sequelize instance is accessible.',
      );
    }

    // The models we actually have
    const UsersModel = db.users;
    const EventsModel = db.events;
    if (!UsersModel) {
      throw new Error("Model 'db.users' is undefined. Check your setup.");
    }
    if (!EventsModel) {
      throw new Error("Model 'db.events' is undefined. Check your setup.");
    }

    const limitOffset = Utils.getLimitOffset(filter.limit, filter.page);

    /********************************************************************
     * STEP 1: Find matching Users (with user-level filters), limit them
     ********************************************************************/
    let userWhere = {};
    let userInclude = [];

    // 1A) Filter by roles
    if (filter.roles && filter.roles.length > 0) {
      userInclude.push({
        attributes: [],
        model: db.roles,
        as: 'roles',
        through: { attributes: [] },
        where: { name: { [Op.or]: filter.roles } },
        required: true,
      });
    }

    // 1B) Filter by branches
    if (filter.branches && filter.branches.length > 0) {
      userInclude.push({
        attributes: [],
        model: db.branches,
        as: 'branches',
        through: { attributes: [] },
        where: { id: { [Op.or]: filter.branches } },
        required: true,
      });
    }

    // 1C) companyId
    if (filter.companyId) {
      userWhere.companyId = Utils.uuid(filter.companyId);
    }

    // 1D) specific user IDs
    const userFilers = filter?.users?.split('|') ?? [];
    if (userFilers.length > 0) {
      userWhere.id = { [Op.or]: userFilers };
    }

    // 1E) firstName partial match
    if (filter.firstName) {
      // We'll do a literal with a replacement param
      userWhere = {
        ...userWhere,
        [Op.and]: [
          Sequelize.literal(
            `LOWER(CONCAT(users.firstName, users.lastName)) LIKE :substring`,
          ),
        ],
      };
    }

    // 1F) combined "firstName + ' ' + lastName"
    if (filter.user) {
      userWhere = {
        ...userWhere,
        [Op.and]: [
          ...(userWhere[Op.and] || []),
          Sequelize.literal(
            `LOWER(CONCAT(users.firstName, ' ', users.lastName)) LIKE '%${filter.user}%'`,
          ),
        ],
      };
    }

    let userFindOptions = {
      attributes: ['id'], // Only need user IDs
      where: userWhere,
      include: userInclude,
      // Apply limit/offset to the user query
      // limit: limitOffset.lim >= 0 ? limitOffset.lim : undefined,
      // offset: limitOffset.off >= 0 ? limitOffset.off : undefined,
      distinct: true,
      subQuery: false,
      transaction,
      benchmark: true,
    };

    // If firstName literal was used, supply replacements
    if (filter.firstName) {
      userFindOptions.replacements = {
        substring: `%${filter.firstName.replace(/\s/g, '').toLowerCase()}%`,
      };
    }

    const usersResult = await UsersModel.findAll(userFindOptions);
    if (!usersResult || usersResult.length === 0) {
      // No matching users => no events
      return { rows: [], count: 0 };
    }

    // Collect user IDs
    const userIds = usersResult.map((u) => u.id);

    /*************************************************************************
     * STEP 2: Raw SQL on pivot table (`eventsUsersUsers`) for event IDs
     *************************************************************************/
    // We'll build a WHERE clause in raw SQL referencing `userId`, `startDatetime2`, etc.
    // Make sure these table/column names match your MySQL schema.

    let pivotWhereClauses = [];
    let pivotReplacements = {};

    // userIds => `userId` IN (:userIds)
    pivotWhereClauses.push('`userId` IN (:userIds)');
    pivotReplacements.userIds = userIds;

    // pivot date constraints
    if (filter.start && filter.end) {
      pivotWhereClauses.push('`startDatetime2` < :end');
      pivotWhereClauses.push('`endDatetime2` > :start');
      pivotReplacements.end = filter.end;
      pivotReplacements.start = filter.start;
    }

    // Build final WHERE
    let pivotWhereSQL = pivotWhereClauses.length
      ? 'WHERE ' + pivotWhereClauses.join(' AND ')
      : '';

    // We'll do a DISTINCT eventId from that pivot table
    // with an ORDER + LIMIT/OFFSET
    const pivotSQL = `
      SELECT DISTINCT \`eventId\`
      FROM \`eventsUsersUsers\`
      ${pivotWhereSQL}
      ORDER BY \`eventId\``;
    //${limitOffset.lim >= 0 ? 'LIMIT :pivotLimit' : ''}
    // ${limitOffset.off >= 0 ? 'OFFSET :pivotOffset' : ''}

    if (limitOffset.lim >= 0) {
      pivotReplacements.pivotLimit = limitOffset.lim;
    }
    if (limitOffset.off >= 0) {
      pivotReplacements.pivotOffset = limitOffset.off;
    }

    // Execute raw query (MySQL syntax with backticks)
    const [pivotRows] = await sequelize.query(pivotSQL, {
      replacements: pivotReplacements,
      transaction,
      benchmark: true,
    });

    if (!pivotRows || pivotRows.length === 0) {
      // No matching pivot => no events
      return { rows: [], count: 0 };
    }

    // pivotRows is array of objects like [ { eventId: '...' }, ... ]
    const eventIdsFromPivot = pivotRows.map((r) => r.eventId);

    /*************************************************************************
     * STEP 3: Query the Events table for those eventIds + event-level filters
     *************************************************************************/
    let eventWhere = {};

    // event date constraints
    if (filter.start && filter.end) {
      eventWhere.startDatetime = { [Op.lt]: filter.end };
      eventWhere.endDatetime = { [Op.gt]: filter.start };
      eventWhere.startRecur = { [Op.lt]: filter.end };
      eventWhere.endRecur = { [Op.gt]: filter.start };
    }

    // updatedAt
    if (filter.updatedAt) {
      eventWhere['$events.updatedAt$'] = { [Op.gt]: filter.updatedAt };
    }

    // notes partial match
    if (filter.notes) {
      eventWhere = {
        ...eventWhere,
        [Op.and]: Utils.ilike('events', 'notes', filter.notes),
      };
    }

    // converted
    if (
      filter.converted === true ||
      filter.converted === 'true' ||
      filter.converted === false ||
      filter.converted === 'false'
    ) {
      eventWhere.converted = JSON.parse(filter.converted);
    }

    // weekdays
    if (filter.weekdays) {
      const letters = filter.weekdays.split('|');
      const weekdaysObj = {};
      letters.forEach((letter) => {
        weekdaysObj[letter] = true;
      });
      eventWhere = {
        ...eventWhere,
        [Op.or]: weekdaysObj,
      };
    }

    if (filter.activity) {
      eventWhere.activity0Id = filter.activity;
    }

    // Merge status filters
    const { where: statusWhere2, options: statusOptions2 } =
      buildStatusFilterings(filter);
    eventWhere = { ...eventWhere, ...statusWhere2 };

    // Only events in eventIdsFromPivot
    eventWhere.id = { [Op.in]: eventIdsFromPivot };

    let finalEventFindOptions = {
      attributes: [
        'id',
        'start',
        'end',
        'startRecur',
        'endRecur',
        'frequency',
        'interval',
        'bysetpos',
        'M',
        'T',
        'W',
        'R',
        'F',
        'S',
        'U',
        'notes',
        'isCancelled',
        'cancelledByUserId',
        'cancellationReasonId',
        'createdAt',
        'deletedAt',
        'updatedAt',
        'timezone',
        'converted',
        'startActual',
        'endActual',
      ],
      where: eventWhere,
      paranoid:
        filter.showDeleted === true || filter.showDeleted === 'true'
          ? false
          : true,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],

      // Optionally limit again
      limit: limitOffset.lim >= 0 ? limitOffset.lim : undefined,
      offset: limitOffset.off >= 0 ? limitOffset.off : undefined,

      benchmark: true,
      transaction,
      ...statusOptions2,
    };

    const result = await EventsModel.findAndCountAll(finalEventFindOptions);
    let eventsMatched = result.rows

    if (eventsMatched.length === 0) {
      return { rows: [], count: 0 };
    }

    let parsedEvents = JSON.parse(JSON.stringify(eventsMatched));
    const finalEventIds = parsedEvents.map((e) => e.id);

    // For the final "count", let's assume # of matched events:
    let numberOfEvents = result.count;

    /*************************************************************************
     * STEP 4: (Optional) fetch full associations (activity0, location0, users)
     *************************************************************************/
    let finalInclude = [
      {
        attributes: ['id', 'firstName'],
        model: db.users,
        as: 'activity0',
        required: false,
      },
      {
        attributes: ['id', 'firstName'],
        model: db.users,
        as: 'location0',
        required: false,
      },
      {
        attributes: [
          'id',
          'firstName',
          'lastName',
          'email',
          'idCustom',
          'idCustom2',
        ],
        model: db.users,
        as: 'users',
        required: false,
        through: { attributes: [] },
        include: [
          {
            attributes: ['id', 'name'],
            model: db.roles,
            as: 'roles',
            through: { attributes: [] },
          },
          {
            attributes: ['id', 'name'],
            model: db.subgroups,
            as: 'subgroups',
            through: { attributes: [] },
          },
          {
            attributes: [],
            model: db.branches,
            as: 'branches',
            through: { attributes: [] },
          },
        ],
      },
    ];

    const finalEventsWithIncludes = await EventsModel.findAll({
      where: { id: { [Op.in]: finalEventIds } },
      include: finalInclude,
      paranoid:
        filter.showDeleted === true || filter.showDeleted === 'true'
          ? false
          : true,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      benchmark: true,
      transaction,
      ...statusOptions2
    });

    let finalParsed = JSON.parse(JSON.stringify(finalEventsWithIncludes));

    /*************************************************************************
     * STEP 5: Build "title" + local times
     *************************************************************************/
    let timezoneNow = momentTimezone.tz.zone('America/Chicago');
    for (let i = 0; i < finalParsed.length; i++) {
      let ev = finalParsed[i];
      let title =
        moment(ev.start).format('h:mm A') +
        '-' +
        moment(ev.end).format('h:mm A') +
        ' ';
      if (ev.users) {
        ev.users.forEach((user) => {
          title += user.firstName + ' ' + user.lastName + ' - ';
        });
      }
      title += ev.activity0?.firstName || '';
      ev.title = title;

      timezoneNow = momentTimezone.tz.zone(ev.timezone)
        ? ev.timezone
        : 'America/Chicago';

      ev.startLocal = ev.date;
      ev.endLocal = ev.date;
    }

    /*************************************************************************
     * STEP 6: RRule expansions if filter.populate
     *************************************************************************/
    let populatedEvents = [];
    if (filter.start && filter.end) {
      let startDate = moment.utc(filter.start).toDate();
      let endDate = moment.utc(filter.end).add(1, 'days').toDate();

      finalParsed.forEach((event) => {
        if (event.start && event.end) {
          const startRule = moment
            .utc(
              event.startRecur + ' ' + moment.utc(event.start).format('HH:mm'),
              'YYYY-MM-DD HH:mm',
            )
            .toDate();
          const endRule = moment.utc(event.endRecur).toDate();

          let weekDaysOfEvent = [];
          if (event.M) weekDaysOfEvent.push(0);
          if (event.T) weekDaysOfEvent.push(1);
          if (event.W) weekDaysOfEvent.push(2);
          if (event.R) weekDaysOfEvent.push(3);
          if (event.F) weekDaysOfEvent.push(4);
          if (event.S) weekDaysOfEvent.push(5);
          if (event.U) weekDaysOfEvent.push(6);

          let rruleObject = {
            freq: rule_RRule.RRule[event.frequency.toUpperCase()],
            interval: event.interval,
            byweekday: weekDaysOfEvent,
            dtstart: startRule,
            until: endRule,
          };
          if (event.bysetpos !== null) {
            rruleObject.bysetpos = Number(event.bysetpos);
          }

          let rule = new rule_RRule.RRule(rruleObject);
          const description = rule.toText();

          if (filter.populate) {
            let allEventsWithRuleInRange = rule.between(startDate, endDate);
            for (let dateValue of allEventsWithRuleInRange) {
              let dateIncludedEvent = { ...event, description };
              const event_time = dateValue;

              // Duration = (end - start)
              const startMoment = momentTimezone(event.start);
              const endMoment = momentTimezone(event.end);
              const duration = momentTimezone.duration(
                endMoment.diff(startMoment),
              );

              // Add that duration to event_time
              const eventMoment = momentTimezone(event_time);
              const adjustedEventMoment = eventMoment.clone().add(duration);

              const tz = momentTimezone.tz.zone(timezoneNow)
                ? timezoneNow
                : 'America/Chicago';

              dateIncludedEvent.startLocal = eventMoment
                .tz(tz)
                .format('YYYY-MM-DD HH:mm:ss z');
              dateIncludedEvent.endLocal = adjustedEventMoment
                .tz(tz)
                .format('YYYY-MM-DD HH:mm:ss z');
              dateIncludedEvent.date = moment(dateValue).format('YYYY-MM-DD');

              populatedEvents.push(dateIncludedEvent);
            }
          } else {
            populatedEvents.push({ ...event, description });
          }
        }
      });

      if (filter.populate) {
        return { rows: populatedEvents, count: populatedEvents.length };
      }
    }

    // If not populating expansions, we return the final expanded data
    // with the event-level associations, plus a count
    return {
      rows: populatedEvents,
      page: filter.page ? filter.page : -1,
      count: numberOfEvents,
    };
  }

  // events/list/for-analytics
  static async findAllEventsForAnalytics(filter, options) {
    /********************************************************************
     * STEP 0: Setup references and variables
     ********************************************************************/
    if (!filter.page || isNaN(Number(filter.page)) || Number(filter.page) <= 0){
      filter.page = 1
    }
    let limitOffset = Utils.getLimitOffset(5000, filter.page);
    if (!filter.companyId) {
      return []
    }
    const transaction = (options && options.transaction) || undefined;
    // The models we actually have
    const UsersModel = db.users;
    const EventsModel = db.events;
    if (!UsersModel) {
      throw new Error("Model 'db.users' is undefined. Check your setup.");
    }
    if (!EventsModel) {
      throw new Error("Model 'db.events' is undefined. Check your setup.");
    }

    /********************************************************************
     * STEP 1: Find Users
     ********************************************************************/
    let userInclude = [
      {
        attributes: ['id', 'name'],
        model: db.roles,
        as: 'roles',
        through: { attributes: [] },
        required: true,
      }
    ];

    let userFindOptions = {
      attributes: ['id', 'firstName', 'lastName', 'email', 'deletedAt', 'idCustom2', 'createdById', 'updatedById'],
      include: userInclude,
      paranoid: false,
      transaction,
    };

    const usersResult = await UsersModel.findAll(userFindOptions);
    if (!usersResult || usersResult.length === 0) {
      return []
    }
    console.time("GET users")
    const parsedUsers = JSON.parse(JSON.stringify(usersResult));
    // Ensure role lists are valid before checking roles
    const clientRoles = (options && options.clientRoles) || [];
    const employeeRoles = (options && options.employeeRoles) || [];
    const usersWithResourceType = parsedUsers.map((currentUser) => {
      currentUser.resourceType = ''
      // Check if currentUser's resourceType
      const isClient = currentUser.roles.some((role) =>
        clientRoles.includes(role.name),
      );
      const isEmployee =
        !isClient &&
        currentUser.roles.some((role) =>
          employeeRoles.includes(role.name),
        );
      currentUser.resourceType = isClient
        ? 'Client'
        : isEmployee
          ? 'Employee'
          : '';

      // remove roles as they are not needed in the response
      currentUser.userId = currentUser.id
      delete currentUser.roles
      return currentUser
    })

    const userMap = usersWithResourceType.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {});

    console.timeEnd("GET users")
    console.log("USERS number: ", usersWithResourceType.length)
    console.log("=============================")
    /*************************************************************************
     * STEP 2: Fetch all events
    ************************************************************************/
    console.time("Get events")
    let eventWhere = {
      updatedAt: { [Op.gte]: filter.updatedAt }
    }

    if (filter.cancelled !== undefined && filter.cancelled !== '') {
      eventWhere = {
        ...eventWhere,
        isCancelled: JSON.parse(filter.cancelled)
      }
    }
    const eventsResults = await EventsModel.findAll({
      where: eventWhere,
      limit: limitOffset.lim,
      offset: limitOffset.off,
      order : [['updatedAt', 'asc']],
      paranoid:
        filter.showDeleted === true || filter.showDeleted === 'true'
          ? false
          : true,
      transaction,
    });
    console.timeEnd("Get events")
    console.log("EVENT number: ", eventsResults.length)
    console.log("=============================")
    console.time("Match events with Users")
    /*************************************************************************
    * STEP 3: Match events with users
    ************************************************************************/
    const enrichedEvents = eventsResults.map(event => {
      const enrichedUserIds = event.dataValues.userIds
        ? event.dataValues.userIds.map(userId => {
          const currentUser = userMap[userId];
          return currentUser ? { ...currentUser, eventId: event.dataValues.id } : null;
        }).filter(user => user != null) : [];
      return {
        ...event.dataValues,
        users: enrichedUserIds
      };
    });
    console.timeEnd("Match events with Users")
    console.log("=============================")
    console.time("Build the title")
    /*************************************************************************
    * STEP 4: Build "title" + local times
    *************************************************************************/
    for (let i = 0; i < enrichedEvents.length; i++) {
      let ev = enrichedEvents[i];
      let tz = momentTimezone.tz.zone(ev.timezone)
        ? ev.timezone
        : 'America/Chicago';

      let title =
        momentTimezone(ev.start).tz(tz).format('h:mm A') +
        '-' +
        momentTimezone(ev.end).tz(tz).format('h:mm A') +
        ' ';
      if (ev.users) {
        ev.users.forEach((user) => {
          title += user.firstName + ' ' + user.lastName + ' - ';
        });
      }
      title += userMap[ev.activity0Id]?.firstName || '';
      ev.title = title;

      ev.startLocal = ev.date;
      ev.endLocal = ev.date;
      ev.firstName = userMap[ev.activity0Id]?.firstName ?? ''
      ev.firstName1 = userMap[ev.location0Id]?.firstName ?? '';
      delete ev.activity0
    }
    console.timeEnd("Build the title")
    console.log("=============================")
    console.time("Populate events")
    /*************************************************************************
     * STEP 5: RRule expansions if filter.populate
     *************************************************************************/
    let populatedEvents = [];
    enrichedEvents.forEach((event) => {
      if (event.start && event.end) {
        const startRule = moment
          .utc(
            event.startRecur + ' ' + moment.utc(event.start).format('HH:mm'),
            'YYYY-MM-DD HH:mm',
          )
          .toDate();
        const endRule = moment.utc(event.endRecur).toDate();

        let weekDaysOfEvent = [];
        if (event.M) weekDaysOfEvent.push(0);
        if (event.T) weekDaysOfEvent.push(1);
        if (event.W) weekDaysOfEvent.push(2);
        if (event.R) weekDaysOfEvent.push(3);
        if (event.F) weekDaysOfEvent.push(4);
        if (event.S) weekDaysOfEvent.push(5);
        if (event.U) weekDaysOfEvent.push(6);

        let rruleObject = {
          freq: rule_RRule.RRule[event.frequency.toUpperCase()],
          interval: event.interval,
          byweekday: weekDaysOfEvent,
          dtstart: startRule,
          until: endRule,
        };
        if (event.bysetpos !== null) {
          rruleObject.bysetpos = Number(event.bysetpos);
        }

        let rule = new rule_RRule.RRule(rruleObject);
        const description = rule.toText();

        let allEventsWithRuleInRange = rule.all();
        for (let dateValue of allEventsWithRuleInRange) {
          let dateIncludedEvent = { ...event, description };
          const event_time = dateValue;

          // Duration = (end - start)
          const startMoment = momentTimezone(event.start);
          const endMoment = momentTimezone(event.end);
          const duration = momentTimezone.duration(
            endMoment.diff(startMoment),
          );

          // Add that duration to event_time
          const eventMoment = momentTimezone(event_time);
          const adjustedEventMoment = eventMoment.clone().add(duration);

          const tz = momentTimezone.tz.zone(event.timezone)
            ? event.timezone
            : 'America/Chicago';
          
          let startInDST = momentTimezone(event.start).tz(tz).isDST()
          let currentInDST = momentTimezone(event_time).tz(tz).isDST()
          let adjustingHoursForDLS = 0
          if (startInDST !== currentInDST) {
            adjustingHoursForDLS = startInDST ? 1 : -1;
          }

          dateIncludedEvent.startLocal = eventMoment
            .tz(tz)
            .add(adjustingHoursForDLS, 'hours')
            .format('YYYY-MM-DD HH:mm:ss z');
          dateIncludedEvent.endLocal = adjustedEventMoment
            .tz(tz)
            .add(adjustingHoursForDLS, 'hours')
            .format('YYYY-MM-DD HH:mm:ss z');
          dateIncludedEvent.date = moment(dateValue).format('YYYY-MM-DD');

          populatedEvents.push(dateIncludedEvent);
        }
      }
    });

    console.timeEnd("Populate events")
    console.log("=============================")
    console.log("#################################################################################################")
    return {events: populatedEvents, page : Number(filter.page)}
  }

  // cancellations/
  static async findAllForCancellationTable(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    let limitOffset = Utils.getLimitOffset(filter.limit, filter.page);
    const days = getDaysOfWeekBetween(filter.start, filter.end);
    const daysArray = createDayArrayFromDaysOfWeek(days);  

    let where = {
      ['events.startDatetime']: {
        [Op.and]: [
          // Joined table conditions
          where_function(col('users->eventsUsersUsers.startDatetime2'), {
            [Op.lt]: filter.end,
          }),
          where_function(col('users->eventsUsersUsers.endDatetime2'), {
            [Op.gt]: filter.start,
          }),
        ],
      },
      [Op.or]: {
        ...daysArray.reduce((acc, day) => {
          acc[day] = 1;
          return acc;
        }, {}),
      },
      isCancelled: true,
    };

    let user_include = [];

    if (filter.branches.length > 0) {
      where = {
        ...where,
        '$users.branches.id$': { [Op.or]: filter.branches },
      };

      user_include.push({
        attributes: [],
        model: db.branches,
        as: 'branches',
        through: { attributes: [] },
      });
    }

    if (filter.activity) {
      where = {
        ...where,
        '$activity0.id$': { [Op.or]: [filter.activity] },
      };
    }

    if (filter.reason) {
      where = {
        ...where,
        cancellationReasonId: filter.reason,
      };
    }

    if (filter.roles.length > 0) {
      where = {
        ...where,
        '$users.roles.name$': { [Op.or]: filter.roles },
      };

      user_include.push({
        attributes: [],
        model: db.roles,
        as: 'roles',
        through: { attributes: [] },
      });
    }

    if (filter.companyId) {
      where = {
        ...where,
        ['$users.companyId$']: Utils.uuid(filter.companyId),
      };
    }

    // if (filter.start && filter.end) {
    //   where = {
    //     ...where,
    //     startRecur: {
    //       [Op.lte]: filter.end,
    //     },
    //     endRecur: {
    //       [Op.gt]: filter.start,
    //     },
    //   };
    // }

    // Adding ILIKE filter for firstName + ' ' + lastName
    if (filter.users) {
      where = {
        ...where,
        [Op.and]: [
          where,
          Sequelize.literal(
            `LOWER(concat(users.firstName, ' ', users.lastName)) LIKE '%${filter.users}%'`,
          ),
        ],
      };
    }

    if (filter.cancelledByUser){
      where = {
        ...where,
        [Op.or]: [
          { '$cancelledByUser.firstName$': { [Op.like]: `%${filter.cancelledByUser}%` } },
          { '$cancelledByUser.lastName$': { [Op.like]: `%${filter.cancelledByUser}%` } },
        ],
      };
    }

    if (filter?.cancelledByUserRoles?.length > 0) {
      where = {
        ...where,
        '$cancelledByUser.roles.name$': { [Op.or]: filter.cancelledByUserRoles },
      };
    }
    let include = [
      {
        attributes: ['id', 'firstName'],
        model: db.users,
        as: 'activity0',
      },
      {
        attributes: ['id', 'firstName'],
        model: db.users,
        as: 'location0',
      },
      {
        attributes: ['id', 'firstName', 'lastName'],
        model: db.users,
        as: 'users',
        through: { attributes: [] },
        include: user_include,
      },
      {
        attributes: ['id', 'firstName', 'lastName'],
        model: db.users,
        as: 'cancelledByUser',
        include: [
          {
            attributes: ['id', 'name'],
            model: db.roles,
            as: 'roles',
            through: { 
              attributes: [] 
            },
          }
        ]
      },
      {
        attributes: ['id', 'name'],
        model: db.cancellationtypes,
        as: 'cancellationReason',
      },
    ];
    let rows = [];
    let parsedEvents = [];
    let numberOfEvents = -1;

    if (limitOffset.lim >= 0 && limitOffset.off >= 0) {
      let eventIds = [];
      let queryOptionForGettingTheIds = {
        where,
        attributes: ['id'],
        group: ['id'],
        limit: limitOffset.lim,
        offset: limitOffset.off,
        subQuery: false,
        include: [
          {
            attributes: [],
            model: db.users,
            as: 'users',
            through: { attributes: [] },
            include: user_include,
          },
          {
            attributes: ['id'],
            model: db.users,
            as: 'activity0',
          },
        ],
        order:
          filter.field && filter.sort
            ? [[filter.field, filter.sort]]
            : [['createdAt', 'desc']],
        transaction,
        benchmark: true,
      };

      // if the filter `cancelledByUser` was provided
      // then we need to join users table for cancelledByUserId
      // for filtering with firstName and lastName
      // or if the filter `cancelledByUserRoles` was provided
      // then we need to join users table for cancelledByUserId
      // for filtering with roles
      if (filter.cancelledByUser || filter?.cancelledByUserRoles?.length > 0) {
        queryOptionForGettingTheIds.include.push({
          attributes: ['id', 'firstName', 'lastName'],
          model: db.users,
          as: 'cancelledByUser',
          include:
            filter?.cancelledByUserRoles?.length > 0
              ? [
                  {
                    attributes: [],
                    model: db.roles,
                    as: 'roles',
                    through: {
                      attributes: [],
                    },
                  },
                ]
              : [],
        });
      }

      const results = await db.events.findAndCountAll(
        queryOptionForGettingTheIds,
      );

      eventIds = results.rows;
      numberOfEvents = results.count.length;
      const eventIdsParsed = JSON.parse(JSON.stringify(eventIds));
      const eventIdArray = eventIdsParsed.map((event) => event.id);

      if (eventIdArray.length === 0) {
        return { rows: [], count: 0 };
      }

      where = {
        id: { [Op.or]: eventIdArray },
      };
    }

    let query = {
      attributes: [
        'id',
        'start',
        'end',
        'startRecur',
        'endRecur',
        'frequency',
        'interval',
        'bysetpos',
        'M',
        'T',
        'W',
        'R',
        'F',
        'S',
        'U',
        'notes',
        'isCancelled',
        'cancelledByUserId',
        'cancellationReasonId',
        'timezone',
      ],
      where: where,
      include: include,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
      benchmark: true,
    };

    rows = await db.events.findAll(query);
    parsedEvents = JSON.parse(JSON.stringify(rows));

    if (numberOfEvents < 0) {
      numberOfEvents = parsedEvents.length;
    }

    // create description
    for (let p = 0; p < parsedEvents.length; p++) {
      const startRule = moment
        .utc(
          parsedEvents[p].startRecur +
            ' ' +
            moment.utc(parsedEvents[p].start).format('HH:mm'),
          'YYYY-MM-DD HH:mm',
        )
        .toDate();
      const endRule = moment.utc(parsedEvents[p].endRecur).toDate();

      let weekDaysOfEvent = [];
      // set the weekdays of rule
      if (parsedEvents[p].M) {
        weekDaysOfEvent.push(0);
      }
      if (parsedEvents[p].T) {
        weekDaysOfEvent.push(1);
      }
      if (parsedEvents[p].W) {
        weekDaysOfEvent.push(2);
      }
      if (parsedEvents[p].R) {
        weekDaysOfEvent.push(3);
      }
      if (parsedEvents[p].F) {
        weekDaysOfEvent.push(4);
      }
      if (parsedEvents[p].S) {
        weekDaysOfEvent.push(5);
      }
      if (parsedEvents[p].U) {
        weekDaysOfEvent.push(6);
      }

      // Manupilate Events
      let rruleObject = {
        freq: rule_RRule.RRule[parsedEvents[p].frequency.toUpperCase()],
        interval: parsedEvents[p].interval,
        byweekday: weekDaysOfEvent,
        dtstart: startRule,
        until: endRule,
      };
      if (parsedEvents[p].bysetpos !== null) {
        rruleObject = {
          ...rruleObject,
          bysetpos: Number(parsedEvents[p].bysetpos),
        };
      }

      let rule = new rule_RRule.RRule(rruleObject);
      parsedEvents[p].description = rule.toText();
    }

    return { rows: parsedEvents, count: numberOfEvents };
  }

  // push notification sender cron
  static async findAllForPushNotificationReminder(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    let where = {};

    // filter through end-start dates
    // const StartingPoint = Sequelize.literal('startDatetime');
    // const EndingPoint = Sequelize.literal('endDatetime');

    const StartTimeHour = Sequelize.literal('CONCAT(TIME(start))');

    where = {
      [Op.and]: {
        [Op.and]: [
          Sequelize.where(StartTimeHour, '>=', filter.startTime),
          Sequelize.where(StartTimeHour, '<', filter.endTime),
          // Sequelize.where(StartingPoint, '<', filter.end),
          // Sequelize.where(EndingPoint, '>', filter.start),
          where_function(col('events.startDatetime'), {
            [Op.lt]: filter.end,
          }),
          where_function(col('events.endDatetime'), {
            [Op.gt]: filter.start,
          }),

          // Joined table conditions
          where_function(col('users->eventsUsersUsers.startDatetime2'), {
            [Op.lt]: filter.end,
          }),
          where_function(col('users->eventsUsersUsers.endDatetime2'), {
            [Op.gt]: filter.start,
          }),
        ],
        '$users.disabled$': 0,
      },
    };

    let include = [
      {
        attributes: ['id', 'firstName'],
        model: db.users,
        as: 'activity0',
      },
      {
        attributes: ['id', 'firstName', 'lastName'],
        model: db.users,
        as: 'users',
        include: [
          {
            attributes: ['id', 'token'],
            model: db.mobiletokens,
            as: 'mobiletokens',
            through: { attributes: [] },
          },
        ],
        through: { attributes: [] },
      },
    ];

    let query = {
      attributes: [
        'id',
        'start',
        'end',
        'startRecur',
        'endRecur',
        'frequency',
        'interval',
        'bysetpos',
        'M',
        'T',
        'W',
        'R',
        'F',
        'S',
        'U',
        'isCancelled',
        'cancelledByUserId',
        'cancellationReasonId',
      ],
      where: where,
      include: include,
      transaction,
      benchmark: true,
    };

    const events = await db.events.findAll(query);
    let parsedEvents = JSON.parse(JSON.stringify(events));

    return { rows: parsedEvents, count: parsedEvents.length };
  }

  // push notification sender cron
  static async findEventsForPushNotificationReminderUpcomingMinute(
    filter,
    options,
  ) {
    const transaction = (options && options.transaction) || undefined;
    let where = {};

    // filter through end-start dates
    // const StartingPoint = Sequelize.literal('startDatetime');
    // const EndingPoint = Sequelize.literal('endDatetime');

    const StartTimeHour = Sequelize.literal('CONCAT(TIME(start))');

    where = {
      [Op.and]: {
        [Op.and]: [
          Sequelize.where(StartTimeHour, '=', filter.startTime),
          // Sequelize.where(StartingPoint, '<', filter.end),
          // Sequelize.where(EndingPoint, '>', filter.start),
          where_function(col('events.startDatetime'), {
            [Op.lt]: filter.end,
          }),
          where_function(col('events.endDatetime'), {
            [Op.gt]: filter.start,
          }),

          // Joined table conditions
          where_function(col('users->eventsUsersUsers.startDatetime2'), {
            [Op.lt]: filter.end,
          }),
          where_function(col('users->eventsUsersUsers.endDatetime2'), {
            [Op.gt]: filter.start,
          }),
        ],
        '$users.disabled$': 0,
      },
    };

    let include = [
      {
        attributes: ['id', 'firstName'],
        model: db.users,
        as: 'activity0',
      },
      {
        attributes: ['id', 'firstName'],
        model: db.users,
        as: 'location0',
      },
      {
        attributes: ['id', 'firstName', 'lastName'],
        model: db.users,
        as: 'users',
        include: [
          {
            attributes: ['id', 'token'],
            model: db.mobiletokens,
            as: 'mobiletokens',
            through: { attributes: [] },
          },
        ],
        through: { attributes: [] },
      },
    ];

    let query = {
      attributes: [
        'id',
        'start',
        'end',
        'startRecur',
        'endRecur',
        'frequency',
        'interval',
        'bysetpos',
        'M',
        'T',
        'W',
        'R',
        'F',
        'S',
        'U',
        'isCancelled',
        'cancelledByUserId',
        'cancellationReasonId',
      ],
      where: where,
      include: include,
      transaction,
      benchmark: true,
    };

    const events = await db.events.findAll(query);
    let parsedEvents = JSON.parse(JSON.stringify(events));

    return { rows: parsedEvents, count: parsedEvents.length };
  }

  // statistics/activity-table
  // statistics/charts
  // statistics/prodcutivity-efficiency-branch
  static async findAllEventsForDashboardDateRange(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    let where = {};

    let user_include = [];
    // filter through end-start dates
    const StartingPoint = Sequelize.literal('startDatetime');
    const EndingPoint = Sequelize.literal('endDatetime');
    let andObject = {
      [Op.and]: [
        where_function(col('events.startDatetime'), { [Op.lt]: filter.end }),
        where_function(col('events.endDatetime'), { [Op.gt]: filter.start }),

        // Joined table conditions
        where_function(col('users->eventsUsersUsers.startDatetime2'), {
          [Op.lt]: filter.end,
        }),
        where_function(col('users->eventsUsersUsers.endDatetime2'), {
          [Op.gt]: filter.start,
        }),
        { '$activity0.companyId$': filter.companyId },
      ],
    };
    if (filter.disabled) {
      andObject = { ...andObject, '$users.disabled$': 0 };
    }

    where = {
      [Op.and]: andObject,
    };

    if (filter.users.length > 0) {
      where = {
        '$users->eventsUsersUsers.userId$': { [Op.or]: filter.users },
        ...where,
      };
    }

    if (filter.branches.length > 0) {
      where = {
        ...where,
        '$users.branches.id$': { [Op.or]: filter.branches },
      };

      user_include.push({
        attributes: ['id'],
        model: db.branches,
        as: 'branches',
        through: { attributes: [] },
      });
    }

    if (filter.roles.length > 0) {
      where = {
        ...where,
        '$users.roles.name$': { [Op.or]: filter.roles },
      };

      user_include.push({
        attributes: ['id'],
        model: db.roles,
        as: 'roles',
        through: { attributes: [] },
      });
    }

    if (filter.subgroups.length > 0) {
      where = {
        ...where,
        '$users.subgroups.id$': { [Op.or]: filter.subgroups },
      };

      user_include.push({
        attributes: ['id'],
        model: db.subgroups,
        as: 'subgroups',
        through: { attributes: [] },
      });
    }

    let include = [
      {
        attributes: [
          'id',
          'firstName',
          'billable',
          'color',
          'borderColor',
          'productivityInclude',
          'productivityExclude',
          'supervisionRateInclude',
        ],
        model: db.users,
        as: 'activity0',
      },
      {
        attributes: ['id'],
        model: db.users,
        as: 'users',
        through: { attributes: [] },
        include: user_include,
      },
    ];

    if (filter.includeLocations) {
      include.push({
        attributes: ['id', 'firstName', 'color'],
        model: db.users,
        as: 'location0',
      });
    }

    let query = {
      attributes: [
        'id',
        'start',
        'end',
        'startRecur',
        'endRecur',
        'frequency',
        'interval',
        'bysetpos',
        'M',
        'T',
        'W',
        'R',
        'F',
        'S',
        'U',
        'isCancelled',
        'cancelledByUserId',
        'cancellationReasonId',
        'supervisionId',
      ],
      where: where,
      include: include,
      transaction,
      benchmark: true,
      //logging: console.log,
      // order: [
      //   // Cast the datetime to time directly in PostgreSQL
      //   [db.sequelize.literal('TIME(start)'), 'ASC'],
      // ],
    };

    const events = await db.events.findAll(query);
    let parsedEvents = events;

    return { rows: parsedEvents, count: parsedEvents.length };
  }

  // scheduler/events-pdf
  static async findAllEventsForEventWeekPdf(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    let where = {};

    let user_include = [];

    where = {
      [Op.and]: {
        [Op.and]: [
          where_function(col('events.startDatetime'), {
            [Op.lt]: filter.end,
          }),
          where_function(col('events.endDatetime'), {
            [Op.gt]: filter.start,
          }),

          // Joined table conditions
          where_function(col('users->eventsUsersUsers.startDatetime2'), {
            [Op.lt]: filter.end,
          }),
          where_function(col('users->eventsUsersUsers.endDatetime2'), {
            [Op.gt]: filter.start,
          }),
        ],
        '$users.disabled$': 0,
        '$users.branches.id$': { [Op.or]: filter.branches },
        sandboxMode: 0,
      },
    };

    if (filter.resources && filter.resources.length > 0) {
      where = {
        ...where,
        '$users.id$': { [Op.or]: filter.resources.split('|') },
      };
    }

    if (filter.activities) {
      where = {
        ...where,
        activity0Id: { [Op.or]: filter.activities.split('|') },
      };
    }

    if (filter.locations) {
      where = {
        ...where,
        location0Id: { [Op.or]: filter.locations.split('|') },
      };
    }

    user_include.push({
      attributes: ['name'],
      model: db.roles,
      as: 'roles',
      through: { attributes: [] },
    });

    user_include.push({
      attributes: ['id', 'name'],
      model: db.branches,
      as: 'branches',
      through: { attributes: [] },
    });

    let include_when_getting_ids = [
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
        ],
      },
    ];

    let eventIds = [];
    let queryOptionForGettingTheIds = {
      where,
      attributes: ['id'],
      group: ['id'],
      include: include_when_getting_ids,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
      //logging: console.log,
      benchmark: true,
    };

    const results = await db.events.findAndCountAll(
      queryOptionForGettingTheIds,
    );

    eventIds = results.rows;
    const eventIdsParsed = JSON.parse(JSON.stringify(eventIds));
    const eventIdArray = eventIdsParsed.map((event) => event.id);
    if (eventIdArray.length === 0) {
      return { rows: [], count: 0 };
    }

    where = {
      id: { [Op.or]: eventIdArray },
    };

    let include = [
      {
        attributes: ['id', 'firstName', 'color', 'paid', 'billable'],
        model: db.users,
        as: 'activity0',
      },
      {
        attributes: ['id', 'firstName', 'lastName'],
        model: db.users,
        as: 'users',
        through: { attributes: [] },
        include: user_include,
      },
      {
        attributes: ['id', 'firstName'],
        model: db.users,
        as: 'location0',
      },
    ];

    let query = {
      attributes: [
        'id',
        'start',
        'end',
        'startRecur',
        'endRecur',
        'frequency',
        'interval',
        'bysetpos',
        'M',
        'T',
        'W',
        'R',
        'F',
        'S',
        'U',
        'isCancelled',
        'cancelledByUserId',
        'cancellationReasonId',
        'notes',
      ],
      where: where,
      include: include,
      transaction,
      benchmark: true,
      ////logging: console.log,
      order: [
        // Cast the datetime to time directly in PostgreSQL
        [db.sequelize.literal('TIME(start)'), 'ASC'],
      ],
    };

    const events = await db.events.findAll(query);
    let parsedEvents = JSON.parse(JSON.stringify(events));

    return { rows: parsedEvents, count: parsedEvents.length };
  }

  static async findAllEventsForCalendar(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    let where = {};

    where = {
      [Op.and]: {
        [Op.and]: [
          where_function(col('events.startDatetime'), {
            [Op.lt]: filter.end,
          }),
          where_function(col('events.endDatetime'), {
            [Op.gt]: filter.start,
          }),

          // Joined table conditions
          where_function(col('users->eventsUsersUsers.startDatetime2'), {
            [Op.lt]: filter.end,
          }),
          where_function(col('users->eventsUsersUsers.endDatetime2'), {
            [Op.gt]: filter.start,
          }),
        ],
        '$users.id$': filter.userId,
        '$users.disabled$': 0,
        sandboxMode: 0,
      },
    };

    let includeWhenGettingIds = [
      {
        attributes: [],
        model: db.users,
        as: 'users',
        through: { attributes: [] },
      },
    ];

    let eventIds = [];
    let queryOptionForGettingTheIds = {
      where,
      attributes: ['id'],
      group: ['id'],
      include: includeWhenGettingIds,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
      benchmark: true,
    };

    const results = await db.events.findAndCountAll(
      queryOptionForGettingTheIds,
    );

    eventIds = results.rows;
    const eventIdsParsed = JSON.parse(JSON.stringify(eventIds));
    const eventIdArray = eventIdsParsed.map((event) => event.id);
    if (eventIdArray.length === 0) {
      return { rows: [], count: 0 };
    }

    where = {
      id: { [Op.or]: eventIdArray },
    };

    let include = [
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
      {
        attributes: ['id', 'firstName'],
        model: db.users,
        as: 'location0',
      },
    ];

    let query = {
      attributes: [
        'id',
        'start',
        'end',
        'startRecur',
        'endRecur',
        'frequency',
        'interval',
        'bysetpos',
        'M',
        'T',
        'W',
        'R',
        'F',
        'S',
        'U',
        'isCancelled',
        'cancelledByUserId',
        'cancellationReasonId',
        'notes',
        'timezone',
      ],
      where: where,
      include: include,
      transaction,
      benchmark: true,
      order: [
        [db.sequelize.literal('TIME(start)'), 'ASC'],
      ],
    };

    const events = await db.events.findAll(query);
    let parsedEvents = JSON.parse(JSON.stringify(events));

    return { rows: parsedEvents, count: parsedEvents.length };
  }

  // TODO: remove not used (it is in statisticsService but i guess it is not )
  static async findCancelledEventIdsOfDates(dates) {
    let where = {};
    where = {
      date: { [Op.or]: dates },
    };

    const cancellations = await db.cancellations.findAll({
      attributes: ['eventId'],
      where,
    });

    let parsedCancellations = JSON.parse(JSON.stringify(cancellations));

    const eventIdArray = parsedCancellations.map(
      (cancelation) => cancelation.eventId,
    );

    return eventIdArray;
  }

  // TODO: remove not used (it is in statisticsService but i guess it is not )
  static async findCancelledEventIdsOfWeek(dates) {
    let where = {};
    where = {
      date: { [Op.or]: dates },
    };

    const cancellations = await db.cancellations.findAll({
      attributes: ['eventId', 'date'],
      where,
    });

    let parsedCancellations = JSON.parse(JSON.stringify(cancellations));

    return { rows: parsedCancellations };
  }

  // TODO: remove not used
  static async findAll11(filter, options) {
    const ids_payload = await this.findAllIds(filter, options);

    let ids = ids_payload.rows.map((t) => t.id);
    if (ids.length == 0) {
      ids = 'cnienc';
    } else {
      ids = ids.join('|');
    }

    // if (filter.branches) {
    //   filter.branches = await BranchesDBApi.getBranchStructures({
    //     companyId: filter.companyId,
    //     branchIds: filter.branches
    //   });
    // }
    filter = { ...filter, ids: ids };

    var limit = filter.limit || 0;
    var offset = 0;
    const currentPage = filter.page;

    offset = currentPage * limit;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      // {
      //   model: db.events,
      //   as: 'eventConnect',
      // },
      {
        attributes: [
          'id',
          'firstName',
          'lastName',
          'billable',
          'color',
          'borderColor',
        ],
        model: db.users,
        as: 'users',
        //separate:true,
        through: { attributes: [] },
        include: [
          {
            attributes: ['id', 'name'],
            model: db.roles,
            as: 'roles',
            //separate:true,
            through: { attributes: [] },
            // through: peopleIds
            // ? {
            //     attributes: [],
            //     where: {
            //       [Op.or]: peopleIds.map((item) => {
            //         return { ['roleId']: Utils.uuid(item) };
            //       }),
            //     },
            //   }
            // : { attributes: [] },
          },
          {
            attributes: ['id', 'name'],
            model: db.branches,
            as: 'branches',
            //separate:true,
            through: filter.branches
              ? {
                  attributes: [],
                  where: {
                    [Op.or]: filter.branches.split('|').map((item) => {
                      return { ['BranchId']: Utils.uuid(item) };
                    }),
                  },
                }
              : { attributes: [] },
            required: filter.branches ? true : null,
          },
        ],
      },
    ];
    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.ids) {
        where = {
          ...where,
          [Op.or]: filter.ids.split('|').map((item) => {
            return { ['Id']: Utils.uuid(item) };
          }),
        };
      }

      if (filter.userName) {
        const tils = Utils.ilike('users', 'firstName', filter.userName);
        where = {
          ...where,
          [Op.and]: where[Op.and] ? [...where[Op.and], tils] : [tils],
        };
      }

      //CUSTOM FIND DATE RANGES OVERLAP - https://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
      if (filter.start && filter.end) {
        where = {
          ...where,
          [Op.and]: {
            startRecur: {
              //...where.startRecur,
              [Op.lt]: filter.end,
            },
            endRecur: {
              //...where.startRecur,
              [Op.gt]: filter.start,
            },
          },
        };
      }

      // if (filter.updatedAtStart && filter.bol == 'true') {
      //   where = {
      //     ...where,
      //     [Op.and]: {...where[Op.and],
      //       updatedAt: {
      //         [Op.gt]: moment.utc(filter.updatedAtStart).format(),
      //       },
      //     },
      //   };
      // }

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
    let things = {
      where,
      include,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
      benchmark: true,
      // logging: (_, timingMs) => console.log(`[ Events 1 findAll() - Execution time: ${timingMs}ms ]`),
    };
    let things2 = {
      where,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
      benchmark: true,
      // logging: (_, timingMs) => console.log(`[ Events 2 findAll() - Execution time: ${timingMs}ms ]`),
    };
    if (filter.updatedAtStart && filter.bol == 'true') {
      things2 = { ...things, paranoid: false };
    }
    const fo = await db.events.findAll(things2);
    const opt = {
      type: db.sequelize.QueryTypes.SELECT,
    };
    const query_eventsUsersUsers = `SELECT eventId, userId FROM eventsUsersUsers WHERE eventId IN ('${filter.ids
      .split('|')
      .join("','")}')`;
    const eventsUsersUsers = await db.sequelize.query(
      query_eventsUsersUsers,
      opt,
    );

    const eventsDaysOfWeekDaysofweek = [];

    let users_include = [
      {
        attributes: ['id', 'name'],
        model: db.roles,
        as: 'roles',
        through: { attributes: [] },
      },
      {
        attributes: ['id', 'name'],
        model: db.branches,
        as: 'branches',
        through: { attributes: [] },
      },
    ];
    let where_users = {
      [Op.or]: [...new Set(eventsUsersUsers.map((t) => t.userId))].map(
        (item) => {
          return { ['Id']: Utils.uuid(item) };
        },
      ),
    };
    let users_things = {
      include: users_include,
      where: where_users,
    };
    const users = await db.users.findAll(users_things);

    for (let index = 0; index < fo.length; index++) {
      const element = fo[index];
      const event_id = element.dataValues.id;

      const daysOfWeek = eventsDaysOfWeekDaysofweek
        .filter((d) => d.eventId === event_id)
        .map((d) => ({ id: d.daysofweekId }));

      // Format Users
      const usersOfEvent = eventsUsersUsers.filter(
        (u) => u.eventId === event_id,
      );
      const formattedUsersOfEvent = usersOfEvent.map((u) => {
        let index = -1;
        for (let i = 0; i < users.length; i++) {
          if (users[i].id === u.userId) {
            index = i;
            break;
          }
        }
        return users[index];
      });

      fo[index] = { ...fo[index], daysOfWeek, users: formattedUsersOfEvent };
      fo[index]['dataValues'] = {
        ...fo[index]['dataValues'],
        daysOfWeek,
        users: formattedUsersOfEvent,
      };
    }

    return { rows: fo, count: fo.length };
  }

  // TODO: remove not used
  static async findAll8(filter, options) {
    const ids_payload = await this.findAllIds(filter, options);
    let ids = ids_payload.rows.map((t) => t.id);
    if (ids.length == 0) {
      ids = 'cnienc';
    } else {
      ids = ids.join('|');
    }

    if (filter.branches) {
      filter.branches = await BranchesDBApi.getBranchStructures({
        companyId: filter.companyId,
        branchIds: filter.branches,
      });
    }
    filter = { ...filter, ids: ids };

    var limit = filter.limit || 0;
    var offset = 0;
    const currentPage = filter.page;

    offset = currentPage * limit;

    var orderBy = null;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      // {
      //   model: db.events,
      //   as: 'eventConnect',
      // },
      {
        attributes: [
          'id',
          'firstName',
          'lastName',
          'billable',
          'color',
          'borderColor',
        ],
        model: db.users,
        as: 'users',
        //separate:true,
        through: { attributes: [] },
        include: [
          {
            attributes: ['id', 'name'],
            model: db.roles,
            as: 'roles',
            //separate:true,
            through: { attributes: [] },
            // through: peopleIds
            // ? {
            //     attributes: [],
            //     where: {
            //       [Op.or]: peopleIds.map((item) => {
            //         return { ['roleId']: Utils.uuid(item) };
            //       }),
            //     },
            //   }
            // : { attributes: [] },
          },
          {
            attributes: ['id', 'name'],
            model: db.branches,
            as: 'branches',
            //separate:true,
            through: filter.branches
              ? {
                  attributes: [],
                  where: {
                    [Op.or]: filter.branches.split('|').map((item) => {
                      return { ['BranchId']: Utils.uuid(item) };
                    }),
                  },
                }
              : { attributes: [] },
            required: filter.branches ? true : null,
          },
        ],
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.ids) {
        where = {
          ...where,
          [Op.or]: filter.ids.split('|').map((item) => {
            return { ['Id']: Utils.uuid(item) };
          }),
        };
      }

      if (filter.userName) {
        const tils = Utils.ilike('users', 'firstName', filter.userName);
        where = {
          ...where,
          [Op.and]: where[Op.and] ? [...where[Op.and], tils] : [tils],
        };
      }

      //CUSTOM FIND DATE RANGES OVERLAP - https://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
      if (filter.start && filter.end) {
        where = {
          ...where,
          [Op.and]: {
            startRecur: {
              //...where.startRecur,
              [Op.lt]: filter.end,
            },
            endRecur: {
              //...where.startRecur,
              [Op.gt]: filter.start,
            },
          },
        };
      }

      // if (filter.updatedAtStart && filter.bol == 'true') {
      //   where = {
      //     ...where,
      //     [Op.and]: {...where[Op.and],
      //       updatedAt: {
      //         [Op.gt]: moment.utc(filter.updatedAtStart).format(),
      //       },
      //     },
      //   };
      // }

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

    let things = {
      where,
      include,
      //limit: limit ? Number(limit) : undefined,
      //attributes: [],
      //offset: offset ? Number(offset) : undefined,
      ////logging: console.log,

      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
      benchmark: true,
      //logging: (_, timingMs) => console.log(`[ Events findAll() - Execution time: ${timingMs}ms ]`),
    };
    // if (filter.id_only) {
    //   things = { ...things, attributes: ['id'] };
    // }
    if (filter.updatedAtStart && filter.bol == 'true') {
      things = { ...things, paranoid: false };
    }
    const fo = await db.events.findAll(things);
    return { rows: fo, count: fo.length };
  }

  // events/autocomplete
  static async findAllAutocomplete(query, limit, filter) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike('events', 'users', query),
        ],
      };
    }

    const records = await db.events.findAll({
      attributes: ['id', 'users'],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['users', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.users,
    }));
  }

  // constraint-gap/flags
  static async findAllEventsOfUserForConstraintBreakCheck(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    let where = {};

    let user_include = [
      {
        attributes: ['id', 'name'],
        model: db.roles,
        as: 'roles',
        through: { attributes: [] },
      },
      {
        attributes: ['id', 'name'],
        model: db.subgroups,
        as: 'subgroups',
        through: { attributes: [] },
      },
      {
        attributes: ['id', 'name'],
        model: db.branches,
        as: 'branches',
        through: { attributes: [] },
      },
    ];

    // filter through end-start dates
    where = {
      [Op.and]: {
        [Op.and]: [
          where_function(col('events.startDatetime'), {
            [Op.lt]: filter.end,
          }),
          where_function(col('events.endDatetime'), {
            [Op.gt]: filter.start,
          }),

          // Joined table conditions
          where_function(col('users->eventsUsersUsers.startDatetime2'), {
            [Op.lt]: filter.end,
          }),
          where_function(col('users->eventsUsersUsers.endDatetime2'), {
            [Op.gt]: filter.start,
          }),
        ],
        '$users.disabled$': 0,
        '$users.id$': filter.userId,
      },
    };

    if (!filter.sandboxMode || filter.sandboxMode === 'false') {
      where = {
        ...where,
        sandboxMode: 0,
      };
    }
    console.log('hippy');

    let include = [
      {
        attributes: ['id', 'firstName'],
        model: db.users,
        as: 'activity0',
        include: user_include,
      },
      {
        attributes: ['id', 'firstName', 'address'],
        model: db.users,
        as: 'location0',
        include: user_include,
      },
      {
        attributes: ['id', 'firstName', 'lastName', 'address'],
        model: db.users,
        as: 'users',
        through: { attributes: [] },
        include: user_include,
      },
    ];

    let queryForGettingTheIds = {
      attributes: ['id'],
      where: where,
      include: [
        {
          attributes: [],
          model: db.users,
          as: 'users',
          through: { attributes: [] },
        },
      ],
      transaction,
      benchmark: true,
    };

    const result = await db.events.findAll(queryForGettingTheIds);
    let IDs = JSON.parse(JSON.stringify(result)).map((event) => event.id);
    IDs.push('ForCathcingTheEmptyCase');

    let mainQuery = {
      attributes: [
        'id',
        'start',
        'end',
        'startRecur',
        'endRecur',
        'frequency',
        'interval',
        'bysetpos',
        'M',
        'T',
        'W',
        'R',
        'F',
        'S',
        'U',
        'isCancelled',
        'cancelledByUserId',
        'cancellationReasonId',
        'supervisionId',
      ],
      where: {
        id: { [Op.or]: IDs },
      },
      include: include,
      transaction,
      //benchmark: true,
      ////logging: console.log,
    };

    const events = await db.events.findAll(mainQuery);
    let res = JSON.parse(JSON.stringify(events));

    return { rows: res, count: res.length };
  }

  // TODO: remove not used
  static async findAllEventsOfUserForGapCheck(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    let where = {};

    // filter through end-start dates
    const StartingPoint = Sequelize.literal('startDatetime');
    const EndingPoint = Sequelize.literal('endDatetime');

    where = {
      [Op.and]: {
        [Op.and]: [
          Sequelize.where(StartingPoint, '<', filter.end),
          Sequelize.where(EndingPoint, '>', filter.start),
        ],
        '$users.disabled$': 0,
        '$users.id$': filter.userId,
      },
    };

    let queryForGettingTheIds = {
      attributes: ['id'],
      where: where,
      include: [
        {
          attributes: [],
          model: db.users,
          as: 'users',
          through: { attributes: [] },
        },
      ],
      transaction,
      benchmark: true,
    };

    const result = await db.events.findAll(queryForGettingTheIds);
    let IDs = JSON.parse(JSON.stringify(result)).map((event) => event.id);
    IDs.push('ForCathcingTheEmptyCase');
    let mainQuery = {
      attributes: [
        'id',
        'start',
        'end',
        'startRecur',
        'endRecur',
        'frequency',
        'interval',
        'bysetpos',
        'M',
        'T',
        'W',
        'R',
        'F',
        'S',
        'U',
        'isCancelled',
        'cancelledByUserId',
        'cancellationReasonId',
      ],
      where: {
        id: { [Op.or]: IDs },
      },
      transaction,
      benchmark: true,
    };

    const events = await db.events.findAll(mainQuery);
    let res = JSON.parse(JSON.stringify(events));

    return { rows: res, count: res.length };
  }

  // constraint-gap/flags
  // eventhistory/constraints/:id route
  static async findAllEventsOfMultipleUsersForConstraintBreakCheck(
    filter,
    options,
  ) {
    const transaction = (options && options.transaction) || undefined;
    let where = {};

    let user_include = [
      {
        attributes: ['id', 'name'],
        model: db.roles,
        as: 'roles',
        through: { attributes: [] },
      },
      {
        attributes: ['id', 'name', 'groupId'],
        model: db.subgroups,
        as: 'subgroups',
        through: { attributes: [] },
      },

      {
        attributes: ['id', 'name'],
        model: db.branches,
        as: 'branches',
        through: { attributes: [] },
      },
    ];

    // filter through end-start dates
    const StartingPoint = Sequelize.literal('startDatetime');
    const EndingPoint = Sequelize.literal('endDatetime');

    where = {
      [Op.and]: {
        [Op.and]: [
          where_function(col('events.startDatetime'), {
            [Op.lt]: filter.end,
          }),
          where_function(col('events.endDatetime'), {
            [Op.gt]: filter.start,
          }),

          // Joined table conditions
          where_function(col('users->eventsUsersUsers.startDatetime2'), {
            [Op.lt]: filter.end,
          }),
          where_function(col('users->eventsUsersUsers.endDatetime2'), {
            [Op.gt]: filter.start,
          }),
        ],
        '$users.disabled$': 0,
        '$users.id$': {
          [Op.in]: filter.userIds,
        },
      },
    };
    if (!filter.sandboxMode || filter.sandboxMode === 'false') {
      where = {
        ...where,
        sandboxMode: 0,
      };
    }

    let include = [
      {
        attributes: ['id', 'firstName', 'notWorking'],
        model: db.users,
        as: 'activity0',
        include: user_include,
      },
      {
        attributes: ['id', 'firstName', 'address'],
        model: db.users,
        as: 'location0',
        include: user_include,
      },
      {
        attributes: ['id', 'firstName', 'lastName', 'address'],
        model: db.users,
        as: 'users',
        through: { attributes: [] },
        include: user_include,
      },
    ];

    let queryForGettingTheIds = {
      attributes: ['id'],
      where: where,
      include: [
        {
          attributes: [],
          model: db.users,
          as: 'users',
          through: { attributes: [] },
        },
      ],
      transaction,
      benchmark: true,
      //logging: console.log,
    };

    const result = await db.events.findAll(queryForGettingTheIds);
    let IDs = JSON.parse(JSON.stringify(result)).map((event) => event.id);
    if (IDs.length === 0){
      return { rows: [], count: 0 };
    }

    let mainQuery = {
      attributes: [
        'id',
        'start',
        'end',
        'startRecur',
        'endRecur',
        'frequency',
        'interval',
        'bysetpos',
        'M',
        'T',
        'W',
        'R',
        'F',
        'S',
        'U',
        'isCancelled',
        'cancelledByUserId',
        'cancellationReasonId',
        'supervisionId',
        'userIds',
        'activity0Id',
        'location0Id',
      ],
      where: {
        id: { [Op.or]: IDs },
      },
      //where: where,
      //include: include,
      transaction,
      benchmark: true,
      //logging: console.log,
    };

    let events = await db.events.findAll(mainQuery);
    //console.log('eventsNow', events);
    let userIds = new Set();

    events.forEach((e) => {
      //const currentUserIds = e.users.map((t) => t.id);
      //console.log('filler', e);

      if (e.dataValues.activity0Id) {
        userIds.add(e.dataValues.activity0Id);
      }
      if (e.dataValues.location0Id) {
        userIds.add(e.dataValues.location0Id);
      }

      e.dataValues.userIds.forEach((id) => userIds.add(id));
    });

    userIds = Array.from(userIds); // Convert Set to Array if needed

    const mainQueryUsers = {
      include: user_include,
      where: {
        id: { [Op.or]: userIds },
      },
      transaction,
      benchmark: true,
      //logging: console.log,
    };
    const resultsUsers = await db.users.findAll(mainQueryUsers);
    const userSet = Object.fromEntries(
      resultsUsers.map((user) => [user.id, user]),
    );
    //console.log('userSet', userSet);

    events.forEach((e) => {
      const userInfo = e.dataValues.userIds
        .flatMap((userId) => userSet[userId])
        .filter(Boolean); // Remove undefined/null values
      Object.assign(e.dataValues, {
        users: userInfo,
        activity0: userSet[e.dataValues.activity0Id] || null,
        location0: userSet[e.dataValues.location0Id] || null,
      });

      Object.assign(e, {
        users: userInfo,
        activity0: userSet[e.dataValues.activity0Id] || null,
        location0: userSet[e.dataValues.location0Id] || null,
      });
    });
    //console.log('userIds', events);
    let res = events;

    return { rows: res, count: res.length };
  }

  // eventhistory/constraints/:id route
  static async findByIdForConstraints(where, options) {
    // const transaction = (options && options.transaction) || undefined;

    const users_include1 = [
      {
        attributes: ['id', 'name'],
        model: db.roles,
        as: 'roles',
        through: { attributes: [] },
      },
      {
        attributes: ['id', 'name', 'groupId'],
        model: db.subgroups,
        as: 'subgroups',
        through: { attributes: [] },
      },
    ];
    const eventsPk = await db.events.findOne({
      where,
      include: [
        {
          attributes: ['id', 'firstName', 'lastName'],
          model: db.users,
          as: 'users',
          through: { attributes: [] },
          include: users_include1,
        },
        {
          attributes: ['id', 'firstName'],
          model: db.users,
          as: 'activity0',
          include: users_include1,
        },
        {
          attributes: ['id', 'firstName'],
          model: db.users,
          as: 'location0',
          include: users_include1,
        },
      ],
      attributes: [
        'id',
        'start',
        'end',
        'startRecur',
        'endRecur',
        'frequency',
        'interval',
        'bysetpos',
        'M',
        'T',
        'W',
        'R',
        'F',
        'S',
        'U',
        'isCancelled',
        'cancelledByUserId',
        'cancellationReasonId',
      ],
    });

    if (!eventsPk) {
      return false;
    }
    eventsPk.dataValues.users.filter((t) => {
      const roles_u = t.dataValues.roles.map((r) => r.name);
      if (roles_u.includes('Block') || roles_u.includes('Funder')) {
        return false;
      } else {
        return true;
      }
    });
    // let activity = eventsPk.dataValues.activity0;
    // if (activity) {
    //   eventsPk.dataValues.users.push(activity);
    // }
    // let location = eventsPk.dataValues.location0;
    // if (location) {
    //   eventsPk.dataValues.users.push(location);
    // }

    let res = JSON.parse(JSON.stringify(eventsPk));

    return res;
  }

  // statistics/authorization-table route
  static async findAllEventsForAuthTableDateRange(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    let where = {};

    // filter through end-start dates
    const StartingPoint = Sequelize.literal('startDatetime');
    const EndingPoint = Sequelize.literal('endDatetime');
    where = {
      [Op.and]: {
        [Op.and]: [
          where_function(col('events.startDatetime'), {
            [Op.lt]: filter.end,
          }),
          where_function(col('events.endDatetime'), {
            [Op.gt]: filter.start,
          }),

          // Joined table conditions
          where_function(col('users->eventsUsersUsers.startDatetime2'), {
            [Op.lt]: filter.end,
          }),
          where_function(col('users->eventsUsersUsers.endDatetime2'), {
            [Op.gt]: filter.start,
          }),
        ],
        activity0Id: filter.activity,
        '$users.disabled$': 0,
        '$users.id$': filter.userId,
      },
    };

    let include = [
      {
        attributes: ['id'],
        model: db.users,
        as: 'users',
        through: { attributes: [] },
      },
    ];

    let query = {
      attributes: [
        'id',
        'start',
        'end',
        'startRecur',
        'endRecur',
        'frequency',
        'interval',
        'bysetpos',
        'M',
        'T',
        'W',
        'R',
        'F',
        'S',
        'U',
        'isCancelled',
        'cancelledByUserId',
        'cancellationReasonId',
      ],
      where: where,
      include: include,
      transaction,
      //logging: console.log,
      benchmark: true,
    };

    const events = await db.events.findAll(query);
    let parsedEvents = JSON.parse(JSON.stringify(events));

    return { rows: parsedEvents, count: parsedEvents.length };
  }

  // get events by ids for generateSchedulerEvents() controller
  static async findAllEventsByIds(eventIds, includeDeleted) {
    const usersInclude = [
      {
        attributes: ['id', 'name'],
        model: db.roles,
        as: 'roles',
        through: { attributes: [] },
      },
      {
        attributes: ['id', 'name'],
        model: db.branches,
        as: 'branches',
        through: { attributes: [] },
      },
    ];

    const include = [
      {
        attributes: [
          'id',
          'firstName',
          'priority',
          'billable',
          'color',
          'borderColor',
        ],
        model: db.users,
        as: 'activity0',
      },
      {
        attributes: [
          'id',
          'firstName',
          'priority',
          'billable',
          'color',
          'borderColor',
        ],
        model: db.users,
        as: 'location0',
      },
      {
        attributes: [
          'id',
          'firstName',
          'lastName',
          'billable',
          'color',
          'borderColor',
        ],
        model: db.users,
        as: 'users',
        through: { attributes: [] },
        include: usersInclude,
      },
    ];

    const events = await db.events.findAll({
      where: {
        id: eventIds,
      },
      useMaster: true,
      include,
      paranoid: !includeDeleted,
    });

    events.forEach((t) => {
      if (t.dataValues.users) {
        if (t.dataValues.activity0) {
          let copy = t.dataValues.activity0;
          copy.dataValues = {
            ...copy.dataValues,
            roles: [{ dataValues: { name: 'Activity' }, name: 'Activity' }],
          };
          t.dataValues.users.push(copy);
        }
        if (t.dataValues.location0) {
          let copy = t.dataValues.location0;
          copy.dataValues = {
            ...copy.dataValues,
            roles: [{ dataValues: { name: 'Location' }, name: 'Location' }],
          };
          t.dataValues.users.push(copy);
        }
      }
    });

    return events;
  }

  static async findAllEventDateInfoOfUserForStatuseventConfirmation(
    filter,
    options,
  ) {
    const transaction = (options && options.transaction) || undefined;

    let include = [
      {
        attributes: [],
        model: db.users,
        as: 'users',
        through: { attributes: [] },
      },
    ];

    let mainQuery = {
      attributes: [
        'id',
        'start',
        'end',
        'startRecur',
        'endRecur',
        'isCancelled',
        'cancelledByUserId',
        'cancellationReasonId',
      ],
      where: {
        id: { [Op.or]: filter.eventIds },
        '$users.id$': filter.userId,
      },
      include: include,
      transaction,
      benchmark: true,
    };

    const events = await db.events.findAll(mainQuery);
    let res = JSON.parse(JSON.stringify(events));

    return { rows: res };
  }

  static async deletedAndModifyTheFutureEventsOfUsers(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    if (!filter.userId || !filter.date) {
      return { updated: 0, deleted: 0 };
    }
    // 1. Get all events of the specific user where endRecur > filter.date

    // I made this paranoid=false intentionally, because when we are
    // deleting or updating the events of user, the user might be already
    // deleted and has NOT NULL on column deletedAt
    let include = [
      {
        attributes: [],
        model: db.users,
        as: 'users',
        through: { attributes: [] },
        paranoid: false,
      },
    ];

    let mainQuery = {
      attributes: ['id', 'startRecur', 'endRecur'],
      where: {
        '$users.id$': filter.userId,
        endRecur: { [Op.gt]: filter.date }, // endRecur must be greater than filter.date
      },
      include: include,
      transaction,
      benchmark: true,
    };

    const events = await db.events.findAll(mainQuery);
    let res = JSON.parse(JSON.stringify(events));

    // 2. Update events where startRecur < filter.date by setting endRecur = filter.date
    const eventsToUpdate = res.filter(
      (event) =>
        moment.utc(event.startRecur).toDate() <
        moment(filter.date).utc().startOf('day').toDate(),
    );

    if (eventsToUpdate.length > 0) {
      const eventIdsToUpdate = eventsToUpdate.map((event) => event.id);
      await db.events.update(
        { endRecur: filter.date }, // Set endRecur to current date
        {
          where: { id: { [Op.in]: eventIdsToUpdate } },
          transaction,
        },
      );
    }

    // 3. Delete events where startRecur >= filter.date and endRecur > filter.date
    const eventsToDelete = res.filter(
      (event) =>
        new moment.utc(event.startRecur).toDate() >=
        moment(filter.date).utc().startOf('day').toDate(),
    );

    if (eventsToDelete.length > 0) {
      const eventIdsToDelete = eventsToDelete.map((event) => event.id);

      for (let m = 0; m < eventIdsToDelete.length; m++) {
        const currentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
        await db.events.update(
          {
            eventGroupId: uuidv4(),
            updatedAt: currentDateTime,
          },
          {
            where: { id: eventIdsToDelete[m] },
            transaction,
          },
        );
      }

      await db.events.destroy({
        where: { id: { [Op.in]: eventIdsToDelete } },
        transaction,
      });
    }

    return { updated: eventsToUpdate.length, deleted: eventsToDelete.length };
  }

  static async findByIdForUndoRedo(filter, options) {
    const event = await db.events.findOne({
      where: {
        id: filter.id,
      },
      include: [
        {
          attributes: ['id', 'firstName', 'lastName'],
          model: db.users,
          as: 'users',
          through: { attributes: [] },
        },
      ],
    });

    if (!event) {
      return false;
    }

    let res = JSON.parse(JSON.stringify(event));
    res.users = res.users.map((user) => user.id);
    res.daysOfWeek = get_week_day_ids({
      U: res.U,
      M: res.M,
      T: res.T,
      W: res.W,
      R: res.R,
      F: res.F,
      S: res.S,
    });
    return res;
  }

  static async removeHardDeleteInBulk(data, options) {
    const transaction = (options && options.transaction) || undefined;
    // Retrieve user IDs for each event before deletion
    const selectUserIdsQuery = `SELECT eventId, userId FROM eventsUsersUsers WHERE eventId IN (:ids)`;
    const userRelations = await db.sequelize.query(selectUserIdsQuery, {
      replacements: { ids: data.ids },
      transaction: transaction,
      type: db.sequelize.QueryTypes.SELECT,
    });

    // Group user IDs by eventId
    const eventIdToUserIds = userRelations.reduce(
      (acc, { eventId, userId }) => {
        // Find the existing event object or create a new one if it doesn't exist
        let event = acc.find((e) => e.id === eventId);
        if (!event) {
          event = { id: eventId, users: [] };
          acc.push(event);
        }
        // Append the userId to the users array for the found/created event object
        event.users.push(userId);
        return acc;
      },
      [],
    );

    // Delete associated entries from eventsUsersUsers using raw SQL with replacements
    const deleteJoinTableQuery = `DELETE FROM eventsUsersUsers WHERE eventId IN (:ids)`;
    await db.sequelize.query(deleteJoinTableQuery, {
      replacements: { ids: data.ids },
      transaction: transaction,
      type: db.sequelize.QueryTypes.DELETE,
    });

    // I need to delete main events first to solve the deletion orddering problem
    // Delete events using raw SQL with replacements (MAIN EVENTS)
    const deleteMainEventsQuery = `DELETE FROM events WHERE id IN (:ids) and supervisionId IS NOT NULL`;
    await db.sequelize.query(deleteMainEventsQuery, {
      replacements: { ids: data.ids },
      transaction: transaction,
      type: db.sequelize.QueryTypes.DELETE,
    });

    // Delete events using raw SQL with replacements (SUPERVISION EVENTS)
    const deleteSupervisionEventsQuery = `DELETE FROM events WHERE id IN (:ids) and supervisionId IS NULL`;
    await db.sequelize.query(deleteSupervisionEventsQuery, {
      replacements: { ids: data.ids },
      transaction: transaction,
      type: db.sequelize.QueryTypes.DELETE,
    });

    return eventIdToUserIds;
  }

  static async restoreSoftDeletedInBulk(data, options) {
    const transaction = (options && options.transaction) || undefined;
    // Restore events using raw SQL with replacements
    const restoreEventsQuery = `UPDATE events SET deletedAt = NULL WHERE id IN (:ids) AND deletedAt IS NOT NULL`;
    await db.sequelize.query(restoreEventsQuery, {
      replacements: { ids: data.ids },
      transaction: transaction,
      type: db.sequelize.QueryTypes.UPDATE,
    });

    return true;
  }

  static async isActivityHasEvent(data, options) {
    const transaction = (options && options.transaction) || undefined;

    const query = `SELECT 1 as hasEvent FROM events WHERE activity0Id = :activity0Id AND deletedAt IS NULL LIMIT 1`;
    let result = await db.sequelize.query(query, {
      replacements: { activity0Id: data.activity0Id },
      transaction: transaction,
      type: db.sequelize.QueryTypes.SELECT,
    });

    return result.length > 0;
  }

  static async countBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const count = await db.events.count({
      where,
      transaction,
    });

    return count;
  }
};
