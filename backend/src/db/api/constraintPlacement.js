const db = require('../models');
const Utils = require('../utils');
module.exports = class ConstraintPlacementDBApi {
  static async create(data, options) {
    const transaction = (options && options.transaction) || undefined;

    const constraintPlacement = await db.constraintPlacement.create(
      {
        id: data.id || undefined,
        userId: data.userId,
        constraintId: data.constraintId,
        rank: data.rank,
        importance: data.importance,
        flagging: data.flagging ?? false,
        solutionGenerator: data.solutionGenerator ?? false,
        optimizer: data.optimizer ?? false,
      },
      { transaction },
    );

    await constraintPlacement.setUser(data.userId || null, {
      transaction,
    });
    await constraintPlacement.setConstraint(data.constraintId || null, {
      transaction,
    });
    await constraintPlacement.setBranch(data.branchId || null, {
      transaction,
    });

    const output = constraintPlacement.get({ plain: true });

    const parsedRows = JSON.parse(JSON.stringify(output));
    return parsedRows;
  }

  static async update(id, data, options) {
    const transaction = (options && options.transaction) || undefined;

    const constraintPlacement = await db.constraintPlacement.findByPk(id, {
      transaction,
    });

    await constraintPlacement.update(
      {
        userId: data.userId,
        constraintId: data.constraintId,
        rank: data.rank,
        importance: data.importance,
        flagging: data.flagging ?? false,
        solutionGenerator: data.solutionGenerator ?? false,
        optimizer: data.optimizer ?? false,
      },
      { transaction },
    );

    await constraintPlacement.setUser(data.userId || null, {
      transaction,
    });
    await constraintPlacement.setConstraint(data.constraintId || null, {
      transaction,
    });
    await constraintPlacement.setBranch(data.branchId || null, {
      transaction,
    });

    return true;
  }
  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const constraintPlacement = await db.constraintPlacement.findOne(
      { where },
      { transaction },
    );

    if (!constraintPlacement) {
      return constraintPlacement;
    }

    const output = constraintPlacement.get({ plain: true });

    return output;
  }
  static async findAll(filter) {
    let where = {};
    let include = [
      {
        model: db.users,
        as: 'user',
        attributes: ['id'],
      },
      {
        model: db.branches,
        as: 'branch',
        attributes: ['id'],
      },
      {
        model: db.newconstraintgenerator,
        as: 'constraint',
        attributes: ['id', 'description', 'constraintType', 'soft'],
      },
    ];

    if (filter) {
      if (filter.userId) {
        where = {
          ...where,
          userId: Utils.uuid(filter.userId),
        };
      }
      if (filter.branchId) {
        where = {
          ...where,
          branchId: Utils.uuid(filter.branchId),
        };
      }
    }

    let queryOptions = {
      where,
      include,
    };

    let rows = await db.constraintPlacement.findAll(queryOptions);

    const parsedRows = JSON.parse(JSON.stringify(rows));
    return parsedRows;
  }
};
