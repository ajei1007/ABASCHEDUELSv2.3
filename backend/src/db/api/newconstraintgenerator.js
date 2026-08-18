const db = require('../models');
const FileDBApi = require('./file');
const crypto = require('crypto');
const Utils = require('../utils');
const UsergroupsDBApi = require('./usergroups');
const RolegroupsDBApi = require('./rolegroups');
const SubgroupgroupsDBApi = require('./subgroupgroups');
const BranchgroupsDBApi = require('./branchgroups');
const BranchesDBApi = require('./branches');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class NewconstraintgeneratorDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const newconstraintgenerator = await db.newconstraintgenerator.create(
      {
        id: data.id || undefined,
        constraintType: data.constraintType || null,
        description: data.description || null,
        antecedentType: data.antecedentType || null,
        consequenceType: data.consequenceType || null,
        antecedentTypeDaySelection: data.antecedentTypeDaySelection || null,
        consequenceTypeDaySelection: data.consequenceTypeDaySelection || null,
        min: data.min ?? null,
        max: data.max ?? null,
        frequency: data.frequency || null,
        units: data.units || null,
        alias: data.alias || null,
        consequenceTypeEachOrAll: data.consequenceTypeEachOrAll || null,
        antecedentTypeEachOrAll: data.antecedentTypeEachOrAll || null,
        start: data.start || null,
        end: data.end || null,
        disabled: data.disabled || false,
        rollover: data.rollover || false,
        fromHome: data.fromHome || false,
        groupingId: data.grouping || null,
        noLimit: data.noLimit || false,
        soft: data.soft || false,
        all: data.all || false,
        weight: data.weight || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
        antecedentUserId: data.antecedentTypeUser ?? null,
        antecedentRoleId: data.antecedentTypeRole ?? null,
        antecedentSubgroupId: data.antecedentTypeSubgroup ?? null,
        antecedentLocationId: data.antecedentTypeLocation ?? null,
        consequenceUserId: data.consequenceTypeUser ?? null,
        consequenceRoleId: data.consequenceTypeRole ?? null,
        consequenceSubgroupId: data.consequenceTypeSubgroup ?? null,
        consequenceLocationId: data.consequenceTypeLocation ?? null,
        antecedentTypeActivityId: data.antecedentTypeActivity ?? null,
        consequenceTypeActivityId: data.consequenceTypeActivity ?? null,
        offset: data.offset || 0,
      },
      { transaction },
    );

    // await newconstraintgenerator.setAntecedentTypeUsers(
    //   data.antecedentTypeUsers || [],
    //   {
    //     transaction,
    //   },
    // );

    // await newconstraintgenerator.setConsequenceTypeUsers(
    //   data.consequenceTypeUsers || [],
    //   {
    //     transaction,
    //   },
    // );

    // await newconstraintgenerator.setAntecedentTypeRoles(
    //   data.antecedentTypeRoles || [],
    //   {
    //     transaction,
    //   },
    // );

    // await newconstraintgenerator.setConsequenceTypeRoles(
    //   data.consequenceTypeRoles || [],
    //   {
    //     transaction,
    //   },
    // );

    // await newconstraintgenerator.setAntecedentTypeSubgroups(
    //   data.antecedentTypeSubgroups || [],
    //   {
    //     transaction,
    //   },
    // );

    // await newconstraintgenerator.setConsequenceTypeSubgroups(
    //   data.consequenceTypeSubgroups || [],
    //   {
    //     transaction,
    //   },
    // );

    // await newconstraintgenerator.setAntecedentTypeBranches(
    //   data.antecedentTypeBranches || [],
    //   {
    //     transaction,
    //   },
    // );

    // await newconstraintgenerator.setConsequenceTypeBranches(
    //   data.consequenceTypeBranches || [],
    //   {
    //     transaction,
    //   },
    // );

    await newconstraintgenerator.setBranches(data.branches || [], {
      transaction,
    });

    return newconstraintgenerator;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const newconstraintgenerator = await db.newconstraintgenerator.findByPk(
      id,
      {
        transaction,
      },
    );

    await newconstraintgenerator.update(
      {
        constraintType: data.constraintType || null,
        description: data.description || null,
        antecedentType: data.antecedentType || null,
        consequenceType: data.consequenceType || null,
        antecedentTypeDaySelection: data.antecedentTypeDaySelection || null,
        consequenceTypeDaySelection: data.consequenceTypeDaySelection || null,
        min: data.min ?? null,
        max: data.max ?? null,
        frequency: data.frequency || null,
        units: data.units || null,
        alias: data.alias || null,
        consequenceTypeEachOrAll: data.consequenceTypeEachOrAll || null,
        antecedentTypeEachOrAll: data.antecedentTypeEachOrAll || null,
        start: data.start || null,
        end: data.end || null,
        disabled: data.disabled || false,
        rollover: data.rollover || false,
        fromHome: data.fromHome || false,
        groupingId: data.grouping || null,
        noLimit: data.noLimit || false,
        soft: data.soft || false,
        all: data.all || false,
        weight: data.weight || null,
        updatedById: currentUser.id,
        antecedentUserId: data.antecedentTypeUser ?? null,
        antecedentRoleId: data.antecedentTypeRole ?? null,
        antecedentSubgroupId: data.antecedentTypeSubgroup ?? null,
        antecedentLocationId: data.antecedentTypeLocation ?? null,
        consequenceUserId: data.consequenceTypeUser ?? null,
        consequenceRoleId: data.consequenceTypeRole ?? null,
        consequenceSubgroupId: data.consequenceTypeSubgroup ?? null,
        consequenceLocationId: data.consequenceTypeLocation ?? null,
        antecedentTypeActivityId: data.antecedentTypeActivity ?? null,
        consequenceTypeActivityId: data.consequenceTypeActivity ?? null,
        offset: data.offset || 0,
      },
      { transaction },
    );

    // await newconstraintgenerator.setAntecedentTypeUsers(
    //   data.antecedentTypeUsers || [],
    //   {
    //     transaction,
    //   },
    // );

    // await newconstraintgenerator.setConsequenceTypeUsers(
    //   data.consequenceTypeUsers || [],
    //   {
    //     transaction,
    //   },
    // );

    // await newconstraintgenerator.setAntecedentTypeRoles(
    //   data.antecedentTypeRoles || [],
    //   {
    //     transaction,
    //   },
    // );

    // await newconstraintgenerator.setConsequenceTypeRoles(
    //   data.consequenceTypeRoles || [],
    //   {
    //     transaction,
    //   },
    // );

    // await newconstraintgenerator.setAntecedentTypeSubgroups(
    //   data.antecedentTypeSubgroups || [],
    //   {
    //     transaction,
    //   },
    // );

    // await newconstraintgenerator.setConsequenceTypeSubgroups(
    //   data.consequenceTypeSubgroups || [],
    //   {
    //     transaction,
    //   },
    // );

    // await newconstraintgenerator.setAntecedentTypeBranches(
    //   data.antecedentTypeBranches || [],
    //   {
    //     transaction,
    //   },
    // );

    // await newconstraintgenerator.setConsequenceTypeBranches(
    //   data.consequenceTypeBranches || [],
    //   {
    //     transaction,
    //   },
    // );

    await newconstraintgenerator.setBranches(data.branches || [], {
      transaction,
    });

    return newconstraintgenerator;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const newconstraintgenerator = await db.newconstraintgenerator.findByPk(
      id,
      options,
    );

    await newconstraintgenerator.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await newconstraintgenerator.destroy({
      transaction,
    });

    return newconstraintgenerator;
  }
  static async updateSoft(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const newconstraintgenerator = await db.newconstraintgenerator.findByPk(
      id,
      {
        transaction,
      },
    );

    await newconstraintgenerator.update(
      {
        soft: data.soft || false,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    return newconstraintgenerator;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const newconstraintgenerator = await db.newconstraintgenerator.findOne(
      { where },
      { transaction },
    );

    if (!newconstraintgenerator) {
      return newconstraintgenerator;
    }

    const output = newconstraintgenerator.get({ plain: true });

    output.antecedentTypeUsers =
      await newconstraintgenerator.getAntecedentTypeUsers({
        transaction,
      });

    output.consequenceTypeUsers =
      await newconstraintgenerator.getConsequenceTypeUsers({
        transaction,
      });

    output.antecedentTypeRoles =
      await newconstraintgenerator.getAntecedentTypeRoles({
        transaction,
      });

    output.consequenceTypeRoles =
      await newconstraintgenerator.getConsequenceTypeRoles({
        transaction,
      });

    output.antecedentTypeSubgroups =
      await newconstraintgenerator.getAntecedentTypeSubgroups({
        transaction,
      });

    output.consequenceTypeSubgroups =
      await newconstraintgenerator.getConsequenceTypeSubgroups({
        transaction,
      });

    output.grouping = await newconstraintgenerator.getGrouping({
      transaction,
    });

    output.antecedentTypeBranches =
      await newconstraintgenerator.getAntecedentTypeBranches({
        transaction,
      });

    output.consequenceTypeBranches =
      await newconstraintgenerator.getConsequenceTypeBranches({
        transaction,
      });

    output.branches = await newconstraintgenerator.getBranches({
      transaction,
    });

    return output;
  }

  static async findByDetailed(where, options) {
    const transaction = (options && options.transaction) || undefined;

    let include = [
      {
        model: db.groupings,
        as: 'grouping',
      },

      {
        model: db.branches,
        as: 'branches',
      },
      {
        model: db.users,
        as: 'antecedentUser',
        attributes: ['id', 'firstName', 'lastName'],
      },
      {
        model: db.roles,
        as: 'antecedentRole',
        attributes: ['id', 'name'],
      },
      {
        model: db.users,
        as: 'antecedentLocation',
        attributes: ['id', 'firstName', 'lastName'],
      },

      {
        model: db.subgroups,
        as: 'antecedentSubgroup',
        attributes: ['id', 'name'],
      },

      {
        model: db.users,
        as: 'consequenceUser',
        attributes: ['id', 'firstName', 'lastName'],
      },
      {
        model: db.roles,
        as: 'consequenceRole',
        attributes: ['id', 'name'],
      },

      {
        model: db.users,
        as: 'consequenceLocation',
        attributes: ['id', 'firstName', 'lastName'],
      },

      {
        model: db.subgroups,
        as: 'consequenceSubgroup',
        attributes: ['id', 'name'],
      },
    ];

    const newconstraintgenerator = await db.newconstraintgenerator.findOne(
      {
        where,
        include,
      },
      { transaction },
    );

    newconstraintgenerator['dataValues']['antecedentTypeRoles'] = new Array();
    newconstraintgenerator['dataValues']['antecedentTypeUsers'] = new Array();
    newconstraintgenerator['dataValues']['antecedentTypeSubgroups'] =
      new Array();
    newconstraintgenerator['dataValues']['antecedentTypeBranches'] =
      new Array();
    newconstraintgenerator['dataValues']['antecedentTypeLocations'] =
      new Array();

    newconstraintgenerator['dataValues']['consequenceTypeRoles'] = new Array();
    newconstraintgenerator['dataValues']['consequenceTypeUsers'] = new Array();
    newconstraintgenerator['dataValues']['consequenceTypeSubgroups'] =
      new Array();
    newconstraintgenerator['dataValues']['consequenceTypeBranches'] =
      new Array();
    newconstraintgenerator['dataValues']['consequenceTypeLocations'] =
      new Array();

    newconstraintgenerator['dataValues']['minSeconds'] =
      newconstraintgenerator['dataValues']['min'];
    newconstraintgenerator['dataValues']['maxSeconds'] =
      newconstraintgenerator['dataValues']['max'];

    if (
      newconstraintgenerator['dataValues']['constraintType'] === 'time' ||
      newconstraintgenerator['dataValues']['constraintType'] === 'gaps' ||
      newconstraintgenerator['dataValues']['constraintType'] ===
        'sessionlength' ||
      newconstraintgenerator['dataValues']['constraintType'] ===
        'authorization' ||
      newconstraintgenerator['dataValues']['constraintType'] === 'drive'
    ) {
      if (newconstraintgenerator['dataValues']['units'] === 'unit') {
        newconstraintgenerator['dataValues']['min'] = Number(
          (newconstraintgenerator['dataValues']['min'] / (15 * 60)).toFixed(2),
        );
        newconstraintgenerator['dataValues']['max'] = Number(
          (newconstraintgenerator['dataValues']['max'] / (15 * 60)).toFixed(2),
        );
        newconstraintgenerator['dataValues']['offset'] = Number(
          (newconstraintgenerator['dataValues']['offset'] / (15 * 60)).toFixed(2),
        );
      }

      if (newconstraintgenerator['dataValues']['units'] === 'minutes') {
        newconstraintgenerator['dataValues']['min'] = Number(
          (newconstraintgenerator['dataValues']['min'] / 60).toFixed(2),
        );
        newconstraintgenerator['dataValues']['max'] = Number(
          (newconstraintgenerator['dataValues']['max'] / 60).toFixed(2),
        );
        newconstraintgenerator['dataValues']['offset'] = Number(
          (newconstraintgenerator['dataValues']['offset'] / 60).toFixed(2),
        );
      }

      if (newconstraintgenerator['dataValues']['units'] === 'hours') {
        newconstraintgenerator['dataValues']['min'] = Number(
          (newconstraintgenerator['dataValues']['min'] / (60 * 60)).toFixed(2),
        );
        newconstraintgenerator['dataValues']['max'] = Number(
          (newconstraintgenerator['dataValues']['max'] / (60 * 60)).toFixed(2),
        );
        newconstraintgenerator['dataValues']['offset'] = Number(
          (newconstraintgenerator['dataValues']['offset'] / (60 * 60)).toFixed(2),
        );
      }
    }

    if (
      newconstraintgenerator['dataValues']['constraintType'] === 'breakQuantity'
    ) {
      if (newconstraintgenerator['dataValues']['units'] === 'unit') {
        newconstraintgenerator['dataValues']['max'] = Number(
          (newconstraintgenerator['dataValues']['max'] / (15 * 60)).toFixed(2),
        );
      }

      if (newconstraintgenerator['dataValues']['units'] === 'minutes') {
        newconstraintgenerator['dataValues']['max'] = Number(
          (newconstraintgenerator['dataValues']['max'] / 60).toFixed(2),
        );
      }

      if (newconstraintgenerator['dataValues']['units'] === 'hours') {
        newconstraintgenerator['dataValues']['max'] = Number(
          (newconstraintgenerator['dataValues']['max'] / (60 * 60)).toFixed(2),
        );
      }
    }

    if (newconstraintgenerator['dataValues']['constraintType'] === 'distance') {
      if (newconstraintgenerator['dataValues']['units'] === 'miles') {
        newconstraintgenerator['dataValues']['min'] = Number(
          (newconstraintgenerator['dataValues']['min'] / 1610).toFixed(2),
        );
        newconstraintgenerator['dataValues']['max'] = Number(
          (newconstraintgenerator['dataValues']['max'] / 1610).toFixed(2),
        );
      }

      if (newconstraintgenerator['dataValues']['units'] === 'kilometers') {
        newconstraintgenerator['dataValues']['min'] = Number(
          (newconstraintgenerator['dataValues']['min'] / 1000).toFixed(2),
        );
        newconstraintgenerator['dataValues']['max'] = Number(
          (newconstraintgenerator['dataValues']['max'] / 1000).toFixed(2),
        );
      }
    }

    //antecedentType
    if (newconstraintgenerator['dataValues']['antecedentUser']) {
      newconstraintgenerator['dataValues']['antecedentTypeUsers'].push({
        id: '',
        users: [newconstraintgenerator['dataValues']['antecedentUser']],
      });
    }

    if (newconstraintgenerator['dataValues']['antecedentRole']) {
      newconstraintgenerator['dataValues']['antecedentTypeRoles'].push({
        id: '',
        roles: [newconstraintgenerator['dataValues']['antecedentRole']],
      });
    }

    if (newconstraintgenerator['dataValues']['antecedentSubgroup']) {
      newconstraintgenerator['dataValues']['antecedentTypeSubgroups'].push({
        id: '',
        subgroups: [newconstraintgenerator['dataValues']['antecedentSubgroup']],
      });
    }

    if (newconstraintgenerator['dataValues']['antecedentLocation']) {
      newconstraintgenerator['dataValues']['antecedentTypeLocations'].push({
        id: '',
        locations: [newconstraintgenerator['dataValues']['antecedentLocation']],
      });
    }

    //consequenceType
    if (newconstraintgenerator['dataValues']['consequenceUser']) {
      newconstraintgenerator['dataValues']['consequenceTypeUsers'].push({
        id: '',
        users: [newconstraintgenerator['dataValues']['consequenceUser']],
      });
    }

    if (newconstraintgenerator['dataValues']['consequenceRole']) {
      newconstraintgenerator['dataValues']['consequenceTypeRoles'].push({
        id: '',
        roles: [newconstraintgenerator['dataValues']['consequenceRole']],
      });
    }

    if (newconstraintgenerator['dataValues']['consequenceSubgroup']) {
      newconstraintgenerator['dataValues']['consequenceTypeSubgroups'].push({
        id: '',
        subgroups: [
          newconstraintgenerator['dataValues']['consequenceSubgroup'],
        ],
      });
    }

    if (newconstraintgenerator['dataValues']['consequenceLocation']) {
      newconstraintgenerator['dataValues']['consequenceTypeLocations'].push({
        id: '',
        locations: [
          newconstraintgenerator['dataValues']['consequenceLocation'],
        ],
      });
    }

    return newconstraintgenerator;
  }

  static async findUserOnlyProfileConstraints(filter, options) {
    const transaction = (options && options.transaction) || undefined;

    let include = [
      {
        model: db.groupings,
        as: 'grouping',
      },

      {
        model: db.branches,
        as: 'branches',
      },
      {
        model: db.users,
        as: 'antecedentUser',
        attributes: ['id', 'firstName', 'lastName'],
      },
      {
        model: db.roles,
        as: 'antecedentRole',
        attributes: ['id', 'name'],
      },
      {
        model: db.users,
        as: 'antecedentLocation',
        attributes: ['id', 'firstName', 'lastName'],
      },

      {
        model: db.subgroups,
        as: 'antecedentSubgroup',
        attributes: ['id', 'name'],
      },

      {
        model: db.users,
        as: 'consequenceUser',
        attributes: ['id', 'firstName', 'lastName'],
      },
      {
        model: db.roles,
        as: 'consequenceRole',
        attributes: ['id', 'name'],
      },

      {
        model: db.users,
        as: 'consequenceLocation',
        attributes: ['id', 'firstName', 'lastName'],
      },

      {
        model: db.subgroups,
        as: 'consequenceSubgroup',
        attributes: ['id', 'name'],
      },
    ];

    const rows = await db.newconstraintgenerator.findAll({
      where: {
        '$antecedentUser.id$': filter.userId,
        constraintType: ['unmatching', 'priority', 'authorization'],
      },
      include,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
      benchmark: true,
    });

    rows.forEach((row, index) => {
      rows[index]['dataValues']['antecedentTypeRoles'] = new Array();
      rows[index]['dataValues']['antecedentTypeUsers'] = new Array();
      rows[index]['dataValues']['antecedentTypeSubgroups'] = new Array();
      rows[index]['dataValues']['antecedentTypeBranches'] = new Array();
      rows[index]['dataValues']['antecedentTypeLocations'] = new Array();

      rows[index]['dataValues']['consequenceTypeRoles'] = new Array();
      rows[index]['dataValues']['consequenceTypeUsers'] = new Array();
      rows[index]['dataValues']['consequenceTypeSubgroups'] = new Array();
      rows[index]['dataValues']['consequenceTypeBranches'] = new Array();
      rows[index]['dataValues']['consequenceTypeLocations'] = new Array();

      if (
        rows[index]['dataValues']['constraintType'] === 'time' ||
        rows[index]['dataValues']['constraintType'] === 'gaps' ||
        rows[index]['dataValues']['constraintType'] === 'authorization' ||
        rows[index]['dataValues']['constraintType'] === 'sessionlength'
      ) {
        if (rows[index]['dataValues']['units'] === 'unit') {
          rows[index]['dataValues']['min'] = Number(
            (rows[index]['dataValues']['min'] / (15 * 60)).toFixed(2),
          );
          rows[index]['dataValues']['max'] = Number(
            (rows[index]['dataValues']['max'] / (15 * 60)).toFixed(2),
          );
          rows[index]['dataValues']['offset'] = Number(
            (rows[index]['dataValues']['offset'] / (15 * 60)).toFixed(2),
          )
        }

        if (rows[index]['dataValues']['units'] === 'minutes') {
          rows[index]['dataValues']['min'] = Number(
            (rows[index]['dataValues']['min'] / 60).toFixed(2),
          );
          rows[index]['dataValues']['max'] = Number(
            (rows[index]['dataValues']['max'] / 60).toFixed(2),
          );
          rows[index]['dataValues']['offset'] = Number(
            (rows[index]['dataValues']['offset'] / 60).toFixed(2),
          )
        }

        if (rows[index]['dataValues']['units'] === 'hours') {
          rows[index]['dataValues']['min'] = Number(
            (rows[index]['dataValues']['min'] / (60 * 60)).toFixed(2),
          );
          rows[index]['dataValues']['max'] = Number(
            (rows[index]['dataValues']['max'] / (60 * 60)).toFixed(2),
          );
          rows[index]['dataValues']['offset'] = Number(
            (rows[index]['dataValues']['offset'] / (60 * 60)).toFixed(2),
          )
        }
      }

      if (rows[index]['dataValues']['constraintType'] === 'breakQuantity') {
        if (rows[index]['dataValues']['units'] === 'unit') {
          rows[index]['dataValues']['max'] = Number(
            (rows[index]['dataValues']['max'] / (15 * 60)).toFixed(2),
          );
        }

        if (rows[index]['dataValues']['units'] === 'minutes') {
          rows[index]['dataValues']['max'] = Number(
            (rows[index]['dataValues']['max'] / 60).toFixed(2),
          );
        }

        if (rows[index]['dataValues']['units'] === 'hours') {
          rows[index]['dataValues']['max'] = Number(
            (rows[index]['dataValues']['max'] / (60 * 60)).toFixed(2),
          );
        }
      }

      //antecedentType
      if (rows[index]['dataValues']['antecedentUser']) {
        rows[index]['dataValues']['antecedentTypeUsers'].push({
          id: '',
          users: [rows[index]['dataValues']['antecedentUser']],
        });
      }

      if (rows[index]['dataValues']['antecedentRole']) {
        rows[index]['dataValues']['antecedentTypeRoles'].push({
          id: '',
          roles: [rows[index]['dataValues']['antecedentRole']],
        });
      }

      if (rows[index]['dataValues']['antecedentSubgroup']) {
        rows[index]['dataValues']['antecedentTypeSubgroups'].push({
          id: '',
          subgroups: [rows[index]['dataValues']['antecedentSubgroup']],
        });
      }

      if (rows[index]['dataValues']['antecedentLocation']) {
        rows[index]['dataValues']['antecedentTypeLocations'].push({
          id: '',
          locations: [rows[index]['dataValues']['antecedentLocation']],
        });
      }

      //consequenceType
      if (rows[index]['dataValues']['consequenceUser']) {
        rows[index]['dataValues']['consequenceTypeUsers'].push({
          id: '',
          users: [rows[index]['dataValues']['consequenceUser']],
        });
      }

      if (rows[index]['dataValues']['consequenceRole']) {
        rows[index]['dataValues']['consequenceTypeRoles'].push({
          id: '',
          roles: [rows[index]['dataValues']['consequenceRole']],
        });
      }

      if (rows[index]['dataValues']['consequenceSubgroup']) {
        rows[index]['dataValues']['consequenceTypeSubgroups'].push({
          id: '',
          subgroups: [rows[index]['dataValues']['consequenceSubgroup']],
        });
      }

      if (rows[index]['dataValues']['consequenceLocation']) {
        rows[index]['dataValues']['consequenceTypeLocations'].push({
          id: '',
          locations: [rows[index]['dataValues']['consequenceLocation']],
        });
      }
    });

    return rows;
  }

  static async findAll(filter, options) {
    let limitOffset = Utils.getLimitOffset(filter.limit, filter.page);

    if (filter.branches) {
      filter.branches = await BranchesDBApi.getDescendentAndAncestorBranches({
        branchIds: filter.branches,
      });
    }

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        attributes: ['id', 'firstName'],
        model: db.users,
        as: 'createdBy',
        paranoid: false,
      },
      {
        attributes: ['id', 'name'],
        model: db.groupings,
        as: 'grouping',
      },
      {
        attributes: ['id'],
        model: db.branches,
        as: 'branches',
        through: { attributes: [] },
      },
      // {
      //   model: db.users,
      //   as: 'antecedentUser',
      //   attributes: ['id', 'firstName', 'lastName'],
      //   include: [
      //     {
      //       model: db.branches,
      //       as: 'branches',
      //     },
      //   ],
      // },
      {
        model: db.roles,
        as: 'antecedentRole',
        attributes: ['id', 'name'],
      },

      // {
      //   model: db.users,
      //   as: 'antecedentLocation',
      //   attributes: ['id', 'firstName', 'lastName'],
      // },

      {
        model: db.subgroups,
        as: 'antecedentSubgroup',
        attributes: ['id', 'name'],
      },

      // {
      //   model: db.users,
      //   as: 'consequenceUser',
      //   attributes: ['id', 'firstName', 'lastName'],
      // },
      {
        model: db.roles,
        as: 'consequenceRole',
        attributes: ['id', 'name'],
      },

      // {
      //   model: db.users,
      //   as: 'consequenceLocation',
      //   attributes: ['id', 'firstName', 'lastName'],
      // },

      {
        model: db.subgroups,
        as: 'consequenceSubgroup',
        attributes: ['id', 'name'],
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

      if (filter.branches && filter.branches.length > 0) {
        where = {
          ...where,
          [Op.or]: [
            { '$branches.id$': { [Op.or]: filter.branches } },
            {
              '$antecedentUser.branches.id$': { [Op.or]: filter.branches }, // Filter by the user's branch ID
            },
          ],
        };
      }
      if (filter.description) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'newconstraintgenerator',
            'description',
            filter.description,
          ),
        };
      }
      if (filter.alias) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'newconstraintgenerator',
            'alias',
            filter.alias,
          ),
        };
      }
      if (filter.minRange) {
        const [start, end] = filter.minRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            min: {
              ...where.min,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            min: {
              ...where.min,
              [Op.lte]: end,
            },
          };
        }
      }
      if (filter.maxRange) {
        const [start, end] = filter.maxRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            max: {
              ...where.max,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            max: {
              ...where.max,
              [Op.lte]: end,
            },
          };
        }
      }
      if (filter.startRange) {
        const [start, end] = filter.startRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            start: {
              ...where.start,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            start: {
              ...where.start,
              [Op.lte]: end,
            },
          };
        }
      }
      if (filter.endRange) {
        const [start, end] = filter.endRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            end: {
              ...where.end,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            end: {
              ...where.end,
              [Op.lte]: end,
            },
          };
        }
      }
      if (filter.weightRange) {
        const [start, end] = filter.weightRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            weight: {
              ...where.weight,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            weight: {
              ...where.weight,
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
      if (filter.constraintType) {
        where = {
          ...where,
          constraintType: filter.constraintType,
        };
      }
      if (filter.antecedentType) {
        where = {
          ...where,
          antecedentType: filter.antecedentType,
        };
      }
      if (filter.consequenceType) {
        where = {
          ...where,
          consequenceType: filter.consequenceType,
        };
      }
      if (filter.antecedentTypeDaySelection) {
        where = {
          ...where,
          antecedentTypeDaySelection: filter.antecedentTypeDaySelection,
        };
      }
      if (filter.consequenceTypeDaySelection) {
        where = {
          ...where,
          consequenceTypeDaySelection: filter.consequenceTypeDaySelection,
        };
      }
      if (filter.frequency) {
        where = {
          ...where,
          frequency: filter.frequency,
        };
      }
      if (filter.units) {
        where = {
          ...where,
          units: filter.units,
        };
      }
      if (filter.consequenceTypeEachOrAll) {
        where = {
          ...where,
          consequenceTypeEachOrAll: filter.consequenceTypeEachOrAll,
        };
      }
      if (filter.antecedentTypeEachOrAll) {
        where = {
          ...where,
          antecedentTypeEachOrAll: filter.antecedentTypeEachOrAll,
        };
      }
      if (filter.disabled) {
        where = {
          ...where,
          disabled: filter.disabled,
        };
      }

      if (filter.rollover) {
        where = {
          ...where,
          rollover: filter.rollover,
        };
      }
      if (filter.fromHome) {
        where = {
          ...where,
          fromHome: filter.fromHome,
        };
      }
      if (filter.soft) {
        where = {
          ...where,
          soft: filter.soft,
        };
      }
      if (filter.all) {
        where = {
          ...where,
          all: filter.all,
        };
      }
      if (filter.noLimit) {
        where = {
          ...where,
          noLimit: filter.noLimit,
        };
      }
      if (filter.grouping) {
        var listItems = filter.grouping.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          groupingId: { [Op.or]: listItems },
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

    let newConstraintIds = [];
    let numberOfNewConstraints = 0;

    let queryOptionForGettingTheIds = {
      where,
      //attributes: ['id'],
      group: ['id'],
      include: [
        {
          attributes: ['id', 'companyId'],
          model: db.users,
          as: 'createdBy',
          paranoid: false,
        },
        {
          attributes: [],
          model: db.branches,
          as: 'branches',
          through: { attributes: [] },
        },
        {
          model: db.users,
          as: 'antecedentUser',
          include: {
            attributes: [],
            model: db.branches,
            as: 'branches',
            through: { attributes: [] },
          },
          //attributes: ['id', 'firstName', 'lastName'],
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
        subQuery: false,
      };
    }

    const results = await db.newconstraintgenerator.findAll(
      queryOptionForGettingTheIds,
    );

    newConstraintIds = results;
    numberOfNewConstraints = results.length;

    const newConstraintIdsParsed = JSON.parse(JSON.stringify(newConstraintIds));
    const newConstraintIDArray = newConstraintIdsParsed.map(
      (newConstraint) => newConstraint.id,
    );

    newConstraintIDArray.push('thisIsPushedForHandlingEmptyCase');

    let rows = await db.newconstraintgenerator.findAll({
      where: {
        id: { [Op.or]: newConstraintIDArray },
      },
      include,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
      //logging: console.log,
      benchmark: true,
    });

    rows.forEach((row, index) => {
      let b = [];

      rows[index]['dataValues']['antecedentTypeRoles'] = new Array();
      rows[index]['dataValues']['antecedentTypeUsers'] = new Array();
      rows[index]['dataValues']['antecedentTypeSubgroups'] = new Array();
      rows[index]['dataValues']['antecedentTypeBranches'] = new Array();
      rows[index]['dataValues']['antecedentTypeLocations'] = new Array();

      rows[index]['dataValues']['consequenceTypeRoles'] = new Array();
      rows[index]['dataValues']['consequenceTypeUsers'] = new Array();
      rows[index]['dataValues']['consequenceTypeSubgroups'] = new Array();
      rows[index]['dataValues']['consequenceTypeBranches'] = new Array();
      rows[index]['dataValues']['consequenceTypeLocations'] = new Array();

      rows[index]['dataValues']['minSeconds'] =
        rows[index]['dataValues']['min'];
      rows[index]['dataValues']['maxSeconds'] =
        rows[index]['dataValues']['max'];

      if (
        rows[index]['dataValues']['constraintType'] === 'time' ||
        rows[index]['dataValues']['constraintType'] === 'gaps' ||
        rows[index]['dataValues']['constraintType'] === 'authorization' ||
        rows[index]['dataValues']['constraintType'] === 'sessionlength' ||
        rows[index]['dataValues']['constraintType'] === 'drive'
      ) {
        if (rows[index]['dataValues']['units'] === 'unit') {
          rows[index]['dataValues']['min'] = Number(
            (rows[index]['dataValues']['min'] / (15 * 60)).toFixed(2),
          );
          rows[index]['dataValues']['max'] = Number(
            (rows[index]['dataValues']['max'] / (15 * 60)).toFixed(2),
          );
          rows[index]['dataValues']['offset'] = Number(
            (rows[index]['dataValues']['offset'] / (15 * 60)).toFixed(2),
          );
        }

        if (rows[index]['dataValues']['units'] === 'minutes') {
          rows[index]['dataValues']['min'] = Number(
            (rows[index]['dataValues']['min'] / 60).toFixed(2),
          );
          rows[index]['dataValues']['max'] = Number(
            (rows[index]['dataValues']['max'] / 60).toFixed(2),
          );
          rows[index]['dataValues']['offset'] = Number(
            (rows[index]['dataValues']['offset'] / 60).toFixed(2),
          );
        }

        if (rows[index]['dataValues']['units'] === 'hours') {
          rows[index]['dataValues']['min'] = Number(
            (rows[index]['dataValues']['min'] / (60 * 60)).toFixed(2),
          );
          rows[index]['dataValues']['max'] = Number(
            (rows[index]['dataValues']['max'] / (60 * 60)).toFixed(2),
          );
          rows[index]['dataValues']['offset'] = Number(
            (rows[index]['dataValues']['offset'] / (60 * 60)).toFixed(2),
          );
        }
      }

      if (rows[index]['dataValues']['constraintType'] === 'breakQuantity') {
        if (rows[index]['dataValues']['units'] === 'unit') {
          rows[index]['dataValues']['max'] = Number(
            (rows[index]['dataValues']['max'] / (15 * 60)).toFixed(2),
          );
        }

        if (rows[index]['dataValues']['units'] === 'minutes') {
          rows[index]['dataValues']['max'] = Number(
            (rows[index]['dataValues']['max'] / 60).toFixed(2),
          );
        }

        if (rows[index]['dataValues']['units'] === 'hours') {
          rows[index]['dataValues']['max'] = Number(
            (rows[index]['dataValues']['max'] / (60 * 60)).toFixed(2),
          );
        }
      }

      if (rows[index]['dataValues']['constraintType'] === 'distance') {
        if (rows[index]['dataValues']['units'] === 'miles') {
          rows[index]['dataValues']['min'] = Number(
            (rows[index]['dataValues']['min'] / 1610).toFixed(2),
          );
          rows[index]['dataValues']['max'] = Number(
            (rows[index]['dataValues']['max'] / 1610).toFixed(2),
          );
        }

        if (rows[index]['dataValues']['units'] === 'kilometers') {
          rows[index]['dataValues']['min'] = Number(
            (rows[index]['dataValues']['min'] / 1000).toFixed(2),
          );
          rows[index]['dataValues']['max'] = Number(
            (rows[index]['dataValues']['max'] / 1000).toFixed(2),
          );
        }
      }

      //antecedentType
      if (rows[index]['dataValues']['antecedentUserId']) {
        rows[index]['dataValues']['antecedentTypeUsers'].push({
          id: '',
          users: [{ id: rows[index]['dataValues']['antecedentUserId'] }],
          //users: [rows[index]['dataValues']['antecedentUser']],
        });
      }

      if (rows[index]['dataValues']['antecedentRole']) {
        rows[index]['dataValues']['antecedentTypeRoles'].push({
          id: '',
          roles: [rows[index]['dataValues']['antecedentRole']],
        });
      }

      if (rows[index]['dataValues']['antecedentSubgroup']) {
        rows[index]['dataValues']['antecedentTypeSubgroups'].push({
          id: '',
          subgroups: [rows[index]['dataValues']['antecedentSubgroup']],
        });
      }

      if (rows[index]['dataValues']['antecedentLocationId']) {
        rows[index]['dataValues']['antecedentTypeLocations'].push({
          id: '',
          locations: [
            { id: rows[index]['dataValues']['antecedentLocationId'] },
          ],
          //locations: [rows[index]['dataValues']['antecedentLocation']],
        });
      }

      //consequenceType
      if (rows[index]['dataValues']['consequenceUserId']) {
        rows[index]['dataValues']['consequenceTypeUsers'].push({
          id: '',
          users: [{ id: rows[index]['dataValues']['consequenceUserId'] }],
          //users: [rows[index]['dataValues']['consequenceUser']],
        });
      }

      if (rows[index]['dataValues']['consequenceRole']) {
        rows[index]['dataValues']['consequenceTypeRoles'].push({
          id: '',
          roles: [rows[index]['dataValues']['consequenceRole']],
        });
      }

      if (rows[index]['dataValues']['consequenceSubgroup']) {
        rows[index]['dataValues']['consequenceTypeSubgroups'].push({
          id: '',
          subgroups: [rows[index]['dataValues']['consequenceSubgroup']],
        });
      }

      if (rows[index]['dataValues']['consequenceLocationId']) {
        rows[index]['dataValues']['consequenceTypeLocations'].push({
          id: '',
          locations: [
            { id: rows[index]['dataValues']['consequenceLocationId'] },
          ],
          //locations: [rows[index]['dataValues']['consequenceLocation']],
        });
      }

      b = rows[index]['dataValues']['antecedentTypeRoles'].map((t) =>
        t.roles.map((r) => r.name),
      );

      rows[index]['dataValues']['antecedentTypeRoles_filtered'] =
        b.length == 0 ? [[]] : b;

      b = rows[index]['dataValues']['consequenceTypeRoles'].map((t) =>
        t.roles.map((r) => r.name),
      );

      rows[index]['dataValues']['consequenceTypeRoles_filtered'] =
        b.length == 0 ? [[]] : b;

      b = rows[index]['dataValues']['antecedentTypeUsers'].map((t) =>
        t.users.map((r) => r.id),
      );

      rows[index]['dataValues']['antecedentTypeUsers_filtered'] =
        b.length == 0 ? [[]] : b;

      b = rows[index]['dataValues']['consequenceTypeUsers'].map((t) =>
        t.users.map((r) => r.id),
      );

      rows[index]['dataValues']['consequenceTypeUsers_filtered'] =
        b.length == 0 ? [[]] : b;

      b = rows[index]['dataValues']['antecedentTypeSubgroups'].map((t) =>
        t.subgroups.map((r) => r.name),
      );

      rows[index]['dataValues']['antecedentTypeSubgroups_filtered'] =
        b.length == 0 ? [[]] : b;

      b = rows[index]['dataValues']['consequenceTypeSubgroups'].map((t) =>
        t.subgroups.map((r) => r.name),
      );

      rows[index]['dataValues']['consequenceTypeSubgroups_filtered'] =
        b.length == 0 ? [[]] : b;

      b = rows[index]['dataValues']['antecedentTypeBranches'].map((t) =>
        t.branches.map((r) => r.id),
      );

      rows[index]['dataValues']['antecedentTypeBranches_filtered'] =
        b.length == 0 ? [[]] : b;

      b = rows[index]['dataValues']['consequenceTypeBranches'].map((t) =>
        t.branches.map((r) => r.id),
      );

      rows[index]['dataValues']['consequenceTypeBranches_filtered'] =
        b.length == 0 ? [[]] : b;

      const convert_day_to_index = (day) => {
        if (day == 'Sunday') return 0;
        else if (day == 'Monday') return 1;
        else if (day == 'Tuesday') return 2;
        else if (day == 'Wednesday') return 3;
        else if (day == 'Thursday') return 4;
        else if (day == 'Friday') return 5;
        else return 6;
      };

      rows[index]['dataValues']['grouping_filtered'] = rows[index][
        'dataValues'
      ]['grouping']
        ? rows[index]['dataValues']['grouping']['name']
        : '';
    });

    return { rows: rows, count: numberOfNewConstraints };
  }

  static async findForScheduler(filter, options) {
    if (filter.branches) {
      filter.branches = await BranchesDBApi.getDescendentAndAncestorBranches({
        branchIds: filter.branches,
      });
    }

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        model: db.users,
        as: 'antecedentUser',
        attributes: ['id', 'firstName', 'lastName'],
        include: [
          {
            model: db.branches,
            as: 'branches',
            attributes: ['id', 'name'],
          },
        ],
      },
      {
        model: db.branches,
        as: 'branches',
        attributes: ['id', 'name'],
      },
    ];

    if (filter) {
      if (filter.branches && filter.branches.length > 0) {
        where = {
          ...where,
          [Op.or]: [
            { '$branches.id$': { [Op.or]: filter.branches } },
            {
              '$antecedentUser.branches.id$': { [Op.or]: filter.branches }, // Filter by the user's branch ID
            },
          ],
        };
      }
    }

    const rows = await db.newconstraintgenerator.findAll({
      attributes: ['id', 'constraintType', 'description', 'createdAt', 'soft'],
      where: where,
      include,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
      benchmark: true,
    });

    const updatedRows = JSON.parse(JSON.stringify(rows)).map((r) => ({
      id: r.id,
      constraintType: r.constraintType,
      description: r.description,
      soft: r.soft,
    }));

    return updatedRows;
  }

  static async findForTable(filter, options) {
    if (filter.branches) {
      filter.branches = await BranchesDBApi.getDescendentAndAncestorBranches({
        branchIds: filter.branches,
      });
    }

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        attributes: ['id'],
        model: db.users,
        as: 'createdBy',
        paranoid: false,
      },
      {
        model: db.users,
        as: 'antecedentUser',
        attributes: ['id', 'firstName', 'lastName'],
        include: [
          {
            model: db.branches,
            as: 'branches',
            attributes: ['id', 'name'],
          },
        ],
      },
      {
        model: db.branches,
        as: 'branches',
        attributes: ['id', 'name'],
      },
    ];

    if (filter) {
      if (filter.companyId) {
        where = {
          ...where,
          ['$createdBy.companyId$']: Utils.uuid(filter.companyId),
        };
      }
      if (filter.branches && filter.branches.length > 0) {
        where = {
          ...where,
          [Op.or]: [
            { '$branches.id$': { [Op.or]: filter.branches } },
            {
              '$antecedentUser.branches.id$': { [Op.or]: filter.branches }, // Filter by the user's branch ID
            },
          ],
        };
      }
      if (filter.constraintType) {
        where = {
          ...where,
          constraintType: filter.constraintType,
        };
      }
      if (filter.disabled) {
        where = {
          ...where,
          disabled: filter.disabled,
        };
      }
      if (filter.soft) {
        where = {
          ...where,
          soft: filter.soft,
        };
      }
    }

    const queries = {
      attributes: [
        'id',
        'constraintType',
        'description',
        'soft',
        'disabled',
        'createdAt',
      ],
      where: where,
      include,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
      benchmark: true,
    };
    if (filter.limit && filter.page) {
      let limitOffset = Utils.getLimitOffset(filter.limit, filter.page);
      queries.limit = limitOffset.lim;
      queries.offset = limitOffset.off;
      queries.subQuery = false;
    }
    const { rows, count } = await db.newconstraintgenerator.findAndCountAll(
      queries,
    );

    return { rows, count };
  }

  static async findConstraintsForUserSpecific(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    let where = {
      disabled: false,
    };
    let include = [
      {
        model: db.branches,
        as: 'branches',
        attributes: ['id', 'name'],
        through: {
          attributes: [],
        },
      },
      {
        model: db.users,
        as: 'antecedentUser',
        attributes: ['id', 'firstName', 'lastName'],
      },
      {
        model: db.roles,
        as: 'antecedentRole',
        attributes: ['id', 'name'],
      },

      {
        model: db.users,
        as: 'antecedentLocation',
        attributes: ['id', 'firstName', 'lastName'],
      },

      {
        model: db.subgroups,
        as: 'antecedentSubgroup',
        attributes: ['id', 'name'],
      },

      {
        model: db.users,
        as: 'consequenceUser',
        attributes: ['id', 'firstName', 'lastName'],
      },
      {
        model: db.roles,
        as: 'consequenceRole',
        attributes: ['id', 'name'],
      },

      {
        model: db.users,
        as: 'consequenceLocation',
        attributes: ['id', 'firstName', 'lastName'],
      },

      {
        model: db.subgroups,
        as: 'consequenceSubgroup',
        attributes: ['id', 'name'],
      },
    ];

    if (filter.id) {
      where = {
        ...where,
        id: filter.id,
      };
    }

    where = {
      ...where,
      ['$branches.id$']: { [Op.or]: [null, ...filter.branches] },
      ['$antecedentRole.name$']: { [Op.or]: [null, ...filter.roles] },
      ['$antecedentSubgroup.id$']: { [Op.or]: [null, ...filter.subgroups] },
      ['$antecedentUser.id$']: { [Op.or]: [null, filter.userId] },
    };

    if (filter.date) {
      where = {
        ...where,
        start: { [Op.lte]: filter.date },
        end: { [Op.gt]: filter.date },
      };
    }

    if (filter.start && filter.end) {
      where = {
        ...where,
        start: { [Op.lte]: filter.end },
        end: { [Op.gt]: filter.start },
      };
    }

    let rows = await db.newconstraintgenerator.findAll({
      where: where,
      include,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
      benchmark: true,
    });

    let parsedConstraints = JSON.parse(JSON.stringify(rows));

    return { rows: parsedConstraints, count: parsedConstraints.length };
  }

  static async findConstraintsForBulkUser(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    let where = {
      disabled: false,
    };
    let include = [
      {
        model: db.branches,
        as: 'branches',
        attributes: ['id', 'name'],
        through: {
          attributes: [],
        },
      },
      {
        attributes: ['id', 'firstName', 'lastName'],
        model: db.users,
        as: 'createdBy',
      },
      {
        model: db.users,
        as: 'antecedentUser',
        attributes: ['id', 'firstName', 'lastName'],
      },
      {
        model: db.roles,
        as: 'antecedentRole',
        attributes: ['id', 'name'],
      },

      {
        model: db.users,
        as: 'antecedentLocation',
        attributes: ['id', 'firstName', 'lastName'],
      },

      {
        model: db.subgroups,
        as: 'antecedentSubgroup',
        attributes: ['id', 'name'],
      },

      {
        model: db.users,
        as: 'consequenceUser',
        attributes: ['id', 'firstName', 'lastName'],
      },
      {
        model: db.roles,
        as: 'consequenceRole',
        attributes: ['id', 'name'],
      },

      {
        model: db.users,
        as: 'consequenceLocation',
        attributes: ['id', 'firstName', 'lastName'],
      },

      {
        model: db.subgroups,
        as: 'consequenceSubgroup',
        attributes: ['id', 'name'],
      },
    ];

    if (filter.id) {
      where = {
        ...where,
        id: filter.id,
      };
    }

    if (filter.companyId) {
      where = {
        ...where,
        ['$createdBy.companyId$']: Utils.uuid(filter.companyId),
      };
    }

    where = {
      ...where,
      ['$branches.id$']: { [Op.or]: [null, ...filter.branches] },
      ['$antecedentRole.name$']: { [Op.or]: [null, ...filter.roles] },
      ['$antecedentSubgroup.id$']: { [Op.or]: [null, ...filter.subgroups] },
      ['$antecedentUser.id$']: { [Op.or]: [null, ...filter.userIds] },
    };

    if (filter.date) {
      where = {
        ...where,
        start: { [Op.lte]: filter.date },
        end: { [Op.gt]: filter.date },
      };
    }

    if (filter.start && filter.end) {
      where = {
        ...where,
        start: { [Op.lte]: filter.end },
        end: { [Op.gt]: filter.start },
      };
    }

    if (filter.constraintTypes && filter.constraintTypes.length > 0){
      where = {
        ...where,
        constraintType: { [Op.in]: filter.constraintTypes },
      };
    }

    let rows = await db.newconstraintgenerator.findAll({
      where: where,
      include,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
      benchmark: true,
    });

    let parsedConstraints = JSON.parse(JSON.stringify(rows));

    return { rows: parsedConstraints, count: parsedConstraints.length };
  }

  static async findAllAutocomplete(query, limit) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike('newconstraintgenerator', 'id', query),
        ],
      };
    }

    const records = await db.newconstraintgenerator.findAll({
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

  static async clearPreviousRelations(where, options) {
    const transaction = (options && options.transaction) || undefined;
    let include = [
      {
        model: db.usergroups,
        as: 'antecedentTypeUsers',
        through: {
          attributes: [],
        },
        attributes: ['id'],
      },
      {
        model: db.usergroups,
        as: 'consequenceTypeUsers',
        through: {
          attributes: [],
        },
        attributes: ['id'],
      },
      {
        model: db.rolegroups,
        as: 'antecedentTypeRoles',
        through: {
          attributes: [],
        },
        attributes: ['id'],
      },
      {
        model: db.rolegroups,
        as: 'consequenceTypeRoles',
        through: {
          attributes: [],
        },
        attributes: ['id'],
      },
      {
        model: db.subgroupgroups,
        as: 'antecedentTypeSubgroups',
        through: {
          attributes: [],
        },
        attributes: ['id'],
      },
      {
        model: db.subgroupgroups,
        as: 'consequenceTypeSubgroups',
        through: {
          attributes: [],
        },
        attributes: ['id'],
      },
      {
        model: db.branchgroups,
        as: 'antecedentTypeBranches',
        through: {
          attributes: [],
        },
        attributes: ['id'],
      },
      {
        model: db.branchgroups,
        as: 'consequenceTypeBranches',
        through: {
          attributes: [],
        },
        attributes: ['id'],
      },
    ];

    // get related group IDs
    let getPrevRelationIDs = await db.newconstraintgenerator.findAll({
      attributes: ['id'],
      where,
      include,
      transaction,
    });

    const prevRelations = JSON.parse(JSON.stringify(getPrevRelationIDs));

    let relations = prevRelations[0];
    relations.antecedentTypeUsers = relations.antecedentTypeUsers.map(
      (i) => i.id,
    );
    relations.consequenceTypeUsers = relations.consequenceTypeUsers.map(
      (i) => i.id,
    );
    relations.antecedentTypeRoles = relations.antecedentTypeRoles.map(
      (i) => i.id,
    );
    relations.consequenceTypeRoles = relations.consequenceTypeRoles.map(
      (i) => i.id,
    );
    relations.antecedentTypeSubgroups = relations.antecedentTypeSubgroups.map(
      (i) => i.id,
    );
    relations.consequenceTypeSubgroups = relations.consequenceTypeSubgroups.map(
      (i) => i.id,
    );
    relations.antecedentTypeBranches = relations.antecedentTypeBranches.map(
      (i) => i.id,
    );
    relations.consequenceTypeBranches = relations.consequenceTypeBranches.map(
      (i) => i.id,
    );

    //delete usergroups
    let antUser = await UsergroupsDBApi.deleteBulkWithChilds({
      Ids: relations.antecedentTypeUsers,
      transaction: transaction,
    });
    let consUser = await UsergroupsDBApi.deleteBulkWithChilds({
      Ids: relations.consequenceTypeUsers,
      transaction: transaction,
    });

    //delete rolegroups
    let antRole = await RolegroupsDBApi.deleteBulkWithChilds({
      Ids: relations.antecedentTypeRoles,
      transaction: transaction,
    });
    let consRole = await RolegroupsDBApi.deleteBulkWithChilds({
      Ids: relations.consequenceTypeRoles,
      transaction: transaction,
    });

    //delete branchgroups
    let antBranch = await BranchgroupsDBApi.deleteBulkWithChilds({
      Ids: relations.antecedentTypeBranches,
      transaction: transaction,
    });
    let consBranch = await BranchgroupsDBApi.deleteBulkWithChilds({
      Ids: relations.consequenceTypeBranches,
      transaction: transaction,
    });

    //delete subgroupgroups
    let antSubgroup = await SubgroupgroupsDBApi.deleteBulkWithChilds({
      Ids: relations.antecedentTypeSubgroups,
      transaction: transaction,
    });
    let consSubgroup = await SubgroupgroupsDBApi.deleteBulkWithChilds({
      Ids: relations.consequenceTypeSubgroups,
      transaction: transaction,
    });
  }

  static async findAuthorazitionsOfBranch(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        model: db.users,
        as: 'antecedentUser',
        attributes: ['id', 'firstName', 'lastName'],
        include: [
          {
            attributes: ['id', 'name'],
            model: db.branches,
            as: 'branches',
            through: { attributes: [] },
          },
        ],
      },

      {
        model: db.users,
        as: 'createdBy',
        paranoid: false,
        attributes: ['id', 'firstName'],
      },
      {
        model: db.users,
        as: 'antecedentTypeActivity',
        attributes: ['id', 'firstName', 'lastName'],
      },
    ];

    where = {
      constraintType: 'authorization',
    };

    if (filter) {
      if (filter?.branches?.length > 0) {
        where = {
          ...where,
          ['$antecedentUser.branches.id$']: {
            [Op.or]: [null, ...filter.branches],
          },
        };
      }

      if (filter.companyId) {
        where = {
          ...where,
          ['$createdBy.companyId$']: Utils.uuid(filter.companyId),
        };
      }

      if (filter.start && filter.end) {
        where = {
          ...where,
          start: { [Op.lte]: filter.end },
          end: { [Op.gt]: filter.start },
        };
      }
    }

    let rows = await db.newconstraintgenerator.findAll({
      attributes: ['id', 'start', 'end', 'min', 'max', 'units', 'offset'],
      where: where,
      include,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
      benchmark: true,
    });

    let parsedConstraints = JSON.parse(JSON.stringify(rows));

    return { rows: parsedConstraints, count: parsedConstraints.length };
  }
};
