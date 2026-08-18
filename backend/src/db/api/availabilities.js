const db = require('../models');
const BranchesDBApi = require('./branches');
const Utils = require('../utils');
const moment = require('moment');
const getWeekDayBooleanMap = require('../../utils/getWeekDayBooleanMap')

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;
const where_function = Sequelize.where;
const col = Sequelize.col;

module.exports = class AvailabilitiesDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const findAvailability = await db.availabilities.findByPk(data.id, {
      ...options,
      paranoid: false,
    });
    // If there is and available like this, then restore it.
    if (findAvailability) {
      await findAvailability.restore();
      return findAvailability;
    }

    const availabilities = await db.availabilities.create(
      {
        id: data.id || undefined,

        startTime: data.startTime || null,
        endTime: data.endTime || null,
        available: data.available || false,

        startRange: data.startRange || null,
        endRange: data.endRange || null,
        ...getWeekDayBooleanMap(data),
        frequency: data.frequency || null,
        interval: data.interval || null,
        bysetpos: data.bysetpos || null,

        disabled: data.disabled || false,
        status: data.status || null,
        importHash: data.importHash || null,
        timezone: data.timezone || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,

        timeoff: data.timeoff || 0,
        paid: data.paid || 0,
        oncall: data.oncall || 0,
        statusType: data.statusType || 'Add',
        requestedAt: data.requestedAt || null,
        decidedAt: data.decidedAt || null,
        reason: data.reason || null,
        notes: data.notes || null,
      },
      { transaction },
    );

    await availabilities.setUser(data.user || null, {
      transaction,
    });

    await availabilities.setBranch(data.branch || null, {
      transaction,
    });

    await availabilities.setLocation(data.location || null, {
      transaction,
    });

    await availabilities.setRoleLocation(data.roleLocation || [], {
      transaction,
    });

    await availabilities.setLocation2(data.location2 || [], {
      transaction,
    });

    await availabilities.setOldAvailability(data.oldAvailability || null, {
      transaction,
    });

    return availabilities;
  }

  static async updateStatus(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const availabilities = await db.availabilities.findByPk(id, {
      transaction,
    });

    await availabilities.update(
      {
        status: data.status || null,
        updatedById: currentUser.id,
        ...(data.statusType && { statusType: data.statusType }),
        ...(data.notes && { notes: data.notes }),
        requestedAt: data.requestedAt || new Date(),
      },
      { transaction },
    );

    return availabilities;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const availabilities = await db.availabilities.findByPk(id, {
      transaction,
    });

    await availabilities.update(
      {
        startTime: data.startTime || null,
        endTime: data.endTime || null,
        available: data.available || false,
        status: data.status || null,
        startRange: data.startRange || null,
        endRange: data.endRange || null,
        ...getWeekDayBooleanMap(data),
        frequency: data.frequency || null,
        interval: data.interval || null,
        bysetpos: data.bysetpos || null,

        disabled: data.disabled || false,
        timezone: data.timezone || null,
        updatedById: currentUser.id,

        timeoff: data.timeoff || 0,
        paid: data.paid || 0,
        oncall: data.oncall || 0,
        statusType: data.statusType || 'Add',
        requestedAt: data.requestedAt || null,
        decidedAt: data.decidedAt || null,
        reason: data.reason || null,
        notes: data.notes || null,
      },
      { transaction },
    );

    await availabilities.setUser(data.user || null, {
      transaction,
    });

    await availabilities.setBranch(data.branch || null, {
      transaction,
    });

    await availabilities.setLocation(data.location || null, {
      transaction,
    });

    await availabilities.setRoleLocation(data.roleLocation || [], {
      transaction,
    });

    await availabilities.setLocation2(data.location2 || [], {
      transaction,
    });

    await availabilities.setOldAvailability(data.oldAvailability || null, {
      transaction,
    });

    return availabilities;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const availabilities = await db.availabilities.findByPk(id, options);

    if (!availabilities) {
      return availabilities;
    }

    await availabilities.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await availabilities.destroy({
      transaction,
    });

    return availabilities;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const availabilities = await db.availabilities.findOne(
      { where },
      { transaction },
    );

    if (!availabilities) {
      return availabilities;
    }

    const output = availabilities.get({ plain: true });

    output.user = await availabilities.getUser({
      transaction,
    });

    output.roleLocation = await availabilities.getRoleLocation({
      transaction,
    });

    output.location = await availabilities.getLocation({
      transaction,
    });

    output.location2 = await availabilities.getLocation2({
      transaction,
    });

    output.oldAvailability = await availabilities.getOldAvailability({
      transaction,
    });

    output.branch = await availabilities.getBranch({ transaction });

    return output;
  }

  static async findAll(filter, options) {
    if (filter.branches) {
      let branchStructure =
        await BranchesDBApi.getDescendentAndAncestorBranches({
          branchIds: filter.branches,
        });

      filter.branches = branchStructure.join('|');
    }

    let limitOffset = Utils.getLimitOffset(filter.limit, filter.page);

    const transaction = (options && options.transaction) || undefined;
    let where = { [Op.and]: [] };
    let usersInclude = {
      attributes: ['id', 'firstName', 'lastName', 'companyId'],
      model: db.users,
      as: 'user',
    };
    if (filter.branches && filter.branches.length > 0) {
      usersInclude['include'] = [
        {
          attributes: [],
          model: db.branches,
          as: 'branches',
          through: { attributes: [] },
        },
      ];
    }

    let include = [
      // {
      //   model: db.users,
      //   as: 'updatedBy',
      //   paranoid: false,
      //   attributes: ['id', 'firstName', 'lastName'],
      // },
      // {
      //   attributes: [],
      //   model: db.availabilities,
      //   as: 'oldAvailability',
      // },
      // {
      //   attributes: ['id', 'name'],
      //   model: db.branches,
      //   as: 'branch',
      // },
      { ...usersInclude },
      // {
      //   attributes: ['id', 'name'],
      //   model: db.roles,

      //   as: 'roleLocation',
      //   through: filter.roleLocation
      //     ? {
      //         attributes: [],
      //         where: {
      //           [Op.or]: filter.roleLocation.split('|').map((item) => {
      //             return { ['Id']: Utils.uuid(item) };
      //           }),
      //         },
      //       }
      //     : { attributes: [] },
      //   required: filter.roleLocation ? true : null,
      // },

      {
        attributes: ['id', 'firstName', 'color'],
        model: db.users,
        as: 'location2',
        through: filter.location2
          ? {
              attributes: [],
              where: {
                [Op.or]: filter.location2.split('|').map((item) => {
                  return { ['Id']: Utils.uuid(item) };
                }),
              },
            }
          : { attributes: [] },
        required: filter.location2 ? true : null,
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }
      if (filter.status) {
        where = {
          ...where,
          status: { [Op.or]: filter.status.split('|') },
        };
      }

      // Initialize the OR condition array specifically for branches and persons
      const branchesAndPersonsConditions = [];

      if (filter.branches && filter.branches.length > 0) {
        const branchIds = filter.branches.split('|');
        branchesAndPersonsConditions.push({
          '$user.branches.id$': { [Op.in]: branchIds },
        });
        branchesAndPersonsConditions.push({
          '$availabilities.branchId$': { [Op.in]: branchIds },
        });
      }
      // Oncall
      // if user is sent to another center on date X it will have availability
      // with branchId=<id_of_branch_which_user_sent_to>
      if (filter.userSentBranches && filter.userSentBranches.length > 0) {
        branchesAndPersonsConditions.push({
          branchId: { [Op.or]: filter.userSentBranches },
        });
        branchesAndPersonsConditions.push({
          [Op.and]: {
            '$user.branches.id$': { [Op.in]: filter.userSentBranches },
            oncall: true,
          },
        });
      }

      // if (filter.people && filter.people.length > 0) {
      //   const personIds = filter.people.split('|');
      //   branchesAndPersonsConditions.push({
      //     '$user.id$': { [Op.in]: personIds },
      //   });
      // }

      // Add OR conditions to the main `where` clause only if needed
      if (branchesAndPersonsConditions.length > 0) {
        where = {
          ...where,
          [Op.or]: branchesAndPersonsConditions,
        };
      }

      if (filter.companyId) {
        where = {
          ...where,
          ['$user.companyId$']: Utils.uuid(filter.companyId),
        };
      }

      if (filter.userName) {
        const nameFilter = {
          [Op.or]: [
            Utils.ilike('user', 'firstName', filter.userName),
            Utils.ilike('user', 'lastName', filter.userName)
          ]
        };

      
        where[Op.and] = [
          ...(where[Op.and] || [where]),
          nameFilter
        ];
      }

      //CUSTOM FIND DATE RANGES OVERLAP - https://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
      if (filter.start && filter.end) {
        where = {
          ...where,
          [Op.and]: [
            ...where[Op.and],
            {
              startRange: {
                //...where.startRecur,
                [Op.lt]: moment.parseZone(filter.end).format('YYYY-MM-DD'),
              },
              endRange: {
                //...where.startRecur,
                [Op.gt]: moment.parseZone(filter.start).format('YYYY-MM-DD'),
              },
            },
          ],
        };
      }

      if (filter.startTimeRange) {
        const [start, end] = filter.startTimeRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            startTime: {
              ...where.startTime,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            startTime: {
              ...where.startTime,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.endTimeRange) {
        const [start, end] = filter.endTimeRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            endTime: {
              ...where.endTime,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            endTime: {
              ...where.endTime,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.resource) {
        var listItems = filter.resource.split('|').map((item) => {
          return item;
        });

        where = {
          ...where,
          '$user.roles.name$': { [Op.or]: listItems },
        };
      }

      if (filter.startRangeRange) {
        const [start, end] = filter.startRangeRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            startRange: {
              ...where.startRange,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            startRange: {
              ...where.startRange,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.endRangeRange) {
        const [start, end] = filter.endRangeRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            endRange: {
              ...where.endRange,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            endRange: {
              ...where.endRange,
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
      if (filter.users) {
        where = {
          ...where,
          '$availabilities.userId$': { [Op.or]: filter.users },
        };
      }
      if (filter.available === true ||
        filter.available === 'true' ||
        filter.available === false ||
        filter.available === 'false') {
        where = {
          ...where,
          available: JSON.parse(filter.available),
        };
      }

      if (filter.oncall) {
        where = {
          ...where,
          oncall: filter.oncall,
        };
      }

      if (filter.timeoff) {
        where = {
          ...where,
          timeoff: filter.timeoff,
        };
      }

      if (filter.disabled) {
        where = {
          ...where,
          disabled: filter.disabled,
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

      // if (filter.userIds && filter.userIds.length > 0) {
      //   where = {
      //     ...where,
      //     '$user.id$': { [Op.or]: filter.userIds.split('|') },
      //   };
      // }
      // if (filter.branches) {
      //   where = {
      //     ...where,
      //     '$user->branches.id$': {
      //       [Op.or]: filter.branches.split('|').map((item) => {
      //         return Utils.uuid(item);
      //       }),
      //     },
      //   };
      // }

      if (filter.location) {
        var listItems = filter.location.split('|').map((item) => {
          return Utils.uuid(item);
        });
      }

      if (filter.userResource) {
        if (where[Op.and]) {
          where = {
            ...where,
            [Op.and]: [
              ...where[Op.and],
              Utils.eq('user', 'resourceId', filter.userResource),
            ],
          };
        } else {
          where = {
            ...where,
            [Op.and]: [Utils.eq('user', 'resourceId', filter.userResource)],
          };
        }
      }

      if (filter.userResource_not) {
        var listItems = filter.userResource_not.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          [Op.and]: Utils.notIn('user', 'resourceId', listItems),
        };
      }

      if (filter.location) {
        var listItems = filter.location.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          locationId: { [Op.or]: listItems },
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
    where = {
      ...where,
      '$user.disabled$': 0,
    };

    // let { rows, count } = await db.availabilities.findAndCountAll({
    //   where,
    //   include,
    //   limit: limit ? Number(limit) : undefined,
    //   offset: offset ? Number(offset) : undefined,
    //   order:
    //     filter.field && filter.sort
    //       ? [[filter.field, filter.sort]]
    //       : [['createdAt', 'desc']],
    //   transaction,
    // });

    let availabilityIds = [];
    let numberOfAvailabilities = 0;
    if (filter.bol) {
      let queryOptions = {
        where,
        include: [
          {
            attributes: [],
            model: db.users,
            as: 'createdBy',
          },
          {
            attributes: [],
            model: db.users,
            as: 'user',
            include: [
              {
                attributes: [],
                model: db.roles,
                as: 'roles',
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
        ],
        attributes: ['id', 'onCall'],
        group: ['id'],
        transaction,
      };

      if (limitOffset.lim >= 0 && limitOffset.off >= 0) {
        queryOptions.limit = limitOffset.lim;
        queryOptions.offset = limitOffset.off;
        queryOptions.subQuery = false;
      }
      //queryOptions.logging = console.log;

      const results = await db.availabilities.findAndCountAll(queryOptions);
      availabilityIds = results.rows;
      numberOfAvailabilities = results.count.length;
    }
    const availabilitiesIdsParsed = availabilityIds;
    const availabilityIdArray = availabilitiesIdsParsed.map(
      (availability) => availability.id,
    );
    let rows = [];

    let order = [['updatedAt', 'desc']];
    if (filter.field && filter.sort) {
      if (filter.field === 'location2') {
        order = [['location2', 'firstName', filter.sort]];
      } else {
        order = [[filter.field, filter.sort]];
      }
    }

    if (!filter.bol || availabilityIdArray.length > 0) {
      rows = await db.availabilities.findAll({
        where: !filter.bol
          ? where
          : {
              id: { [Op.or]: [availabilityIdArray] },
            },
        include,
        //order,
        transaction,
        //logging: console.log,
        //benchmark: true,
      });
    }

    if (!filter.bol) {
      numberOfAvailabilities = rows.length;
    }

    return { rows: rows, count: numberOfAvailabilities };
  }

  static async getOncallAvailabilities(filter, options) {
    //const query = `SELECT * FROM distancematrix WHERE (user1Id = '${filter.user1Id}' AND user2Id = '${filter.user2Id}') OR (user1Id = '${filter.user1Id}' AND user2Id = '${filter.user2Id}')`;
    let availabilities = [];
    const users = filter.users.split('|');
    if (users.length > 0 && filter.startRange) {
      const query = `SELECT id FROM availabilities WHERE startRange= '${
        filter.startRange
      }' AND oncall = 1 AND userId IN ("${users.join(
        '", "',
      )}") AND deletedAt is null`;
      console.log('milly', query);
      availabilities = await db.sequelize.query(query, {
        type: db.sequelize.QueryTypes.SELECT,
        raw: true,
      });
    }
    console.log('lilly', availabilities);
    return availabilities;
  }

  static async findAllAutocomplete(query, limit, filter) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike('availabilities', 'user', query),
        ],
      };
    }

    if (filter.type) {
      var listItems = filter.type.split('|').map((item) => {
        return item;
      });
      where = {
        ...where,
        '$parent.name$': { [Op.or]: listItems },
      };
    }

    const records = await db.availabilities.findAll({
      attributes: ['id', 'user'],
      where,
      //branches:branches,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['user', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.user,
    }));
  }

  static async findAllAvailabilitiesOfDay(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    let where = {};

    let user_include = [];

    // filter through end-start dates
    const StartingPoint = Sequelize.literal(
      "CONCAT(startRange, ' ', TIME(startTime))",
    );
    const EndingPoint = Sequelize.literal(
      "CONCAT(endRange, ' ', TIME(endTime))",
    );

    where = {
      [Op.and]: {
        [Op.and]: [
          Sequelize.where(StartingPoint, '<', filter.end),
          Sequelize.where(EndingPoint, '>', filter.start),
        ],
        '$user.disabled$': 0,
        '$user.companyId$': filter.companyId,
        available: 1,
        disabled: 0,
        status: 'Approved',
      },
    };

    if (filter.branches.length > 0) {
      where = {
        ...where,
        '$user.branches.id$': { [Op.or]: filter.branches },
      };

      user_include.push({
        attributes: [],
        model: db.branches,
        as: 'branches',
        through: { attributes: [] },
      });
    }

    if (filter.users.length > 0) {
      where = {
        ...where,
        '$user.id$': { [Op.or]: filter.users },
      };
    }

    if (filter.roles.length > 0) {
      where = {
        ...where,
        '$user.roles.name$': { [Op.or]: filter.roles },
      };

      user_include.push({
        attributes: [],
        model: db.roles,
        as: 'roles',
        through: { attributes: [] },
      });
    }

    if (filter.subgroups.length > 0) {
      where = {
        ...where,
        '$user.subgroups.id$': { [Op.or]: filter.subgroups },
      };

      user_include.push({
        attributes: [],
        model: db.subgroups,
        as: 'subgroups',
        through: { attributes: [] },
      });
    }

    let include = [
      {
        attributes: ['id', 'firstName', 'lastName'],
        model: db.users,
        as: 'user',
        include: user_include,
      },
    ];

    let query = {
      attributes: [
        'id', 
        'startTime', 
        'endTime', 
        'startRange', 
        'endRange', 
        'frequency',
        'interval',
        'bysetpos',
        'U',
        'M',
        'T',
        'W',
        'R',
        'F',
        'S',
      ],
      where: where,
      include: include,
      transaction,
      benchmark: true,
    };

    const avs = await db.availabilities.findAll(query);
    let parsedAvailabilities = JSON.parse(JSON.stringify(avs));

    return { rows: parsedAvailabilities, count: parsedAvailabilities.length };
  }

  static async findAllAvailabilitiesOfDateRange(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    let where = {};

    let user_include = [];

    // filter through end-start dates
    const StartingPoint = Sequelize.literal(
      "CONCAT(startRange, ' ', TIME(startTime))",
    );
    const EndingPoint = Sequelize.literal(
      "CONCAT(endRange, ' ', TIME(endTime))",
    );

    where = {
      [Op.and]: {
        [Op.and]: [
          // Sequelize.where('startRange', '<', filter.end),
          // Sequelize.where('endRange', '>', filter.start),
          where_function(col('availabilities.startRange'), {
            [Op.lt]: filter.end,
          }),
          where_function(col('availabilities.endRange'), {
            [Op.gt]: filter.start,
          }),
        ],
        '$user.disabled$': 0,
        '$user.companyId$': filter.companyId,
        disabled: 0,
        status: { [Op.or]: ['Approved', null] },
      },
    };

    if (!filter.all) {
      where = {
        ...where,
        available: 1,
      };
    }

    if (filter.branches.length > 0) {
      where = {
        ...where,
        '$user.branches.id$': { [Op.or]: filter.branches },
      };

      user_include.push({
        attributes: [],
        model: db.branches,
        as: 'branches',
        through: { attributes: [] },
      });
    }

    if (filter.users.length > 0) {
      where = {
        ...where,
        '$user.id$': { [Op.or]: filter.users },
      };
    }

    if (filter.roles.length > 0) {
      where = {
        ...where,
        '$user.roles.name$': { [Op.or]: filter.roles },
      };

      user_include.push({
        attributes: [],
        model: db.roles,
        as: 'roles',
        through: { attributes: [] },
      });
    }

    if (filter.subgroups.length > 0) {
      where = {
        ...where,
        '$user.subgroups.id$': { [Op.or]: filter.subgroups },
      };

      user_include.push({
        attributes: [],
        model: db.subgroups,
        as: 'subgroups',
        through: { attributes: [] },
      });
    }

    let include = [
      {
        attributes: ['id', 'firstName', 'lastName'],
        model: db.users,
        as: 'user',
        include: user_include,
      },
    ];

    let query = {
      attributes: [
        'id',
        'startTime',
        'endTime',
        'startRange',
        'endRange',
        'available',
        'frequency',
        'interval',
        'bysetpos',
        'U',
        'M',
        'T',
        'W',
        'R',
        'F',
        'S',
      ],
      where: where,
      include: include,
      transaction,
      benchmark: true,
    };

    const avs = await db.availabilities.findAll(query);
    let parsedAvailabilities = JSON.parse(JSON.stringify(avs));

    return { rows: parsedAvailabilities, count: parsedAvailabilities.length };
  }

  static async findAllAvailabilitiesOfWeek(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    let where = {};

    let user_include = [];

    // filter through end-start dates
    const StartingPoint = Sequelize.literal(
      "CONCAT(startRange, ' ', TIME(startTime))",
    );
    const EndingPoint = Sequelize.literal(
      "CONCAT(endRange, ' ', TIME(endTime))",
    );

    where = {
      [Op.and]: {
        [Op.and]: [
          Sequelize.where(StartingPoint, '<', filter.end),
          Sequelize.where(EndingPoint, '>', filter.start),
        ],
        '$user.disabled$': 0,
        '$user.companyId$': filter.companyId,
        disabled: 0,
        status: 'Approved',
      },
    };

    if (!filter.all) {
      where = {
        ...where,
        available: 1,
      };
    }

    if (filter.branches.length > 0) {
      where = {
        ...where,
        '$user.branches.id$': { [Op.or]: filter.branches },
      };

      user_include.push({
        attributes: [],
        model: db.branches,
        as: 'branches',
        through: { attributes: [] },
      });
    }

    if (filter.users.length > 0) {
      where = {
        ...where,
        '$user.id$': { [Op.or]: filter.users },
      };
    }

    if (filter.roles.length > 0) {
      where = {
        ...where,
        '$user.roles.name$': { [Op.or]: filter.roles },
      };

      user_include.push({
        attributes: [],
        model: db.roles,
        as: 'roles',
        through: { attributes: [] },
      });
    }

    if (filter.subgroups.length > 0) {
      where = {
        ...where,
        '$user.subgroups.id$': { [Op.or]: filter.subgroups },
      };

      user_include.push({
        attributes: [],
        model: db.subgroups,
        as: 'subgroups',
        through: { attributes: [] },
      });
    }

    let include = [
      {
        attributes: ['id', 'firstName', 'lastName'],
        model: db.users,
        as: 'user',
        include: user_include,
      },
    ];

    let query = {
      attributes: [
        'id',
        'startTime',
        'endTime',
        'startRange',
        'endRange',
        'available',
        'frequency',
        'interval',
        'bysetpos',
        'U',
        'M',
        'T',
        'W',
        'R',
        'F',
        'S',
      ],
      where: where,
      include: include,
      transaction,
      benchmark: true,
    };

    const avs = await db.availabilities.findAll(query);
    let parsedAvailabilities = JSON.parse(JSON.stringify(avs));

    return { rows: parsedAvailabilities, count: parsedAvailabilities.length };
  }
};
