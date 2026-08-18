const db = require('../models');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

// TODO need to move to controller
/* Makes optimizer <-> roles relations with rank */
async function setRolesWithRank(optimizerId, rolesWithRank, transaction) {
  // Remove existing associations
  await db.optimizerObjectiverolesmanyRoles.destroy({
    where: { optimizerId },
    transaction,
  });

  // Prepare data for bulk creation
  const optimizerRoleEntries = rolesWithRank.map(role => ({
    optimizerId: optimizerId,
    roleId: role.roleId,
    rank: role.rank
  }));

  // Perform bulk creation
  await db.optimizerObjectiverolesmanyRoles.bulkCreate(optimizerRoleEntries, { transaction });
}
/* Makes optimizer <-> users relations with rank */
async function setUsersWithRank(optimizerId, usersWithRank, transaction) {
  // Remove existing associations
  await db.optimizerObjectiveactivitiesmanyUsers.destroy({
    where: { optimizerId },
    transaction,
  });

  // Prepare data for bulk creation
  const optimizerUserEntries = usersWithRank.map(role => ({
    optimizerId: optimizerId,
    userId: role.userId,
    rank: role.rank
  }));

  // Perform bulk creation
  await db.optimizerObjectiveactivitiesmanyUsers.bulkCreate(optimizerUserEntries, { transaction });
}

module.exports = class OptimizerDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const optimizer = await db.optimizer.create(
      {
        id: data.id || undefined,
        slotduration: data.slotduration || null,
        maxtime: data.maxtime || null,
        timeconstraints: data.timeconstraints || null,
        nogapsequation: data.nogapsequation || false,
        constraintdrive: data.constraintdrive || false,
        constraintteam: data.constraintteam || false,
        constraintlunch: data.constraintlunch || false,
        constraintlunchduration: data.constraintlunchduration || null,
        constraintbreak: data.constraintbreak || false,
        orange: data.orange || false,
        blocks: data.blocks || false,
        breaktime: data.breaktime || false,
        lunchtime: data.lunchtime || false,
        isdaily: data.isdaily || false,
        multi: data.multi || false,
        workers: data.workers || null,
        minsession: data.minsession || null,
        maxsession: data.maxsession || null,
        teamamount: data.teamamount || null,
        teammin: data.teammin || null,
        teamtolerance: data.teamtolerance || null,
        teamtolormin: data.teamtolormin || false,
        percentignore: data.percentignore || null,
        scratchoroptimize: data.scratchoroptimize || false,
        startdate: data.startdate || null,
        enddate: data.enddate || null,
        is_events: data.is_events || false,
        part1: data.part1 || false,
        is_overlap_constraint: data.is_overlap_constraint || false,
        is_minSession_constraint: data.is_minSession_constraint || false,
        is_delete: data.is_delete || false,
        break_length: data.break_length || null,
        breakQuantity: data.breakQuantity || 0,
        oneBreakHours: data.oneBreakHours || null,
        twoBreakHours: data.twoBreakHours || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await optimizer.setNogapsequationrole(data.nogapsequationrole || null, {
      transaction,
    });

    await optimizer.setObjectiverole(data.objectiverole || null, {
      transaction,
    });

    await optimizer.setObjectiveactivity(data.objectiveactivity || null, {
      transaction,
    });

    await optimizer.setNogapsrole(data.nogapsrole || null, {
      transaction,
    });

    await optimizer.setBranch(data.branch || null, {
      transaction,
    });

    await optimizer.setTeams(data.teams || [], {
      transaction,
    });

    await optimizer.setObjectiverolesmany(data.objectiverolesmany || [], {
      transaction,
    });

    await optimizer.setObjectiveactivitiesmany(
      data.objectiveactivitiesmany || [],
      {
        transaction,
      },
    );

    return optimizer;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const optimizer = await db.optimizer.findByPk(id, {
      transaction,
    });

    await optimizer.update(
      {
        slotduration: data.slotduration || null,
        maxtime: data.maxtime || null,
        timeconstraints: data.timeconstraints || null,
        nogapsequation: data.nogapsequation || false,
        constraintdrive: data.constraintdrive || false,
        constraintteam: data.constraintteam || false,
        constraintlunch: data.constraintlunch || false,
        constraintlunchduration: data.constraintlunchduration || null,
        constraintbreak: data.constraintbreak || false,
        orange: data.orange || false,
        blocks: data.blocks || false,
        breaktime: data.breaktime || false,
        lunchtime: data.lunchtime || false,
        isdaily: data.isdaily || false,
        multi: data.multi || false,
        workers: data.workers || null,
        minsession: data.minsession || null,
        maxsession: data.maxsession || null,
        teamamount: data.teamamount || null,
        teammin: data.teammin || null,
        teamtolerance: data.teamtolerance || null,
        teamtolormin: data.teamtolormin || false,
        percentignore: data.percentignore || null,
        scratchoroptimize: data.scratchoroptimize || false,
        startdate: data.startdate || null,
        enddate: data.enddate || null,
        is_events: data.is_events || false,
        break_length: data.break_length || null,
        part1: data.part1 || false,
        is_overlap_constraint: data.is_overlap_constraint || false,
        is_minSession_constraint: data.is_minSession_constraint || false,
        is_delete: data.is_delete || false,
        breakQuantity: data.breakQuantity || 0,
        oneBreakHours: data.oneBreakHours || null,
        twoBreakHours: data.twoBreakHours || null,
        allOrNothingBlocks: data.allOrNothingBlocks || false,
        maxEmployeeHoursPerDay: data.maxEmployeeHoursPerDay || 8,
        maxClientHoursPerDay: data.maxClientHoursPerDay || 8,
        maxGapEmployeeSchedule: data.maxGapEmployeeSchedule || 60,
        maxGapClientSchedule: data.maxGapClientSchedule || 0,
        clientsMaxAppointmentsPerDay: data.clientsMaxAppointmentsPerDay || 5,
        employeesMaxAppointmentsPerDay:
          data.employeesMaxAppointmentsPerDay || 5,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await optimizer.setNogapsequationrole(data.nogapsequationrole || null, {
      transaction,
    });

    await optimizer.setObjectiverole(data.objectiverole || null, {
      transaction,
    });

    await optimizer.setObjectiveactivity(data.objectiveactivity || null, {
      transaction,
    });

    await optimizer.setNogapsrole(data.nogapsrole || null, {
      transaction,
    });

    await optimizer.setBranch(data.branch || null, {
      transaction,
    });

    await optimizer.setTeams(data.teams || [], {
      transaction,
    });

    await setRolesWithRank(id, data.objectiverolesmany, transaction)

    await setUsersWithRank(id, data.objectiveactivitiesmany, transaction)

    return optimizer;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const optimizer = await db.optimizer.findByPk(id, options);

    await optimizer.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await optimizer.destroy({
      transaction,
    });

    return optimizer;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const optimizer = await db.optimizer.findOne({ where }, { transaction });

    if (!optimizer) {
      return optimizer;
    }

    const output = optimizer.get({ plain: true });

    output.nogapsequationrole = await optimizer.getNogapsequationrole({
      transaction,
    });

    output.objectiverole = await optimizer.getObjectiverole({
      transaction,
    });

    output.objectiveactivity = await optimizer.getObjectiveactivity({
      transaction,
    });

    output.nogapsrole = await optimizer.getNogapsrole({
      transaction,
    });

    output.branch = await optimizer.getBranch({
      transaction,
    });

    output.teams = await optimizer.getTeams({
      transaction,
    });

    output.objectiverolesmany = await optimizer.getObjectiverolesmany({
      transaction,
    });

    output.objectiveactivitiesmany = await optimizer.getObjectiveactivitiesmany(
      {
        transaction,
      },
    );

    return output;
  }

  static async findAll(filter, options) {
    var limit = filter.limit || 0;
    var offset = 0;
    const currentPage = +filter.page;

    offset = currentPage * limit;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        model: db.users,
        as: 'createdBy',
        paranoid: false,
      },
      {
        model: db.roles,
        as: 'nogapsequationrole',
      },

      {
        model: db.roles,
        as: 'objectiverole',
      },

      {
        model: db.users,
        as: 'objectiveactivity',
      },

      {
        model: db.roles,
        as: 'nogapsrole',
      },

      {
        model: db.branches,
        as: 'branch',
      },

      {
        model: db.branches,
        as: 'teams',
        through: filter.teams
          ? {
              where: {
                [Op.or]: filter.teams.split('|').map((item) => {
                  return { ['Id']: Utils.uuid(item) };
                }),
              },
            }
          : null,
        required: filter.teams ? true : null,
      },

      {
        model: db.roles,
        as: 'objectiverolesmany',
        attributes: ['id', 'name'],
        through: filter.objectiverolesmany
          ? {
              where: {
                [Op.or]: filter.objectiverolesmany.split('|').map((item) => {
                  return { ['Id']: Utils.uuid(item) };
                }),
              },
            }
          : null,
        required: filter.objectiverolesmany ? true : null,
      },
      {
        model: db.users,
        as: 'objectiveactivitiesmany',
        attributes: ['id', 'firstName', 'lastName'],
        through: filter.objectiveactivitiesmany
          ? {
              where: {
                [Op.or]: filter.objectiveactivitiesmany
                  .split('|')
                  .map((item) => {
                    return { ['Id']: Utils.uuid(item) };
                  }),
              },
            }
          : null,
        required: filter.objectiveactivitiesmany ? true : null,
      },
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

      if (filter.slotdurationRange) {
        const [start, end] = filter.slotdurationRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            slotduration: {
              ...where.slotduration,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            slotduration: {
              ...where.slotduration,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.maxtimeRange) {
        const [start, end] = filter.maxtimeRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            maxtime: {
              ...where.maxtime,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            maxtime: {
              ...where.maxtime,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.timeconstraintsRange) {
        const [start, end] = filter.timeconstraintsRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            timeconstraints: {
              ...where.timeconstraints,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            timeconstraints: {
              ...where.timeconstraints,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.constraintlunchdurationRange) {
        const [start, end] = filter.constraintlunchdurationRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            constraintlunchduration: {
              ...where.constraintlunchduration,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            constraintlunchduration: {
              ...where.constraintlunchduration,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.workersRange) {
        const [start, end] = filter.workersRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            workers: {
              ...where.workers,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            workers: {
              ...where.workers,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.minsessionRange) {
        const [start, end] = filter.minsessionRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            minsession: {
              ...where.minsession,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            minsession: {
              ...where.minsession,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.maxsessionRange) {
        const [start, end] = filter.maxsessionRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            maxsession: {
              ...where.maxsession,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            maxsession: {
              ...where.maxsession,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.teamamountRange) {
        const [start, end] = filter.teamamountRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            teamamount: {
              ...where.teamamount,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            teamamount: {
              ...where.teamamount,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.teamminRange) {
        const [start, end] = filter.teamminRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            teammin: {
              ...where.teammin,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            teammin: {
              ...where.teammin,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.teamtoleranceRange) {
        const [start, end] = filter.teamtoleranceRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            teamtolerance: {
              ...where.teamtolerance,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            teamtolerance: {
              ...where.teamtolerance,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.percentignoreRange) {
        const [start, end] = filter.percentignoreRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            percentignore: {
              ...where.percentignore,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            percentignore: {
              ...where.percentignore,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.startdateRange) {
        const [start, end] = filter.startdateRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            startdate: {
              ...where.startdate,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            startdate: {
              ...where.startdate,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.enddateRange) {
        const [start, end] = filter.enddateRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            enddate: {
              ...where.enddate,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            enddate: {
              ...where.enddate,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.break_lengthRange) {
        const [start, end] = filter.break_lengthRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            break_length: {
              ...where.break_length,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            break_length: {
              ...where.break_length,
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

      if (filter.nogapsequation) {
        where = {
          ...where,
          nogapsequation: filter.nogapsequation,
        };
      }

      if (filter.constraintdrive) {
        where = {
          ...where,
          constraintdrive: filter.constraintdrive,
        };
      }

      if (filter.constraintteam) {
        where = {
          ...where,
          constraintteam: filter.constraintteam,
        };
      }

      if (filter.constraintlunch) {
        where = {
          ...where,
          constraintlunch: filter.constraintlunch,
        };
      }

      if (filter.constraintbreak) {
        where = {
          ...where,
          constraintbreak: filter.constraintbreak,
        };
      }

      if (filter.orange) {
        where = {
          ...where,
          orange: filter.orange,
        };
      }

      if (filter.blocks) {
        where = {
          ...where,
          blocks: filter.blocks,
        };
      }

      if (filter.breaktime) {
        where = {
          ...where,
          breaktime: filter.breaktime,
        };
      }

      if (filter.lunchtime) {
        where = {
          ...where,
          lunchtime: filter.lunchtime,
        };
      }

      if (filter.isdaily) {
        where = {
          ...where,
          isdaily: filter.isdaily,
        };
      }

      if (filter.multi) {
        where = {
          ...where,
          multi: filter.multi,
        };
      }

      if (filter.teamtolormin) {
        where = {
          ...where,
          teamtolormin: filter.teamtolormin,
        };
      }

      if (filter.scratchoroptimize) {
        where = {
          ...where,
          scratchoroptimize: filter.scratchoroptimize,
        };
      }

      if (filter.is_events) {
        where = {
          ...where,
          is_events: filter.is_events,
        };
      }

      if (filter.part1) {
        where = {
          ...where,
          part1: filter.part1,
        };
      }

      if (filter.is_overlap_constraint) {
        where = {
          ...where,
          is_overlap_constraint: filter.is_overlap_constraint,
        };
      }

      if (filter.is_minSession_constraint) {
        where = {
          ...where,
          is_minSession_constraint: filter.is_minSession_constraint,
        };
      }

      if (filter.is_delete) {
        where = {
          ...where,
          is_delete: filter.is_delete,
        };
      }

      if (filter.nogapsequationrole) {
        var listItems = filter.nogapsequationrole.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          nogapsequationroleId: { [Op.or]: listItems },
        };
      }

      if (filter.objectiverole) {
        var listItems = filter.objectiverole.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          objectiveroleId: { [Op.or]: listItems },
        };
      }

      if (filter.objectiveactivity) {
        var listItems = filter.objectiveactivity.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          objectiveactivityId: { [Op.or]: listItems },
        };
      }

      if (filter.nogapsrole) {
        var listItems = filter.nogapsrole.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          nogapsroleId: { [Op.or]: listItems },
        };
      }

      if (filter.branch) {
        var listItems = filter.branch.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          branchId: { [Op.or]: listItems },
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

    let { rows, count } = await db.optimizer.findAndCountAll({
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

  static async findAllAutocomplete(query, limit) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike('optimizer', 'id', query),
        ],
      };
    }

    const records = await db.optimizer.findAll({
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
