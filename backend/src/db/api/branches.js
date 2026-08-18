const db = require('../models');
const Utils = require('../utils');
const BranchesCacheApi = require('../../cache/branches');
const ValidationError = require('../../services/notifications/errors/validation');
const getWholeBranchStructure = require('../../utils/getWholeBranchStructure');

const moment = require('moment');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class BranchesDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    await BranchesCacheApi.removeBranches();

    const branches = await db.branches.create(
      {
        id: data.id || undefined,
        name: data.name || null,
        replyToEmail: data.replyToEmail || null,
        timezone: data.timezone || null,
        importHash: data.importHash || null,
        schedulerLocked: data.schedulerLocked || false,
        inactive: data.inactive || false,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await branches.setBranchType(data.branchType || null, {
      transaction,
    });

    await branches.setParent(data.parent || null, {
      transaction,
    });

    await branches.setUser(data.user || null, {
      transaction,
    });

    const output = branches.get({ plain: true });
    output.branchType = await branches.getBranchType({
      transaction,
    });
    output.parent = await branches.getParent({
      transaction,
    });

    const parsedRows = JSON.parse(JSON.stringify(output));
    return parsedRows;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const branches = await db.branches.findByPk(id, {
      transaction,
    });

    await BranchesCacheApi.removeBranches();

    await branches.update(
      {
        name: data.name || null,
        replyToEmail: data.replyToEmail || null,
        timezone: data.timezone || null,
        updatedById: currentUser.id,
        inactive: data.inactive ?? undefined,
      },
      { transaction },
    );

    await branches.setBranchType(data.branchType || null, {
      transaction,
    });

    await branches.setParent(data.parent || null, {
      transaction,
    });

    await branches.setUser(data.user || null, {
      transaction,
    });

    const output = branches.get({ plain: true });

    output.branchType = await branches.getBranchType({
      transaction,
    });

    output.parent = await branches.getParent({
      transaction,
    });

    const parsedRows = JSON.parse(JSON.stringify(output));
    return parsedRows;
  }

  static async updateSchedulerLocked(id, currentUser) {
    const branch = await db.branches.findByPk(id);

    if (!branch) {
      return 404;
    }

    const currentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS');
    await branch.update({
      schedulerLocked: !branch.schedulerLocked,
      updatedById: currentUser.id,
      updatedAt: currentDateTime,
    });

    return JSON.parse(JSON.stringify(branch));
  }

  static async checkIfAnyLockedBranchExist(ids) {
    const lockedBranches = await db.branches.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
        schedulerLocked: true,
      },
    });

    return lockedBranches.length > 0;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const branches = await db.branches.findByPk(id, options);
    if (!branches) {
      throw new ValidationError('branches.notFound');
    }

    let numberOfChildren = await db.branches.count({
      where: {
        parentId: branches.dataValues.id,
      },
    });

    if (numberOfChildren > 0) {
      throw new ValidationError('branches.hasChild');
    }

    await BranchesCacheApi.removeBranches();

    await branches.update({ deletedBy: currentUser.id }, { transaction });
    await branches.destroy({
      transaction,
    });

    return branches;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const branches = await db.branches.findOne({ where }, { transaction });

    if (!branches) {
      return branches;
    }

    const output = branches.get({ plain: true });

    output.branchType = await branches.getBranchType({
      transaction,
    });

    output.parent = await branches.getParent({
      transaction,
    });

    output.user = await branches.getUser({
      transaction,
    });

    return output;
  }

  static async findRelatedActiveUserNumber(id, options) {
    const transaction = (options && options.transaction) || undefined;

    const activeUserNumber = await db.sequelize.query(
      `SELECT COUNT(*) AS userCount 
         FROM usersBranchesBranches ubb 
   INNER JOIN users u ON ubb.userId = u.id 
        WHERE ubb.branchId = :branchId 
          AND u.deletedAt IS NULL`,
      {
        replacements: { branchId: id },
        type: db.sequelize.QueryTypes.SELECT,
      },
    );
    return activeUserNumber[0].userCount;
  }

  static async findByBranchName(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    const currentUser = (options && options.currentUser) || { id: null };

    let where = {
      name: filter.name,
    };
    if (options.currentUser.companyId) {
      where = {
        ...where,
        ['$createdBy.companyId$']: Utils.uuid(currentUser.companyId),
      };
    }
    let include = [
      {
        model: db.users,
        as: 'createdBy',
        paranoid: false,
        attributes: ['companyId'],
      },
    ];

    let rows = await db.branches.findAll({
      where,
      include,
      attributes: ['id'],
      transaction,
    });
    const parsedRows = JSON.parse(JSON.stringify(rows));

    return parsedRows;
  }

  static async findBranchName(filter, options) {
    const transaction = (options && options.transaction) || undefined;

    let where = {
      id: filter.id,
    };

    let query = {
      attributes: ['id', 'name', 'replyToEmail'],
      where: where,
      transaction,
      benchmark: true,
    };

    const branch = await db.branches.findOne(query);

    let parsedbranch = JSON.parse(JSON.stringify(branch));

    return { name: parsedbranch.name, replyToEmail: parsedbranch.replyToEmail };
  }

  static async findBranchStructure(filter) {
    // get branch hierarchy , and then use it when generating for each user
    let nodes = await BranchesDBApi.getBranchIdParentIds({
      companyId: filter.companyId,
    });

    const structuredBranches = getWholeBranchStructure(nodes);
    return structuredBranches;
  }

  static async findAllOptimizer(filter, options) {
    // if (filter.companyId) {
    //   const cachedCompanyBranches = await BranchesCacheApi.getCompanyBranches(filter.companyId);
    //   if (cachedCompanyBranches && cachedCompanyBranches.length) {
    //     return { rows: cachedCompanyBranches, count: cachedCompanyBranches.length };
    //   }
    // }

    let limitOffset = Utils.getLimitOffset(filter.limit, filter.page);

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        model: db.users,
        as: 'createdBy',
        paranoid: false,
        attributes: ['id', 'firstName'],
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }
      if (filter.branches) {
        var branchIds = filter.branches.split('|').map((item) => {
          return Utils.uuid(item);
        });
        where = {
          ...where,
          id: { [Op.or]: branchIds },
        };
      }

      if (filter.companyId) {
        where = {
          ...where,
          ['$createdBy.companyId$']: Utils.uuid(filter.companyId),
        };
      }

      if (filter.name) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('branches', 'name', filter.name),
        };
      }

      if (filter.parentName) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('parent', 'name', filter.parentName),
        };
      }

      // There is no active field on branch in database.
      // I do not know why this filter is added here
      // I guess it might be copied from other place
      // that is why I commented it !!!!

      // if (
      //   filter.active === true ||
      //   filter.active === 'true' ||
      //   filter.active === false ||
      //   filter.active === 'false'
      // ) {
      //   where = {
      //     ...where,
      //     active: filter.active === true || filter.active === 'true',
      //   };
      // }

      if (filter.branchType) {
        var branchTypeIds = filter.branchType.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          branchTypeId: { [Op.or]: branchTypeIds },
        };
      }

      if (filter.parent) {
        var ParentIds = filter.parent.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          parentId: { [Op.or]: ParentIds },
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

    let queryOptions = {
      where,
      include,
      //attributes: ['id', 'drivetime'],
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['name', 'asc']],
      transaction,
    };

    let { rows, count } = await db.branches.findAndCountAll(queryOptions);

    const parsedRows = JSON.parse(JSON.stringify(rows));
    // if (filter.companyId) {
    //   await BranchesCacheApi.createCompanyBranches(filter.companyId, parsedRows);
    // }
    return { rows: parsedRows, count: count };
  }

  static async findAll(filter, options) {
    // if (filter.companyId) {
    //   const cachedCompanyBranches = await BranchesCacheApi.getCompanyBranches(filter.companyId);
    //   if (cachedCompanyBranches && cachedCompanyBranches.length) {
    //     return { rows: cachedCompanyBranches, count: cachedCompanyBranches.length };
    //   }
    // }

    let limitOffset = Utils.getLimitOffset(filter.limit, filter.page);

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        model: db.branchtype,
        as: 'branchType',
      },
      {
        model: db.branches,
        as: 'parent',
        attributes: ['id', 'name', 'branchTypeId'],
      },
      {
        model: db.users,
        as: 'createdBy',
        paranoid: false,
        attributes: ['id', 'firstName'],
      },
      {
        model: db.users,
        as: 'user',
        attributes: ['id', 'firstName'],
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }
      if (filter.branches) {
        var branchIds = filter.branches.split('|').map((item) => {
          return Utils.uuid(item);
        });
        where = {
          ...where,
          id: { [Op.or]: branchIds },
        };
      }

      if (filter.companyId) {
        where = {
          ...where,
          ['$createdBy.companyId$']: Utils.uuid(filter.companyId),
        };
      }

      if (filter.name) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('branches', 'name', filter.name),
        };
      }

      if (filter.parentName) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('parent', 'name', filter.parentName),
        };
      }

      if ([true, 'true', false, 'false'].includes(filter.inactive)) {
        where = {
          ...where,
          inactive: JSON.parse(filter.inactive),
        };
      }

      // There is no active field on branch in database.
      // I do not know why this filter is added here
      // I guess it might be copied from other place
      // that is why I commented it !!!!

      // if (
      //   filter.active === true ||
      //   filter.active === 'true' ||
      //   filter.active === false ||
      //   filter.active === 'false'
      // ) {
      //   where = {
      //     ...where,
      //     active: filter.active === true || filter.active === 'true',
      //   };
      // }

      if (filter.branchType) {
        var branchTypeIds = filter.branchType.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          branchTypeId: { [Op.or]: branchTypeIds },
        };
      }

      if (filter.parent) {
        var ParentIds = filter.parent.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          parentId: { [Op.or]: ParentIds },
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

    let queryOptions = {
      where,
      include,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['name', 'asc']],
      transaction,
      //logging: console.log,
      //benchmark: true,
    };

    if (
      limitOffset.lim >= 0 &&
      limitOffset.off >= 0 &&
      (filter.expandable == 'false' ||
        filter.expandable == false ||
        !filter.expandable)
    ) {
      queryOptions.limit = limitOffset.lim;
      queryOptions.offset = limitOffset.off;
    }

    if (filter.expandable == 'true' || filter.expandable == true) {
      queryOptions.where = {};
      if (filter.companyId) {
        queryOptions.where = {
          ['$createdBy.companyId$']: Utils.uuid(filter.companyId),
        };
      }
      // get all branches
      let rows = await db.branches.findAll(queryOptions);
      const parsedRows = rows;

      let results = new Array();
      let subordinateMap = new Map();
      if (!filter.expandedRows) {
        filter.expandedRows = new Array();
        filter.expandedRows.push(null);
      }
      for (let i = 0; i < parsedRows.length; i++) {
        // set the subordinates
        if (!subordinateMap.has(parsedRows[i].parentId)) {
          subordinateMap.set(parsedRows[i].parentId, new Array());
        }
        subordinateMap.get(parsedRows[i].parentId).push(parsedRows[i].id);

        //filter the branches in js side (not in mysql)
        let expandedRowsContainParent = filter.expandedRows.includes(
          parsedRows[i].parentId,
        );
        let expandedRowsContainCurrent = filter.expandedRows.includes(
          parsedRows[i].id,
        );

        if (expandedRowsContainParent || expandedRowsContainCurrent)
          results.push(parsedRows[i]);
      }

      // set subordinates to each of branch
      for (let p = 0; p < results.length; p++) {
        if (!subordinateMap.has(results[p].id)) {
          results[p].dataValues.subordinateIds = new Array();
          continue;
        }
        results[p].dataValues.subordinateIds = subordinateMap.get(results[p].id);
      }

      return { rows: results, count: results.length };
    }

    let { rows, count }  = await db.branches.findAndCountAll(queryOptions);

    return { rows: rows, count: count };
  }

  static async findAllAutocomplete(query, limit, filter) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike('branches', 'name', query),
        ],
      };
    }

    if (filter.branchTypeIds && filter.branchTypeIds.length > 0) {
      where = {
        ...where,
        branchTypeId: { [Op.or]: filter.branchTypeIds },
      };
    }

    const records = await db.branches.findAll({
      attributes: ['id', 'name'],
      include: [
        {
          model: db.users,
          as: 'createdBy',
          paranoid: false,
        },
      ],
      where: {
        ...where,
        ['$createdBy.companyId$']: Utils.uuid(filter.companyId),
      },

      limit: limit ? Number(limit) : undefined,
      orderBy: [['name', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.name,
    }));
  }

  static async getBranchStructures(filter) {
    let filteredBranches = filter.branchIds.split('|');
    let branchStructuresCache = [];
    let notExistingBranchStructuresCache = [];

    for (const branchId of filteredBranches) {
      // find structures of branchId from cache
      const structuredBranch = await BranchesCacheApi.findStructuredBranch(
        filter.companyId,
        branchId,
      );
      if (structuredBranch) {
        // if exists add it to branchStructures
        branchStructuresCache.push(structuredBranch);
      } else {
        // if not exists get all structured branches
        notExistingBranchStructuresCache.push(branchId);
      }
    }
    if (notExistingBranchStructuresCache.length) {
      const bran = await BranchesDBApi.findBranchStructure({
        companyId: filter.companyId,
      });
      for (const branchId of notExistingBranchStructuresCache) {
        if (bran[branchId]) {
          await BranchesCacheApi.createStructuredBranch(
            filter.companyId,
            branchId,
            bran[branchId],
          );

          branchStructuresCache = [...branchStructuresCache, bran[branchId]];
        }
      }
    }
    return branchStructuresCache.flatMap((branch) => branch).join('|');
  }

  static async getDescendentBranches(filter) {
    let filteredBranches = filter.branchIds.split('|');

    let mustBeChecked = filteredBranches;

    let queryOptions = {
      attributes: ['id', 'parentId'],
    };

    let rows = await db.branches.findAll(queryOptions);
    const branches = JSON.parse(JSON.stringify(rows));

    let parentChildBranch = new Map();

    for (let i = 0; i < branches.length; i++) {
      if (!parentChildBranch.has(branches[i].parentId)) {
        let childs = [branches[i].id, branches[i].parentId];
        parentChildBranch.set(branches[i].parentId, childs);
      } else {
        parentChildBranch.get(branches[i].parentId).push(branches[i].id);
      }

      if (!parentChildBranch.has(branches[i].id)) {
        let childs = [branches[i].id];
        parentChildBranch.set(branches[i].id, childs);
      }
    }

    for (let j = 0; j < mustBeChecked.length; j++) {
      let childs = parentChildBranch.get(mustBeChecked[j]);
      if (childs) {
        for (let m = 0; m < childs.length; m++) {
          if (!mustBeChecked.includes(childs[m])) {
            mustBeChecked.push(childs[m]);
          }
        }
      }
    }
    return mustBeChecked;
  }

  static async getChildrenBranchtypes(filter) {
    if (!filter.branchId) {
      return [];
    }

    let queryOptions = {
      where: {
        parentId: filter.branchId,
      },
      attributes: ['branchTypeId'],
    };

    let rows = await db.branches.findAll(queryOptions);
    const result = JSON.parse(JSON.stringify(rows));

    return result;
  }

  static async getDescendentAndAncestorBranches(filter) {
    let filteredBranches = filter.branchIds.split('|');

    let requestedBranchesAndTheirParents = [];
    for (let i = 0; i < filteredBranches.length; i++) {
      requestedBranchesAndTheirParents.push(filteredBranches[i]);
    }
    let requestedBranchesAndTheirChilds = filteredBranches;

    let queryOptions = {
      attributes: ['id', 'parentId'],
    };

    let rows = await db.branches.findAll(queryOptions);
    const branches = JSON.parse(JSON.stringify(rows));

    let parentChildBranch = new Map();
    let childParentBranch = new Map();

    for (let i = 0; i < branches.length; i++) {
      if (!parentChildBranch.has(branches[i].parentId)) {
        let childs = [branches[i].id, branches[i].parentId];
        parentChildBranch.set(branches[i].parentId, childs);
      } else {
        parentChildBranch.get(branches[i].parentId).push(branches[i].id);
      }

      if (!parentChildBranch.has(branches[i].id)) {
        let childs = [branches[i].id];
        parentChildBranch.set(branches[i].id, childs);
      }

      childParentBranch.set(branches[i].id, branches[i].parentId);
    }

    // fill with the child branches
    for (let j = 0; j < requestedBranchesAndTheirChilds.length; j++) {
      let childs = parentChildBranch.get(requestedBranchesAndTheirChilds[j]);
      if (!childs) {
        continue;
      }
      for (let m = 0; m < childs.length; m++) {
        if (!requestedBranchesAndTheirChilds.includes(childs[m])) {
          requestedBranchesAndTheirChilds.push(childs[m]);
        }
      }
    }

    // fill the way up till main branch
    for (let j = 0; j < requestedBranchesAndTheirParents.length; j++) {
      let parent = childParentBranch.get(requestedBranchesAndTheirParents[j]);
      if (!parent) {
        continue;
      }
      if (parent && !requestedBranchesAndTheirParents.includes(parent)) {
        requestedBranchesAndTheirParents.push(parent);
      }
    }

    return [
      ...new Set([
        ...requestedBranchesAndTheirChilds,
        ...requestedBranchesAndTheirParents,
      ]),
    ];
  }

  static async getAncestorBranches(filter) {
    let requestedBranchesAndTheirParents = filter.branchIds.split('|');

    let queryOptions = {
      attributes: ['id', 'parentId'],
    };

    let rows = await db.branches.findAll(queryOptions);
    const branches = JSON.parse(JSON.stringify(rows));

    let parentChildBranch = new Map();
    let childParentBranch = new Map();

    for (let i = 0; i < branches.length; i++) {
      if (!parentChildBranch.has(branches[i].parentId)) {
        let childs = [branches[i].id, branches[i].parentId];
        parentChildBranch.set(branches[i].parentId, childs);
      } else {
        parentChildBranch.get(branches[i].parentId).push(branches[i].id);
      }

      if (!parentChildBranch.has(branches[i].id)) {
        let childs = [branches[i].id];
        parentChildBranch.set(branches[i].id, childs);
      }

      childParentBranch.set(branches[i].id, branches[i].parentId);
    }

    // fill the way up till main branch
    for (let j = 0; j < requestedBranchesAndTheirParents.length; j++) {
      let parent = childParentBranch.get(requestedBranchesAndTheirParents[j]);
      if (!parent) {
        continue;
      }
      if (parent && !requestedBranchesAndTheirParents.includes(parent)) {
        requestedBranchesAndTheirParents.push(parent);
      }
    }

    return [
      ...new Set(requestedBranchesAndTheirParents),
    ];
  }

  static async getBranchIdParentIds(filter) {
    let queryOptions = {
      where: {
        ['$createdBy.companyId$']: Utils.uuid(filter.companyId),
      },
      include: [
        {
          model: db.users,
          as: 'createdBy',
          paranoid: false,
          attributes: [],
        },
      ],
      attributes: ['id', 'parentId'],
    };

    let rows = await db.branches.findAll(queryOptions);
    const branches = JSON.parse(JSON.stringify(rows));
    return branches;
  }

  static async getAncestorBranchesOfEachBranch(filter) {
    let queryOptions = {
      attributes: ['id', 'parentId'],
    };

    let rows = await db.branches.findAll(queryOptions);
    const branches = JSON.parse(JSON.stringify(rows));

    let childParentBranch = new Map();

    for (let i = 0; i < branches.length; i++) {
      childParentBranch.set(branches[i].id, branches[i].parentId);
    }

    let res = new Map();
    for (let i = 0; i < filter.branches.length; i++) {
      let current = {
        id: filter.branches[i],
        parents: new Array(),
      };

      let currentBranch = filter.branches[i];

      while (
        childParentBranch.has(currentBranch) &&
        childParentBranch.get(currentBranch) !== null
      ) {
        currentBranch = childParentBranch.get(currentBranch);
        current.parents.push(currentBranch);
      }

      res.set(current.id, current.parents);
    }

    return res;
  }

  static async getAntecedentBranchesSchedulerLock(
    branchId,
    companyId,
    getAllHierarchy,
  ) {
    if (!branchId || !companyId) {
      return { branches: [], hasLock: false };
    }
    // Step 1: Fetch all branches in one query
    const rows = await db.branches.findAll({
      attributes: ['id', 'parentId', 'schedulerLocked', 'name'],
      where: {
        ['$createdBy.companyId$']: Utils.uuid(companyId),
      },
      include: [
        {
          model: db.users,
          as: 'createdBy',
          attributes: [],
          paranoid: false,
        },
      ],
    });

    const allBranches = JSON.parse(JSON.stringify(rows));

    // Step 2: Create a map for quick lookup by id
    const branchMap = {};
    allBranches.forEach((branch) => {
      branchMap[branch.id] = branch;
    });

    // Step 3: Recursively build the ancestry chain
    let branches = [];
    let hasLock = false;
    let currentBranchId = branchId;

    let loopCount = 0;
    const maxLoops = 20000;

    while (currentBranchId) {
      if (loopCount >= maxLoops) {
        throw new Error('Branch loops more than 20,000 times');
      }
      loopCount++;

      const branch = branchMap[currentBranchId];
      if (!branch) break;

      branches.push(branch);
      if (branch.schedulerLocked) {
        hasLock = true;
        if (!getAllHierarchy) break;
      }
      if (branch.parentId == currentBranchId) break;
      currentBranchId = branch.parentId;
    }

    return { branches, hasLock };
  }
};
